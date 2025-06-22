import { Container, Sprite, Assets, Text, TextStyle } from "pixi.js";
import { createButton } from "./commons/Button";

/**
 * Creates the bet tab with increment/decrement buttons and text display
 */
const createBetTab = (appWidth: number, appHeight: number) => {
    // Layout constants
    const BAR_HEIGHT_RATIO = 0.17;
    const BUTTON_WIDTH_RATIO = 0.12;
    const INCREMENT_WIDTH_RATIO = 0.3;
    const INCREMENT_HEIGHT_RATIO = 0.9;
    const GROUP_X_RATIO = 0.03;
    const GROUP_Y_RATIO = 0.88;
    const BUTTON_HEIGHT_RATIO = 0.6;

    const container = new Container();
    container.zIndex = 110;

    const barHeight = appHeight * BAR_HEIGHT_RATIO;

    // Bet state
    let currentBetAmount = 1.00;
    let betSteps = [0.10, 0.25, 0.50, 1.00, 2.50, 5.00, 10.00, 25.00, 50.00, 100.00];
    let currentBetIndex = 3; // Default to 1.00

    // Create bet amount text displays
    let betAmountText: Text; // Always visible text on the bet tab
    let gameplayBetText: Text; // Larger text shown during gameplay
    let areBetButtonsDisabled = false;

    /**
     * Create bet amount text display (always visible)
     */
    const createBetAmountText = () => {
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fontWeight: 'bold',
            fill: 0x7DE8EB,
            align: 'center',
            stroke: 0x000000,
        });

        betAmountText = new Text({
            text: `${currentBetAmount.toFixed(2)}`,
            style: textStyle
        });
        
        betAmountText.anchor.set(0.5);
        container.addChild(betAmountText);
        
        return betAmountText;
    };

    /**
     * Create gameplay bet text display (shown during gameplay instead of +/- buttons)
     */
    const createGameplayBetText = () => {
        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: 0x7DE8EB,
            align: 'center',
            stroke: 0x000000,
        });

        gameplayBetText = new Text({
            text: `Bet: ${currentBetAmount.toFixed(2)}`,
            style: textStyle
        });
        
        gameplayBetText.anchor.set(0.5);
        gameplayBetText.visible = false; // Initially hidden
        container.addChild(gameplayBetText);
        
        return gameplayBetText;
    };

    const disableBetButtons = () => {
        console.log('💰 BetTab: Disabling bet buttons');
        areBetButtonsDisabled = true;
        
        if (minusBetButton) {
            minusBetButton.eventMode = 'none';
            minusBetButton.alpha = 0;
            minusBetButton.cursor = 'default';
        }
        
        if (plusBetButton) {
            plusBetButton.eventMode = 'none';
            plusBetButton.alpha = 0;
            plusBetButton.cursor = 'default';
        }
    };

    /**
     * Enable bet buttons
     */
    const enableBetButtons = () => {
        console.log('💰 BetTab: Enabling bet buttons');
        areBetButtonsDisabled = false;
        
        if (minusBetButton) {
            minusBetButton.eventMode = 'static';
            minusBetButton.alpha = 1.0;
            minusBetButton.cursor = 'pointer';
        }
        
        if (plusBetButton) {
            plusBetButton.eventMode = 'static';
            plusBetButton.alpha = 1.0;
            plusBetButton.cursor = 'pointer';
        }
    };

    /**
     * Handle bet decrease
     */
    const handleBetDecrease = () => {
        if (areBetButtonsDisabled) {
            console.log('💰 Bet decrease blocked - buttons are disabled');
            return;
        }
        
        if (currentBetIndex > 0) {
            currentBetIndex = currentBetIndex - 1;
            const newAmount = betSteps[currentBetIndex];
            currentBetAmount = newAmount;
            
            console.log(`💰 Bet decreased to: ${newAmount}`);
            updateBetDisplay();
        } else {
            // Wrap around to last bet step
            currentBetIndex = betSteps.length - 1;
            const newAmount = betSteps[currentBetIndex];
            currentBetAmount = newAmount;
            console.log(`💰 Bet wrapped to: ${newAmount}`);
            updateBetDisplay();
        }
    };

    /**
     * Handle bet increase
     */
    const handleBetIncrease = () => {
        if (areBetButtonsDisabled) {
            console.log('💰 Bet increase blocked - buttons are disabled');
            return;
        }
        
        if (currentBetIndex < betSteps.length - 1) {
            currentBetIndex = currentBetIndex + 1;
            const newAmount = betSteps[currentBetIndex];
            currentBetAmount = newAmount;
            
            console.log(`💰 Bet increased to: ${newAmount}`);
            updateBetDisplay();
        } else {
            // Wrap around to first bet step
            currentBetIndex = 0;
            const newAmount = betSteps[currentBetIndex];
            currentBetAmount = newAmount;
            console.log(`💰 Bet wrapped to: ${newAmount}`);
            updateBetDisplay();
        }
    };

    /**
     * Handle bet tab click (could show bet history or options)
     */
    const handleBetTabClick = () => {
        console.log('💰 Bet tab clicked - current bet:', currentBetAmount);
    };

    /**
     * Update bet display text
     */
    const updateBetDisplay = () => {
        console.log(`💰 Current bet display: ${currentBetAmount}`);
        
        // Update both text displays
        if (betAmountText) {
            betAmountText.text = `${currentBetAmount.toFixed(2)}`;
        }
        if (gameplayBetText) {
            gameplayBetText.text = `Bet: ${currentBetAmount.toFixed(2)}`;
        }
    };

    /**
     * Switch to text display mode (during gameplay)
     */
    const switchToTextMode = () => {
        console.log('💰 BetTab: Switching to text display mode');

        disableBetButtons();
        if (betAmountText) {
            betAmountText.visible = false;
        }
        if (gameplayBetText) {
            gameplayBetText.visible = true;
            updateBetDisplay();
        }
    };

    /**
     * Switch to interactive mode (when game ends)
     */
    const switchToInteractiveMode = () => {
        console.log('💰 BetTab: Switching to interactive mode');
        enableBetButtons();
        if (betAmountText) {
            betAmountText.visible = true;
        }
        if (gameplayBetText) {
            gameplayBetText.visible = false;
        }
    };

    // Create buttons
    const minusBetButton = createButton({
        texture: Assets.get('betTabMinus'),
        width: 50,
        height: 50,
        x: 0,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        onClick: handleBetDecrease
    });
    container.addChild(minusBetButton);

    const betTab = createButton({
        texture: Assets.get('betTab'),
        width: 100,
        height: 50,
        x: 50,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        onClick: handleBetTabClick
    });
    container.addChild(betTab);

    const plusBetButton = createButton({
        texture: Assets.get('betTabPlus'),
        width: 50,
        height: 50,
        x: 150,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        onClick: handleBetIncrease
    });
    container.addChild(plusBetButton);

    /**
     * Comprehensive layout update function
     */
    const updateLayout = (width: number, height: number) => {
        const barHeight = height * BAR_HEIGHT_RATIO;
        
        // Calculate responsive button dimensions
        const buttonWidth = width * BUTTON_WIDTH_RATIO;
        const buttonHeight = barHeight * BUTTON_HEIGHT_RATIO;
        const incrementButtonWidth = buttonWidth * INCREMENT_WIDTH_RATIO;
        const incrementButtonHeight = buttonHeight * INCREMENT_HEIGHT_RATIO;
        
        // Position the entire bet tab group
        const groupX = width * GROUP_X_RATIO;
        const groupY = height - barHeight * GROUP_Y_RATIO;
        
        // Update minus bet button
        minusBetButton.width = incrementButtonWidth * 1.2;
        minusBetButton.height = incrementButtonHeight;
        minusBetButton.x = groupX - incrementButtonWidth * 0.2;
        minusBetButton.y = groupY + incrementButtonHeight * 0.1;

        // Update bet tab (main button)
        betTab.width = buttonWidth;
        betTab.height = incrementButtonHeight;
        betTab.x = groupX + incrementButtonWidth - width * 0.003;
        betTab.y = groupY + incrementButtonHeight * 0.1;

        // Update plus bet button
        plusBetButton.width = incrementButtonWidth * 1.2;
        plusBetButton.height = incrementButtonHeight;
        plusBetButton.x = betTab.x + betTab.width * 0.98;
        plusBetButton.y = groupY + incrementButtonHeight * 0.1;

        // Update bet amount text position and size (always visible)
        if (betAmountText) {
            betAmountText.x = betTab.x + (betTab.width / 2);
            betAmountText.y = betTab.y + (betTab.height / 2);
            
            const fontSize = Math.min(25, Math.max(12, buttonHeight * 0.4));
            betAmountText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: fontSize,
                fontWeight: 'bold',
                fill: 0x7DE8EB,
                align: 'center',
                stroke: 0x000000,
            });
        }

        // Update gameplay bet text position and size (shown during gameplay)
        if (gameplayBetText) {
            const centerX = (minusBetButton.x + plusBetButton.x + plusBetButton.width) / 2;
            gameplayBetText.x = centerX;
            gameplayBetText.y = betTab.y + (betTab.height / 2);
            
            const fontSize = betTab.height * 0.4;
            gameplayBetText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: fontSize,
                fontWeight: 'bold',
                fill: 0x7DE8EB,
                align: 'center',
                stroke: 0x000000,
            });
        }
        
        // Call button resize methods if available
        [betTab, minusBetButton, plusBetButton].forEach(button => {
            if ((button as any).resize) {
                (button as any).resize(width, height);
            }
        });
    };

    // Initialize components
    createBetAmountText();
    createGameplayBetText();
    updateLayout(appWidth, appHeight);
    
    // Expose public interface
    (container as any).resize = updateLayout;
    (container as any).updateBetDisplay = updateBetDisplay;
    (container as any).switchToTextMode = switchToTextMode;
    (container as any).switchToInteractiveMode = switchToInteractiveMode;
    (container as any).enableBetButtons = enableBetButtons;
    (container as any).disableBetButtons = disableBetButtons;
    (container as any).setBetSteps = (steps: number[]) => {
        betSteps = steps;
        // Reset to valid index if current index is out of bounds
        if (currentBetIndex >= betSteps.length) {
            currentBetIndex = 0;
            currentBetAmount = betSteps[currentBetIndex];
            updateBetDisplay();
        }
    };
    (container as any).setBetAmount = (amount: number) => {
        const index = betSteps.indexOf(amount);
        if (index !== -1) {
            currentBetIndex = index;
            currentBetAmount = amount;
            updateBetDisplay();
        }
    };
    (container as any).getBetAmount = () => currentBetAmount;
    (container as any).getBetSteps = () => [...betSteps];
    
    return container;
};

export default createBetTab;