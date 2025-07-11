import { Container, Sprite, Graphics, Text, Texture } from 'pixi.js';

export interface ButtonOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: number | string;
  borderColor?: number | string;
  borderWidth?: number;
  borderRadius?: number;
  texture?: Sprite;
  hoverTint?: number | string;
  disabled?: boolean;
  onClick?: () => void;
  label?: string | number;
  textColor?: number | string;
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

export function createButton(options: ButtonOptions = {}): Container {
  // Default values
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 50,
    color = 0xcccccc,
    borderColor = 0x000000,
    borderWidth = 2,
    borderRadius = 0,
    texture,
    hoverTint = 0xaaaaaa,
    disabled = false,
    onClick,
    label = '',
    textColor = 0x000000, // Default to black
  } = options;

  // State
  let isDisabled = disabled;
  let isHovered = false;

  // Create container
  const button = new Container();

  // Set position
  button.position.set(x, y);

  // Create shadow for raised effect
  const shadow = new Graphics();
  const shadowOffset = 5; // Shadow offset for raised effect
  const shadowColor = 0x000000;
  const shadowAlpha = 0.3;
  if (texture) {
    // For textured buttons, draw a rounded rectangle shadow
    shadow.beginFill(shadowColor, shadowAlpha);
    shadow.drawRoundedRect(
      -width / 2 + shadowOffset,
      -height / 2 + shadowOffset,
      width,
      height,
      borderRadius
    );
    shadow.endFill();
  } else {
    // For non-textured buttons, draw a rounded rectangle shadow
    shadow.beginFill(shadowColor, shadowAlpha);
    shadow.drawRoundedRect(
      -width / 2 + shadowOffset,
      -height / 2 + shadowOffset,
      width,
      height,
      borderRadius
    );
    shadow.endFill();
  }
  shadow.zIndex = -1; // Ensure shadow is behind background

  // Create background
  let background: Sprite | Graphics;
  if (texture) {
    background = new Sprite(texture);
    background.width = width;
    background.height = height;
    background.anchor.set(0.5); // Center sprite
  } else {
    background = new Graphics();
    background.beginFill(parseColor(color));
    background.lineStyle(borderWidth, parseColor(borderColor));
    background.drawRoundedRect(-width / 2, -height / 2, width, height, borderRadius);
    background.endFill();
  }
  background.zIndex = 0; // Ensure background is above shadow

  // Add children with proper layering
  button.addChild(shadow);
  button.addChild(background);

  // Create text label
  let text: Text | null = null;
  if (label !== undefined) {
    text = new Text(label.toString(), { // Convert number to string if necessary
      fontFamily: 'Arial',
      fontSize: Math.min(width, height) * 0.4, // Scale font size based on button size
      fill: parseColor(textColor), // Use parsed text color
      align: 'center',
    });
    text.anchor.set(0.5); // Center text
    text.position.set(0, 0); // Center within button
    text.zIndex = 1; // Ensure text is above background
    button.addChild(text);
  }

  // Enable sorting by zIndex
  button.sortableChildren = true;

  // Set container pivot to center
  button.pivot.set(0, 0); // Graphics is already centered via drawRoundedRect; sprite via anchor

  // Enable interactivity
  button.interactive = true;
  button.cursor = 'pointer';

  // Event handlers
  const onPointerOver = () => {
    if (!isDisabled) {
      isHovered = true;
      background.tint = parseColor(hoverTint);
    }
  };

  const onPointerOut = () => {
    if (!isDisabled) {
      isHovered = false;
      background.tint = 0xffffff; // Reset tint
    }
  };

  const onPointerDown = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  // Apply disabled state
  const setDisabled = (disable: boolean) => {
    isDisabled = disable;
    button.interactive = !disable;
    button.cursor = disable ? 'default' : 'pointer';
    button.alpha = disable ? 0.5 : 1.0;
    shadow.visible = !disable; // Hide shadow when disabled for flat appearance
    if (!disable && isHovered) {
      background.tint = parseColor(hoverTint);
    } else if (!disable) {
      background.tint = 0xffffff;
    }
  };

  // Initial disabled state
  setDisabled(disabled);

  // Attach event listeners
  button.on('pointerover', onPointerOver);
  button.on('pointerout', onPointerOut);
  button.on('pointerdown', onPointerDown);

  // Expose public methods
  (button as any).setDisabled = setDisabled;
  (button as any).getDisabled = () => isDisabled;

  return button;
}