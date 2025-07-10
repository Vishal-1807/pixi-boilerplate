import { Application } from 'pixi.js'
import { hideSplash, loadAssets } from './loader';
import { GlobalState } from './globals/gameState';
import { WebSocketService } from './WebSockets/WebSocketService';
import { getUIVisibilityManager, registerUIElement } from './utils/uiVisibilityManager';
import { initializeActivityManager, pauseActivityTimer, resumeActivityTimer } from './utils/gameActivityManager';
import { SoundManager } from './utils/SoundManager';

// 🔧 CONFIGURATION: Change this to switch between modes
const USE_REACT_MODE = true; // Set to false for local mode

// Common game initialization logic
const initializeGame = async (app: Application, container?: HTMLDivElement) => {
  // Enable sorting for z-index to work properly
  app.stage.sortableChildren = true;

  // Initialize UI Visibility Manager for showing/hiding UI elements
  const uiVisibilityManager = getUIVisibilityManager({
    animationDuration: 300,
    debugMode: true,
    fadeEffect: true
  });

  // Load game assets
  await loadAssets();
  
  // Initialize WebSocket connection
  const ws = await WebSocketService.getInstance();

  // Initialize activity manager for handling user inactivity
  const initActivityManager = () => {
    const activityManager = initializeActivityManager({
      timeoutMinutes: 2,
      debugMode: false,
      excludeFromTimer: []
    });

    console.log('🕐 Activity manager initialized with 2-minute timeout');
    return activityManager;
  };

  const activityManager = initActivityManager();

  // Start activity timer after initialization
  setTimeout(() => {
    resumeActivityTimer();
    console.log('🕐 Activity timer started after initialization');
  }, 1000);

  // TODO: Create your game components here
  // Example:
  // const background = createBackground(app.screen.width, app.screen.height);
  // app.stage.addChild(background);
  
  // STEP 1: Get player balance
  console.log('📡 STEP 1: Requesting balance...');
  const getBalance = (): Promise<void> => {
    return new Promise((resolve) => {
      ws.on('getbalance', (res) => {
        if (res?.balance !== undefined) {
          GlobalState.setBalance(res.balance);
          console.log('💰 Balance retrieved:', res.balance);
          resolve();
        }
      });
      ws.send('getbalance', { operation: 'getbalance' });
    });
  };

  // STEP 2: Check for pending/active games
  const checkAndHandlePendingGames = async (): Promise<boolean> => {
    console.log('🔍 STEP 2: Checking pending games...');
    return await checkPendingGames(removeSplashScreen);
  };

  // STEP 3: Initialize game UI components
  const initializeGameUI = (): void => {
    console.log('🎮 STEP 3: Initializing game UI...');
    
    // TODO: Create your game UI components here
    // Example:
    // const gameBoard = createGameBoard(app.screen.width, app.screen.height);
    // app.stage.addChild(gameBoard);
    
    console.log('✅ Game UI initialized');
  };

  // STEP 4: Remove splash screen
  let splashRemoved = false;
  const removeSplashScreen = (): void => {
    if (splashRemoved) {
      console.log('🎨 Splash screen already removed, skipping...');
      return;
    }
    console.log('🎨 Removing splash screen...');
    hideSplash();
    splashRemoved = true;
    console.log('✅ Splash screen removed');
  };

  // STEP 5: Initialize sound system
  const initializeSounds = () => {
    console.log('🔊 Initializing sounds...');
    SoundManager.loadAndWaitForCompletion().then(() => {
      console.log('✅ Sounds loaded and ready');
    });
  }

  // Execute the main initialization flow
  const executeMainFlow = async (): Promise<void> => {
    try {
      // Step 1: Get player balance
      await getBalance();

      // Step 2: Check for pending games
      const hasPendingGame = await checkAndHandlePendingGames();

      // Step 3: Initialize game UI
      initializeGameUI();

      // Step 4: Initialize sounds
      initializeSounds();

      // Step 5: Remove splash screen (wait for restoration if pending game exists)
      if (!hasPendingGame) {
        removeSplashScreen();
        SoundManager.playBackground();
      } else {
        console.log('🎨 Pending game detected - keeping splash screen until restoration completes');

        // Fallback timeout to ensure splash screen removal
        setTimeout(() => {
          console.log('🎨 Fallback timeout: Removing splash screen after 5 seconds');
          removeSplashScreen();
          SoundManager.playBackground();
        }, 5000);
      }

      console.log('✅ Main initialization flow completed successfully');

    } catch (error) {
      console.error('❌ Error in main initialization flow:', error);
      // Fallback: still initialize UI and remove splash
      initializeGameUI();
      removeSplashScreen();
    }
  };

  // Listen for pending game restoration completion
  GlobalState.addPendingGameRestoreCompleteListener(() => {
    console.log('🎨 Pending game restoration completed - removing splash screen');
    setTimeout(() => {
      removeSplashScreen();
    }, 100);
  });

  // Start the main initialization flow
  executeMainFlow();

  // Handle window resize events
  const resize = () => {
    const newWidth = app.screen.width;
    const newHeight = app.screen.height;
    
    // TODO: Update your game components on resize
    // Example:
    // if (background && (background as any).resize) {
    //   (background as any).resize(newWidth, newHeight);
    // }
    
    console.log(`📐 Window resized to ${newWidth}x${newHeight}`);
  };

  // Debounced resize handler
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      resize();
    }, 50);
  });

  return { app, resize };
};

// React mode initialization (for embedded use)
const initReactMode = async (container: HTMLDivElement) => {
  console.log('🔧 Starting in REACT MODE');
  
  // Get authentication token from session storage
  const token = sessionStorage.getItem('token') || "";
  if (token) {
    console.log("Token retrieved from session storage:", token);
    GlobalState.setToken(token);
  } else {
    console.warn("No token found in session storage");
  }

  // Create splash screen overlay
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

  // Create splash video element
  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';

  const source = document.createElement('source');
  // TODO: Replace with your game's splash video
  source.src = 'https://s3.eu-west-2.amazonaws.com/static.inferixai.link/pixi-game-assets/grass-minesweeper/assets/minesweeper_splash.mp4';
  source.type = 'video/mp4';

  video.appendChild(source);
  splash.appendChild(video);
  container.appendChild(splash);

  // Initialize PIXI Application
  const app = new Application();
  await app.init({
    background: '#080f16', // TODO: Change to your game's background color
    autoStart: true,
    width: container.clientWidth,
    height: container.clientHeight,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
  });

  // Set canvas styles for proper rendering
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

  await initializeGame(app, container);
};

// Local mode initialization (for standalone development)
const initLocalMode = async () => {
  console.log('🔧 Starting in LOCAL MODE');
  
  const app = new Application();
  await app.init({
    background: '#080f16', // TODO: Change to your game's background color
    autoStart: true,
    resizeTo: window,
  });
  document.body.appendChild(app.canvas);

  // Set canvas styles
  app.canvas.style.position = 'absolute';
  app.canvas.style.top = '0';
  app.canvas.style.left = '0';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  app.canvas.style.zIndex = '1';
  app.canvas.style.overflow = 'hidden';
  app.canvas.style.display = 'block';

  await initializeGame(app);
};

// Main entry point - switches based on USE_REACT_MODE flag
if (USE_REACT_MODE) {
  // Attach React mode function to window for React to call
  (window as any).startPixiGame = initReactMode;
} else {
  // Initialize local mode immediately
  initLocalMode();
}

// Function to check for pending/active games and restore them
const checkPendingGames = async (removeSplashScreen: () => void): Promise<boolean> => {
  const ws = WebSocketService.getInstance();

  return new Promise<boolean>((resolve) => {
    console.log('🔍 === CHECKING PENDING GAMES ===');
    
    // TODO: Replace with your game's load operation
    ws.send('your_game_load', {
      operation: 'your_game_load',
      data: {
        tableId: GlobalState.getTableId(),
      },
    });
    
    ws.on('your_game_load', (res) => {     
      if (res?.status === '400') {
        console.log('✅ No pending game found - clean state');
        resolve(false); // No pending game
      }
      else if (res?.status === '200 OK') {
        console.log('🎮 200 OK response received');
        
        if(res?.hasExistingGame){
          console.log('🎮 Existing game found - processing restoration...');
          console.log('🎮 Restoration data:', res);

          // TODO: Implement your game's restoration logic here
          // Example restoration steps:
          // 1. Validate the game state
          // 2. Restore game variables
          // 3. Restore UI state
          // 4. Restore game board/components
          
          // Check if game is valid and should be restored
          const hasValidRoundId = res?.roundId && res?.roundId !== null && res?.roundId !== '';
          
          if (!hasValidRoundId) {
            console.log('🎮 Game appears to be completed or invalid - starting fresh');
            resolve(false);
            return;
          }

          console.log('🎮 Valid active game found - proceeding with restoration...');

          // TODO: Restore your game state here
          // Example:
          // GlobalState.setRoundId(res?.roundId);
          // GlobalState.setGameStarted(true);
          // etc.

          // Delay visual restoration to ensure all state is set
          setTimeout(() => {
            console.log('🎨 Triggering game restoration...');
            
            if (GlobalState.triggerPendingGameRestore) {
              console.log('🎨 Calling triggerPendingGameRestore()');
              GlobalState.triggerPendingGameRestore();
            } else {
              console.error('⚠️ GlobalState.triggerPendingGameRestore not available!');
              // Fallback: remove splash screen
              setTimeout(() => {
                removeSplashScreen();
              }, 100);
            }
          }, 500);

          resolve(true);
        } else {
          console.log('🔍 No existing game found');
          resolve(false);
        }
      } else {
        console.warn('⚠️ Unknown response status:', res?.status);
        resolve(false);
      }
    });
  });
};