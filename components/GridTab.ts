import { Container, Sprite, Assets, Text, TextStyle } from "pixi.js";
import { createButton } from "./commons/Button";
import { createGridSelector } from "./commons/GridSelector";

/**
 * Creates the grid tab with integrated grid selector and text display
 */
const createGridTab = (appWidth: number, appHeight: number, appStage: Container) => {
    // Layout constants
    const BAR_HEIGHT_RATIO = 0.17;
    const BUTTON_WIDTH_RATIO = 0.17;
    const BUTTON_HEIGHT_RATIO = 0.58;
    const GROUP_X_RATIO = 1.1;
    const GROUP_Y_RATIO = 0.8;
    const SELECTOR_X_RATIO = 0.24;
    const SELECTOR_Y_RATIO = 0.15;

    const container = new Container();
    container.zIndex = 110;

    const barHeight = appHeight * BAR_HEIGHT_RATIO;

    // Grid state
    let currentCols = 5;
    let currentRows = 6;

    // Initialize grid selector and text display
    let gridSelector: ReturnType<typeof createGridSelector> | null = null;
    let gridDisplayText: Text;

    /**
     * Create grid display text (shown during gameplay)
     */
    const createGridDisplayText = () => {
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0x7DE8EB,
            align: 'center',
            stroke: 0x000000,
        });

        gridDisplayText = new Text({
            text: `${currentCols}×${currentRows}`,
            style: textStyle
        });
        
        gridDisplayText.anchor.set(0.5);
        gridDisplayText.visible = false; // Initially hidden
        container.addChild(gridDisplayText);
        
        return gridDisplayText;
    };

    /**
     * Handle grid selection change
     */
    const handleGridSelection = (option: any) => {
        console.log(`🎮 Grid selected: ${option.displayName} (${option.cols}×${option.rows})`);
        
        // Update internal state
        currentCols = option.cols;
        currentRows = option.rows;
        
        // Update text display
        updateGridDisplayText();
        
        // Add visual feedback
        showGridChangeNotification(option.displayName);
    };

    /**
     * Update grid display text with current grid dimensions
     */
    const updateGridDisplayText = () => {
        if (gridDisplayText) {
            gridDisplayText.text = `${currentCols}×${currentRows}`;
        }
    };

    /**
     * Show visual notification for grid change
     */
    const showGridChangeNotification = (gridName: string) => {
        console.log(`✨ Grid changed to: ${gridName}`);
        // Optional: Add temporary visual indicator or toast notification
    };

    /**
     * Handle grid tab click
     */
    const handleGridTabClick = () => {
        console.log('🎮 Grid tab clicked - current grid:', gridSelector?.getCurrentSelection()?.displayName);
    };

    /**
     * Switch to text display mode (during gameplay)
     */
    const switchToTextMode = () => {
        console.log('🎮 GridTab: Switching to text display mode');
        if (gridSelector) {
            gridSelector.getContainer().visible = false;
        }
        if (gridDisplayText) {
            gridDisplayText.visible = true;
            updateGridDisplayText();
        }
    };

    /**
     * Switch to interactive mode (when game ends)
     */
    const switchToInteractiveMode = () => {
        console.log('🎮 GridTab: Switching to interactive mode');
        if (gridSelector) {
            gridSelector.getContainer().visible = true;
        }
        if (gridDisplayText) {
            gridDisplayText.visible = false;
        }
    };

    // Create grid tab button
    const gridTabButton = createButton({
        texture: Assets.get('gridTab'),
        width: 100,
        height: 50,
        x: 0,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        onClick: handleGridTabClick
    });
    container.addChild(gridTabButton);

    /**
     * Create and configure grid selector
     */
    const initializeGridSelector = (width: number, height: number) => {
        const barHeight = height * BAR_HEIGHT_RATIO;
        const selectorWidth = width * 0.14;
        const selectorHeight = barHeight * 0.7;
        const selectorX = width - width * SELECTOR_X_RATIO;
        const selectorY = height - height * SELECTOR_Y_RATIO;

        gridSelector = createGridSelector({
            width: selectorWidth,
            height: selectorHeight,
            x: selectorX,
            y: selectorY,
            visibleItems: 3,
            itemSpacing: 10,
            animationDuration: 300,
            easing: 'easeOut'
        });

        // Handle grid selection changes
        gridSelector.onGridSelectionChange(handleGridSelection);

        container.addChild(gridSelector.getContainer());
        
        console.log('🎮 Grid selector initialized');
    };

    /**
     * Comprehensive layout update function
     */
    const updateLayout = (width: number, height: number) => {
        const barHeight = height * BAR_HEIGHT_RATIO;
        
        // Calculate responsive button dimensions
        const buttonWidth = width * BUTTON_WIDTH_RATIO;
        const buttonHeight = barHeight * BUTTON_HEIGHT_RATIO;
        
        // Position the entire grid tab group on the right side
        const groupX = width - buttonWidth * GROUP_X_RATIO - width * 0.06;
        const groupY = height - barHeight * GROUP_Y_RATIO;
        
        // Update grid tab button
        gridTabButton.width = buttonWidth;
        gridTabButton.height = buttonHeight;
        gridTabButton.x = groupX;
        gridTabButton.y = groupY;

        // Update grid selector if it exists
        if (gridSelector) {
            const selectorWidth = buttonWidth;
            const selectorHeight = barHeight * 0.7;
            const selectorX = width - width * SELECTOR_X_RATIO;
            const selectorY = height - height * SELECTOR_Y_RATIO;
            
            gridSelector.resize(selectorWidth, selectorHeight, selectorX, selectorY);
        }

        // Update grid display text position and size
        if (gridDisplayText) {
            gridDisplayText.x = gridTabButton.x + (gridTabButton.width / 2);
            gridDisplayText.y = gridTabButton.y + (gridTabButton.height / 2);
            
            const fontSize = Math.min(28, Math.max(16, buttonHeight * 0.35));
            gridDisplayText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: fontSize,
                fontWeight: 'bold',
                fill: 0x7DE8EB,
                align: 'center',
                stroke: 0x000000,
            });
        }
        
        if ((gridTabButton as any).resize) {
            (gridTabButton as any).resize(width, height);
        }
    };

    // Initialize components
    initializeGridSelector(appWidth, appHeight);
    createGridDisplayText();
    updateLayout(appWidth, appHeight);
    
    // Expose public interface
    (container as any).resize = updateLayout;
    (container as any).getGridSelector = () => gridSelector;
    (container as any).getCurrentGrid = () => gridSelector?.getCurrentSelection();
    (container as any).switchToTextMode = switchToTextMode;
    (container as any).switchToInteractiveMode = switchToInteractiveMode;
    (container as any).updateGridDisplayText = updateGridDisplayText;
    (container as any).setGridDimensions = (cols: number, rows: number) => {
        currentCols = cols;
        currentRows = rows;
        updateGridDisplayText();
    };
    (container as any).getGridDimensions = () => ({ cols: currentCols, rows: currentRows });
    
    // Setup cleanup
    container.on('removed', () => {
        if (gridSelector) {
            gridSelector.destroy();
            gridSelector = null;
        }
    });
    
    return container;
};

export default createGridTab;