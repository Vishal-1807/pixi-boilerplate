import { Application } from 'pixi.js'
import { loadAssets, hideSplash } from './loader';
import { createBackground, createBottombar, createTitle, createToolbar,
        createHome, createBalanceTab,
        createBetTab, createGridTab, createStartButton } from './components';
import { GlobalState } from './globals/gameState';
import { WebSocketService } from './WebSockets/WebSocketService';
import { getUIVisibilityManager, registerUIElement } from './utils/uiVisibilityManager';
import { initializeActivityManager, resumeActivityTimer } from './utils/gameActivityManager';

// 🎛️ ENVIRONMENT CONFIGURATION
// Change this to switch between local and React integration
const IS_REACT_MODE = false; // Set to true for React integration, false for standalone

// Layout constants
const SPLASH_MIN_DURATION = 2000;
const START_BUTTON_DELAY = 500;
const PENDING_GAME_RESTORE_DELAY = 500;
const RESIZE_DEBOUNCE_DELAY = 300;
const COMPONENT_REBUILD_THRESHOLD = 50;

// 📱 REACT INTEGRATION MODE
if (IS_REACT_MODE) {
  // Attach startPixiGame to window for React to call
  (window as any).startPixiGame = async (container: HTMLDivElement) => {
    const app = await initializePixiApp(container);
    return app;
  };
} else {
  // 🖥️ STANDALONE MODE - Initialize immediately
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
}

// 🚀 Main initialization function
const init = async () => {
  const app = new Application();
  await app.init({
    background: '#080f16',
    autoStart: true,
    resizeTo: window,
  });
  document.body.appendChild(app.canvas);

  app.canvas.style.position = 'absolute';
  app.canvas.style.top = '0';
  app.canvas.style.left = '0';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  app.canvas.style.zIndex = '1';
  app.canvas.style.overflow = 'hidden';
  app.canvas.style.display = 'block';

  // Initialize core systems
  await initializeCoreGame(app);

  // Setup resize handling for standalone mode
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      resizeAllComponents(app);
    }, 50);
  });
};

// 🎮 React mode initialization
const initializePixiApp = async (container: HTMLDivElement): Promise<Application> => {
  // Get token from session storage if needed
  const token = sessionStorage.getItem('token') || "";
  if (token) {
    console.log("Token retrieved from session storage:", token);
    GlobalState.setToken(token);
  } else {
    console.warn("No token found in session storage");
  }

  // Create splash screen for React mode
  createSplashScreen(container);

  const app = new Application();
  await app.init({
    background: '#080f16',
    autoStart: true,
    width: container.clientWidth,
    height: container.clientHeight,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
  });

  // Set canvas styles for React integration
  app.canvas.style.position = 'absolute';
  app.canvas.style.top = '0';
  app.canvas.style.left = '0';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  app.canvas.style.zIndex = '1';
  app.canvas.style.overflow = 'hidden';
  app.canvas.style.display = 'block';

  // Set container styles
  container.style.overflow = 'hidden';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.display = 'block';
  container.style.position = 'relative';

  container.appendChild(app.canvas);

  // Initialize with React-specific features
  await initializeCoreGame(app, container);

  return app;
};

// 🎬 Create splash screen for React mode
const createSplashScreen = (container: HTMLDivElement) => {
  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.style.position = 'absolute';
  splash.style.top = '0';
  splash.style.left = '0';
  splash.style.right = '0';
  splash.style.bottom = '0';
  splash.style.background = 'black';
  splash.style.zIndex = '10';
  splash.style.display = 'flex';
  splash.style.alignItems = 'center';
  splash.style.justifyContent = 'center';
  splash.style.pointerEvents = 'none';

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';

  const source = document.createElement('source');
  source.src = 'https://s3.eu-west-2.amazonaws.com/static.inferixai.link/pixi-game-assets/tron-mineSweeper/assets/minesweeper_splash.mp4';
  source.type = 'video/mp4';

  video.appendChild(source);
  splash.appendChild(video);
  container.appendChild(splash);

  return splash;
};

// 🎯 Core game initialization (shared between modes)
const initializeCoreGame = async (app: Application, container?: HTMLDivElement) => {
  // Initialize UI Visibility Manager
  const uiVisibilityManager = getUIVisibilityManager({
    animationDuration: 300,
    debugMode: true,
    fadeEffect: true
  });

  // Initialize Activity Manager
  const activityManager = initializeActivityManager({
    timeoutMinutes: 2,
    debugMode: false,
    excludeFromTimer: []
  });

  let gameComponents: Array<{ container: any, cleanup?: () => void }> = [];
  let currentWidth = app.screen.width;
  let currentHeight = app.screen.height;

  // Handle React mode specific setup
  if (IS_REACT_MODE && container) {
    await handleReactModeSetup(app, container, gameComponents);
  } else {
    // Standalone mode setup
    await handleStandaloneModeSetup(app, gameComponents);
  }

  // Create initial components
  createAllComponents(app, currentWidth, currentHeight, gameComponents);

  // Setup balance and start button creation
  await setupBalanceAndStartButton(app, gameComponents);

  console.log('🎮 Core game initialization completed');
};

// 🔄 React mode specific setup
const handleReactModeSetup = async (app: Application, container: HTMLDivElement, gameComponents: any[]) => {
  let currentWidth = container.clientWidth;
  let currentHeight = container.clientHeight;

  // Function to rebuild components on significant resize
  const rebuildGameComponents = () => {
    console.log('Rebuilding game components with new dimensions:', currentWidth, currentHeight);

    // Clean up existing components
    gameComponents.forEach(component => {
      if (component.container.parent) {
        component.container.parent.removeChild(component.container);
      }
      if (component.cleanup) {
        component.cleanup();
      }
    });

    app.stage.removeChildren();
    createAllComponents(app, currentWidth, currentHeight, gameComponents);
  };

  // Setup resize observer for React mode
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  const resizeObserver = new ResizeObserver(() => {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      app.renderer.resize(container.clientWidth, container.clientHeight);

      const widthChanged = Math.abs(currentWidth - container.clientWidth) > COMPONENT_REBUILD_THRESHOLD;
      const heightChanged = Math.abs(currentHeight - container.clientHeight) > COMPONENT_REBUILD_THRESHOLD;

      if (widthChanged || heightChanged) {
        currentWidth = container.clientWidth;
        currentHeight = container.clientHeight;

        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          rebuildGameComponents();
          resizeTimeout = null;
        }, RESIZE_DEBOUNCE_DELAY);
      }
    }
  });

  resizeObserver.observe(container);

  // Setup cleanup for React mode
  const cleanup = () => {
    console.log('🧹 Cleaning up PIXI game...');
    
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }

    resizeObserver.disconnect();

    gameComponents.forEach(component => {
      if (component.cleanup) {
        component.cleanup();
      }
    });

    app.destroy(true, { children: true, texture: true });
    console.log('🧹 PIXI game cleanup completed');
  };

  (app as any).cleanup = cleanup;
  (window as any).cleanupPixiGame = cleanup;

  // Handle splash screen for React mode
  await handleReactSplashScreen(container);
};

// 🎬 Handle React mode splash screen
const handleReactSplashScreen = async (container: HTMLDivElement) => {
  const splash = container.querySelector('#splash') as HTMLElement;
  if (!splash) return;

  // Wait for minimum splash duration and assets
  const splashMinTimePromise = new Promise<void>((resolve) => {
    setTimeout(resolve, SPLASH_MIN_DURATION);
  });

  const assetLoadPromise = loadAssets();
  const socketReadyPromise = createSocketReadyPromise();

  await Promise.all([splashMinTimePromise, assetLoadPromise, socketReadyPromise]);

  // Remove splash screen
  const removeSplashScreen = () => {
    console.log('🎬 Removing splash screen');
    splash.style.transition = 'opacity 0.5s';
    splash.style.opacity = '0';
    setTimeout(() => {
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 500);
  };

  // Setup balance loading to trigger splash removal
  let balanceLoaded = false;
  let pendingGamesChecked = false;

  const ws = WebSocketService.getInstance();
  ws.on('getbalance', async (res) => {
    if (res?.balance !== undefined) {
      GlobalState.setBalance(res.balance);
      console.log('💰 Balance updated:', res.balance);

      await checkForPendingGames();
      
      balanceLoaded = true;
      pendingGamesChecked = true;
      
      if (balanceLoaded && pendingGamesChecked) {
        removeSplashScreen();
      }
    }
  });

  ws.send('getbalance', { operation: 'getbalance' });
};

// 🖥️ Standalone mode setup
const handleStandaloneModeSetup = async (app: Application, gameComponents: any[]) => {
  await loadAssets();
  const ws = await WebSocketService.getInstance();
  hideSplash();

  setTimeout(() => {
    resumeActivityTimer();
    console.log('🕐 Activity timer started after initialization');
  }, 1000);
};

// 🔌 Create socket ready promise
const createSocketReadyPromise = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    const ws = WebSocketService.getInstance();

    if (ws.isSocketConnected()) {
      resolve();
    } else {
      const checkSocket = setInterval(() => {
        if (ws.isSocketConnected()) {
          clearInterval(checkSocket);
          resolve();
        }
      }, 100);
    }
  });
};

// 🏗️ Create all game components
const createAllComponents = (app: Application, width: number, height: number, gameComponents: any[]) => {
  const background = createBackground(width, height);
  app.stage.addChild(background);

  const home = createHome(width, height);
  app.stage.addChild(home);

  const balanceTab = createBalanceTab(width, height);
  app.stage.addChild(balanceTab);

  const title = createTitle(width, height);
  app.stage.addChild(title);

  const bottomTextDisplay = createBottomTextDisplay({
    width: width,
    height: height,
    fontFamily: 'GameFont',
    fontSize: 24,
    fontColor: '0x7DE8EB',
    animationDuration: 300,
    fadeEffect: true
  });
  app.stage.addChild(bottomTextDisplay);

  const bottombar = createBottombar(width, height);
  app.stage.addChild(bottombar);

  const betTab = createBetTab(width, height);
  app.stage.addChild(betTab);
  
  // Register specific bet tab buttons for hiding during gameplay
  if (betTab.children[0]) {
    registerUIElement(betTab.children[0], 'betMinusButton');
  }
  if (betTab.children[2]) {
    registerUIElement(betTab.children[2], 'betPlusButton');
  }

  const gridTab = createGridTab(width, height, app.stage);
  app.stage.addChild(gridTab);

  const toolbar = createToolbar(width, height, app);
  app.stage.addChild(toolbar);

  // Register settings button for hiding during gameplay
  if (toolbar.children[0]) {
    registerUIElement(toolbar.children[0], 'settingsButton');
  }

  const mines = createMines(width, height, GlobalState.total_rows, GlobalState.total_cols);
  app.stage.addChild(mines);

  // Store components for cleanup
  gameComponents.length = 0; // Clear existing
  gameComponents.push(
    { container: background },
    { container: home },
    { container: balanceTab },
    { container: title },
    { container: bottomTextDisplay },
    { container: bottombar },
    { container: betTab },
    { container: gridTab },
    { container: toolbar },
    { container: mines }
  );
};

// 💰 Setup balance and start button creation
const setupBalanceAndStartButton = async (app: Application, gameComponents: any[]) => {
  const ws = WebSocketService.getInstance();
  let startButton: any = null;

  ws.on('getbalance', async (res) => {
    if (res?.balance !== undefined) {
      GlobalState.setBalance(res.balance);
      console.log('💰 Balance updated:', res.balance);
      
      // Check for pending games before creating start button
      const hasPendingGame = await checkForPendingGames();
      
      console.log('✅ Balance loaded and pending games checked, creating start button...');
      console.log('Has pending game:', hasPendingGame);

      setTimeout(() => {
        console.log('🎮 Creating start button...');
        startButton = createStartButton(app.screen.width, app.screen.height);
        app.stage.addChild(startButton);
        gameComponents.push({ container: startButton });

        if (startButton && (startButton as any).resize) {
          (startButton as any).resize(app.screen.width, app.screen.height);
        }

        console.log('🎮 Start button is now available');
      }, START_BUTTON_DELAY);
    }
  });

  console.log('📡 Requesting balance...');
  ws.send('getbalance', { operation: 'getbalance' });
};

// 🔍 Check for pending games
const checkForPendingGames = async (): Promise<boolean> => {
  const ws = WebSocketService.getInstance();

  return new Promise<boolean>((resolve) => {
    ws.send('minesweeper_game_load', {
      operation: 'minesweeper_game_load',
      data: {
        tableId: GlobalState.getTableId(),
      },
    });
    
    ws.on('minesweeper_game_load', (res) => {
      console.log('🔍 Pending game check response:', res);
      
      if (res?.status === '400') {
        resolve(false);
      }
      else if (res?.status === '200 OK') {
        if (res?.hasExistingGame) {
          console.log('🎮 Existing game found - checking if it\'s truly active...');
          
          const backendCurrentRow = res?.currentRow || 0;
          const totalRows = GlobalState.total_rows || 6;
          const isGameCompleted = backendCurrentRow >= (totalRows - 1) || res?.gameOver === true;
          const hasValidRoundId = res?.roundId && res?.roundId !== null && res?.roundId !== '';

          if (isGameCompleted || !hasValidRoundId) {
            console.log('🎮 Game appears to be completed or invalid - starting fresh');
            resolve(false);
            return;
          }

          console.log('🎮 Game is truly active - proceeding with restoration...');
          restorePendingGame(res);
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        console.warn('⚠️ Unknown response from game load:', res);
        resolve(false);
      }
    });
  });
};

// 🔄 Restore pending game state
const restorePendingGame = (gameData: any) => {
  if (gameData?.revealedMatrix) {
    GlobalState.setGameMatrix(gameData.revealedMatrix);
  }

  if (gameData?.gridOption) {
    const [cols, rows] = gameData.gridOption.split("x").map((x: string) => parseInt(x));
    GlobalState.setGridDimensions(cols, rows);
  }

  if (gameData?.betAmount) {
    GlobalState.setStakeAmount(gameData.betAmount);
  }

  GlobalState.setRoundId(gameData?.roundId);
  
  if (gameData.currentRow !== undefined) {
    const frontendCurrentRow = GlobalState.total_rows - 1 - gameData.currentRow;
    GlobalState.setCurrentRow(frontendCurrentRow);
  }

  // Calculate reward
  let calculatedReward = 0;
  if (gameData?.rowRewards && Array.isArray(gameData.rowRewards) && gameData.rowRewards.length > 0) {
    calculatedReward = gameData.rowRewards[gameData.rowRewards.length - 1] || 0;
  }
  GlobalState.setReward(calculatedReward);
  GlobalState.setGameStarted(true);

  setTimeout(() => {
    if (GlobalState.triggerPendingGameRestore) {
      GlobalState.triggerPendingGameRestore();
    }
  }, PENDING_GAME_RESTORE_DELAY);
};

// 📐 Resize all components (for standalone mode)
const resizeAllComponents = (app: Application) => {
  const newWidth = app.screen.width;
  const newHeight = app.screen.height;
  
  // Get all components from stage and resize them
  app.stage.children.forEach(child => {
    if ((child as any).resize) {
      (child as any).resize(newWidth, newHeight);
    }
  });
};