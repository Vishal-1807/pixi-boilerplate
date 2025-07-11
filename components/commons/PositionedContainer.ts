import { Container, Graphics } from 'pixi.js';

interface PositionedContainerConfig {
  gameContainerWidth: number;
  gameContainerHeight: number;
  height: number | string;
  topPercentage: number; // 0-100, percentage from top
  backgroundColor?: number | string;
  borderColor?: number | string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  marginLeft?: number;
  marginRight?: number;
}

interface PositionedContainerResult {
  container: Container;
  contentArea: Container;
  background: Graphics;
  updatePosition: (gameContainerWidth: number, gameContainerHeight: number) => void;
  updateDimensions: (gameContainerWidth: number, gameContainerHeight: number) => void;
  setHeight: (newHeight: number | string) => void;
  setTopPercentage: (percentage: number) => void;
  getActualBounds: () => { x: number; y: number; width: number; height: number };
}

/**
 * Converts a color (hex string or number) to a number for Pixi.js
 */
const parseColor = (color: number | string | undefined): number => {
  if (color === undefined) return 0x000000; // Default to black if undefined
  if (typeof color === 'number') return color;
  // Remove '#' and handle short form (e.g., #FFF)
  const cleanColor = color.replace('#', '');
  const hex = cleanColor.length === 3 
    ? cleanColor.split('').map(c => c + c).join('') // Expand #FFF to #FFFFFF
    : cleanColor;
  return parseInt(hex, 16);
};

/**
 * Creates a positioned container with specified height and top percentage
 * Width matches the game container width
 */
export const createPositionedContainer = (config: PositionedContainerConfig): PositionedContainerResult => {
  const {
    gameContainerWidth,
    gameContainerHeight,
    height,
    topPercentage,
    backgroundColor = 0x1A2C38, // Default as hex number
    borderColor,
    borderWidth = 0,
    borderRadius = 0,
    opacity = 1,
    marginLeft = 0,
    marginRight = 0,
  } = config;

  // Main container
  const mainContainer = new Container();
  mainContainer.sortableChildren = true;

  // Background graphics
  const background = new Graphics();
  
  // Content area where child elements go
  const contentArea = new Container();
  contentArea.sortableChildren = true;

  // Add to main container
  mainContainer.addChild(background);
  mainContainer.addChild(contentArea);

  // Store current values
  let currentHeight = height;
  let currentTopPercentage = topPercentage;

  /**
   * Calculates the actual height value from number or percentage string
   */
  const calculateActualHeight = (gameContainerHeight: number): number => {
    if (typeof currentHeight === 'string' && currentHeight.endsWith('%')) {
      const percentage = parseFloat(currentHeight.replace('%', ''));
      return (gameContainerHeight * percentage) / 100;
    }
    return typeof currentHeight === 'number' ? currentHeight : parseFloat(currentHeight.toString());
  };

  /**
   * Draws the background with current settings
   */
  const drawBackground = (containerWidth: number, containerHeight: number) => {
    const actualWidth = containerWidth - marginLeft - marginRight;
    const actualHeight = calculateActualHeight(containerHeight);

    background.clear();
    
    if (borderWidth > 0 && borderColor !== undefined) {
      // Draw border first
      if (borderRadius > 0) {
        background.roundRect(0, 0, actualWidth, actualHeight, borderRadius);
      } else {
        background.rect(0, 0, actualWidth, actualHeight);
      }
      background.fill({ color: parseColor(borderColor) });

      // Draw inner background
      const innerPadding = borderWidth;
      const innerWidth = actualWidth - (innerPadding * 2);
      const innerHeight = actualHeight - (innerPadding * 2);

      if (borderRadius > 0) {
        background.roundRect(
          innerPadding,
          innerPadding,
          innerWidth,
          innerHeight,
          Math.max(0, borderRadius - innerPadding)
        );
      } else {
        background.rect(innerPadding, innerPadding, innerWidth, innerHeight);
      }
      background.fill({ color: parseColor(backgroundColor) });
    } else {
      // No border, just background
      if (borderRadius > 0) {
        background.roundRect(0, 0, actualWidth, actualHeight, borderRadius);
      } else {
        background.rect(0, 0, actualWidth, actualHeight);
      }
      background.fill({ color: parseColor(backgroundColor) });
    }

    // Set opacity
    background.alpha = opacity;
  };

  /**
   * Updates the position of the container
   */
  const updatePosition = (gameContainerWidth: number, gameContainerHeight: number) => {
    // Position horizontally (accounting for margins)
    mainContainer.x = marginLeft;

    // Position vertically based on percentage
    const yPosition = (gameContainerHeight * currentTopPercentage) / 100;
    mainContainer.y = yPosition;

    // Redraw background with new width and height
    drawBackground(gameContainerWidth, gameContainerHeight);

    // Update content area position (inside border if present)
    contentArea.x = borderWidth;
    contentArea.y = borderWidth;

    const actualHeight = calculateActualHeight(gameContainerHeight);
    console.log(`📐 Positioned container updated: ${gameContainerWidth - marginLeft - marginRight}x${actualHeight} at (${mainContainer.x}, ${mainContainer.y}), ${currentTopPercentage}% from top`);
  };

  /**
   * Updates dimensions and repositions
   */
  const updateDimensions = (gameContainerWidth: number, gameContainerHeight: number) => {
    updatePosition(gameContainerWidth, gameContainerHeight);
  };

  /**
   * Sets a new height for the container
   */
  const setHeight = (newHeight: number | string) => {
    currentHeight = newHeight;
    // Trigger redraw with current dimensions
    const bounds = mainContainer.parent?.getBounds();
    if (bounds) {
      updatePosition(bounds.width, bounds.height);
    }
  };

  /**
   * Sets a new top percentage
   */
  const setTopPercentage = (percentage: number) => {
    currentTopPercentage = Math.max(0, Math.min(100, percentage));
    // Trigger repositioning with current dimensions
    const bounds = mainContainer.parent?.getBounds();
    if (bounds) {
      updatePosition(bounds.width, bounds.height);
    }
  };

  /**
   * Gets the actual bounds of the container
   */
  const getActualBounds = () => {
    const actualHeight = calculateActualHeight(gameContainerHeight);
    return {
      x: mainContainer.x,
      y: mainContainer.y,
      width: gameContainerWidth - marginLeft - marginRight,
      height: actualHeight
    };
  };

  // Initialize
  updatePosition(gameContainerWidth, gameContainerHeight);

  return {
    container: mainContainer,
    contentArea,
    background,
    updatePosition,
    updateDimensions,
    setHeight,
    setTopPercentage,
    getActualBounds
  };
};

/**
 * Creates a simple positioned container with minimal styling
 */
export const createSimplePositionedContainer = (
  gameContainerWidth: number,
  gameContainerHeight: number,
  height: number | string,
  topPercentage: number,
  backgroundColor: number | string = 0x1A2C38
): PositionedContainerResult => {
  return createPositionedContainer({
    gameContainerWidth,
    gameContainerHeight,
    height,
    topPercentage,
    backgroundColor
  });
};

/**
 * Creates a styled positioned container with border and rounded corners
 */
export const createStyledPositionedContainer = (
  gameContainerWidth: number,
  gameContainerHeight: number,
  height: number | string,
  topPercentage: number,
  backgroundColor: number | string = 0x1A2C38,
  borderColor: number | string = 0x304553,
  borderWidth: number = 2,
  borderRadius: number = 8
): PositionedContainerResult => {
  return createPositionedContainer({
    gameContainerWidth,
    gameContainerHeight,
    height,
    topPercentage,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius
  });
};

/**
 * Creates a container with horizontal margins
 */
export const createMarginedPositionedContainer = (
  gameContainerWidth: number,
  gameContainerHeight: number,
  height: number | string,
  topPercentage: number,
  marginHorizontal: number = 10,
  backgroundColor: number | string = 0x1A2C38
): PositionedContainerResult => {
  return createPositionedContainer({
    gameContainerWidth,
    gameContainerHeight,
    height,
    topPercentage,
    backgroundColor,
    marginLeft: marginHorizontal,
    marginRight: marginHorizontal
  });
};