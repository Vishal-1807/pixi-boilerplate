import { Container, Sprite, Assets, Text } from 'pixi.js'
import { createButton } from './commons/Button';
import { createSpriteFromLoadedAssets } from './commons/Sprites';

const createStartButton = (appWidth: number, appHeight: number) => {
    // Layout constants
    const BUTTON_SIZE_RATIO = 0.25;
    const BUTTON_X_RATIO = 0.87;
    const BUTTON_Y_RATIO = 0.5;
    const CLICK_DEBOUNCE_MS = 1000;

    const container = new Container();
    const buttonSize = appHeight * BUTTON_SIZE_RATIO;

    container.zIndex = 100;

    // Store references to both complete button sprites
    let startButtonSprite: any = null;
    let collectButtonSprite: any = null;
    let areButtonsInitialized = false;

    // Click debouncing
    let lastClickTime = 0;

    // Default click handlers - can be overridden
    let startClickHandler = async () => {
        console.log('Start button clicked - no handler set');
    };

    let collectClickHandler = async () => {
        console.log('Collect button clicked - no handler set');
    };

    // Internal click handlers with debouncing
    const handleStartClick = async () => {
        const now = Date.now();
        if (now - lastClickTime < CLICK_DEBOUNCE_MS) {
            console.log('Click ignored - too rapid');
            return;
        }
        lastClickTime = now;

        try {
            console.log('=== START BUTTON CLICKED ===');
            await startClickHandler();
            console.log('=== START BUTTON HANDLER COMPLETED ===');
        } catch (error) {
            console.error('=== START BUTTON HANDLER FAILED ===', error);
        }
    };

    const handleCollectClick = async () => {
        const now = Date.now();
        if (now - lastClickTime < CLICK_DEBOUNCE_MS) {
            console.log('Click ignored - too rapid');
            return;
        }
        lastClickTime = now;

        try {
            console.log('=== COLLECT BUTTON CLICKED ===');
            await collectClickHandler();
            console.log('=== COLLECT BUTTON HANDLER COMPLETED ===');
        } catch (error) {
            console.error('=== COLLECT BUTTON HANDLER FAILED ===', error);
        }
    };

    // Create start button sprite (button + start text combined)
    const createStartButtonSprite = async () => {
        try {
            console.log('Creating start button sprite...');
            
            startButtonSprite = await createSpriteFromLoadedAssets('startbuttonSprite', {
                x: appWidth * BUTTON_X_RATIO,
                y: appHeight - appHeight * BUTTON_Y_RATIO,
                width: buttonSize,
                height: buttonSize,
                animationSpeed: 0.3,
                loop: true,
                autoplay: true,
                anchor: 0
            });

            startButtonSprite.eventMode = 'static';
            startButtonSprite.cursor = 'pointer';
            startButtonSprite.zIndex = 100;
            startButtonSprite.on('pointertap', handleStartClick);

            container.addChild(startButtonSprite);
            console.log('Start button sprite created successfully');
            
        } catch (error) {
            console.error('Failed to create start button sprite:', error);
            
            // Fallback to static button
            const staticStartButton = createButton({
                texture: Assets.get('startButton'),
                width: buttonSize,
                height: buttonSize,
                x: appWidth * BUTTON_X_RATIO,
                y: appHeight / 3,
                anchorX: 0,
                anchorY: 0,
                onClick: handleStartClick,
            });
            
            startButtonSprite = staticStartButton;
            container.addChild(startButtonSprite);
            console.log('Fallback static start button created');
        }
    };

    // Create collect button sprite (button + collect text combined)
    const createCollectButtonSprite = async () => {
        try {
            console.log('Creating collect button sprite...');
            
            collectButtonSprite = await createSpriteFromLoadedAssets('collectbuttonSprite', {
                x: appWidth * BUTTON_X_RATIO,
                y: appHeight - appHeight * BUTTON_Y_RATIO,
                width: buttonSize,
                height: buttonSize,
                animationSpeed: 0.3,
                loop: true,
                autoplay: true,
                anchor: 0
            });

            collectButtonSprite.eventMode = 'static';
            collectButtonSprite.cursor = 'pointer';
            collectButtonSprite.zIndex = 100;
            collectButtonSprite.on('pointertap', handleCollectClick);

            // Initially hidden
            collectButtonSprite.visible = false;
            container.addChild(collectButtonSprite);
            
            console.log('Collect button sprite created successfully');
            
        } catch (error) {
            console.error('Failed to create collect button sprite:', error);
            
            // Fallback to static button
            const staticCollectButton = createButton({
                texture: Assets.get('collectButton'),
                width: buttonSize,
                height: buttonSize,
                x: appWidth * BUTTON_X_RATIO,
                y: appHeight / 3,
                anchorX: 0,
                anchorY: 0,
                onClick: handleCollectClick,
            });
            
            staticCollectButton.visible = false;
            collectButtonSprite = staticCollectButton;
            container.addChild(collectButtonSprite);
            console.log('Fallback static collect button created');
        }
    };

    // Enable sortable children to respect zIndex
    container.sortableChildren = true;

    // Switch to collect button (hide start, show collect)
    const switchToCollectButton = () => {
        console.log('🔄 Switching to collect button');
        
        if (startButtonSprite) {
            startButtonSprite.visible = false;
            startButtonSprite.eventMode = 'none';
        }
        
        if (collectButtonSprite) {
            collectButtonSprite.visible = true;
            collectButtonSprite.eventMode = 'static';
            collectButtonSprite.cursor = 'pointer';
        }
        
        console.log('🔄 Collect button is now visible and interactive');
    };

    // Switch to start button (hide collect, show start)
    const switchToStartButton = () => {
        console.log('🔄 Switching to start button');
        
        if (collectButtonSprite) {
            collectButtonSprite.visible = false;
            collectButtonSprite.eventMode = 'none';
        }
        
        if (startButtonSprite) {
            startButtonSprite.visible = true;
            startButtonSprite.eventMode = 'static';
            startButtonSprite.cursor = 'pointer';
        }
        
        console.log('🔄 Start button is now visible and interactive');
    };

    const hideButtons = () => {
        console.log('🫥 Hiding all buttons');
        container.visible = false;
        if (startButtonSprite) {
            startButtonSprite.eventMode = 'none';
            startButtonSprite.cursor = 'default';
        }
        if (collectButtonSprite) {
            collectButtonSprite.eventMode = 'none';
            collectButtonSprite.cursor = 'default';
        }
    };

    const showStartButton = () => {
        console.log('👁️ Showing start button');
        container.visible = true;
        switchToStartButton();
    };

    const showCollectButton = () => {
        console.log('👁️ Showing collect button');
        container.visible = true;
        switchToCollectButton();
    };

    const enableButtons = () => {
        if (startButtonSprite && startButtonSprite.visible) {
            startButtonSprite.eventMode = 'static';
            startButtonSprite.cursor = 'pointer';
            startButtonSprite.alpha = 1.0;
        }
        if (collectButtonSprite && collectButtonSprite.visible) {
            collectButtonSprite.eventMode = 'static';
            collectButtonSprite.cursor = 'pointer';
            collectButtonSprite.alpha = 1.0;
        }
    };

    const disableButtons = () => {
        if (startButtonSprite) {
            startButtonSprite.eventMode = 'none';
            startButtonSprite.cursor = 'default';
            startButtonSprite.alpha = 0.6;
        }
        if (collectButtonSprite) {
            collectButtonSprite.eventMode = 'none';
            collectButtonSprite.cursor = 'default';
            collectButtonSprite.alpha = 0.6;
        }
    };

    const updateLayout = (width: number, height: number) => {
        const newButtonSize = height * BUTTON_SIZE_RATIO;
        const newX = width * BUTTON_X_RATIO;
        const newY = height / 3;

        // Update both button sprites
        if (startButtonSprite && areButtonsInitialized) {
            startButtonSprite.width = newButtonSize;
            startButtonSprite.height = newButtonSize;
            startButtonSprite.x = newX;
            startButtonSprite.y = newY;
        }

        if (collectButtonSprite && areButtonsInitialized) {
            collectButtonSprite.width = newButtonSize;
            collectButtonSprite.height = newButtonSize;
            collectButtonSprite.x = newX;
            collectButtonSprite.y = newY;
        }

        // Call resize methods if available
        if (startButtonSprite && (startButtonSprite as any).resize) {
            (startButtonSprite as any).resize(width, height);
        }
        if (collectButtonSprite && (collectButtonSprite as any).resize) {
            (collectButtonSprite as any).resize(width, height);
        }
        
        console.log('Layout updated - button size:', newButtonSize, 'position:', { x: newX, y: newY });
    };

    // Initialize both button sprites
    const initializeButtons = async () => {
        try {
            await Promise.all([
                createStartButtonSprite(),
                createCollectButtonSprite()
            ]);
            
            areButtonsInitialized = true;
            console.log('Both button sprites initialized successfully');
            
            // Show start button by default
            showStartButton();
        } catch (error) {
            console.error('Failed to initialize button sprites:', error);
        }
    };

    // Start initialization
    initializeButtons().catch(error => {
        console.error('Failed to initialize button sprites:', error);
    });

    // Public API
    (container as any).resize = updateLayout;
    (container as any).showStartButton = showStartButton;
    (container as any).showCollectButton = showCollectButton;
    (container as any).hideButtons = hideButtons;
    (container as any).switchToStartButton = switchToStartButton;
    (container as any).switchToCollectButton = switchToCollectButton;
    (container as any).enableButtons = enableButtons;
    (container as any).disableButtons = disableButtons;
    (container as any).setStartClickHandler = (handler: () => Promise<void>) => {
        startClickHandler = handler;
    };
    (container as any).setCollectClickHandler = (handler: () => Promise<void>) => {
        collectClickHandler = handler;
    };
    (container as any).setClickDebounce = (ms: number) => {
        // Allow customization of debounce time if needed
        console.log(`Click debounce set to ${ms}ms`);
    };

    // Cleanup on removal
    container.on('removed', () => {
        // Clean up sprites
        if (startButtonSprite) {
            if (startButtonSprite.stop) startButtonSprite.stop();
            if (startButtonSprite.destroy) startButtonSprite.destroy();
        }
        if (collectButtonSprite) {
            if (collectButtonSprite.stop) collectButtonSprite.stop();
            if (collectButtonSprite.destroy) collectButtonSprite.destroy();
        }
    });

    return container;
}

export default createStartButton;