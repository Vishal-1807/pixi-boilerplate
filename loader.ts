import { Assets } from 'pixi.js';

export async function loadAssets() {
    // const ASSET_BASE = '';
    const ASSET_BASE = 'https://s3.eu-west-2.amazonaws.com/static.inferixai.link/pixi-game-assets/tron-mineSweeper/'
    
    // Load all assets including the font file
    await Assets.load([
        { alias: 'background', src: `${ASSET_BASE}assets/BG.png` },
        { alias: 'bottomBar', src: `${ASSET_BASE}assets/Bottom_Tab.png` },
        { alias: 'bottomTextFont', src: `${ASSET_BASE}assets/Bottom_Text_Font.otf` },
        { alias: 'balance', src: `${ASSET_BASE}assets/Balance.png` },
        { alias: 'betTab', src: `${ASSET_BASE}assets/Bet_Tab.png` },
        { alias: 'betTabMinus', src: `${ASSET_BASE}assets/Bet_Tab_Minus.png` },
        { alias: 'betTabPlus', src: `${ASSET_BASE}assets/Bet_Tab_Plus.png` },
        { alias: 'gridTab', src: `${ASSET_BASE}assets/Grid_Tab.png` },
        { alias: 'home', src: `${ASSET_BASE}assets/Home.png` },
        { alias: 'balanceTab', src: `${ASSET_BASE}assets/Balance_Tab.png` },
        { alias: 'totalBet', src: `${ASSET_BASE}assets/Total_Bet.png` },
        { alias: 'title', src: `${ASSET_BASE}assets/MineSweeper_Title.png` },
        { alias: 'settings', src: `${ASSET_BASE}assets/Settings.png` },
        { alias: 'audio', src: `${ASSET_BASE}assets/Audio.png` },
        { alias: 'audioOff', src: `${ASSET_BASE}assets/Audio_Mute.png` },
        { alias: 'startButton', src: `${ASSET_BASE}assets/Start_Button.png` },
        { alias: 'popup', src: `${ASSET_BASE}assets/Popup.png` },
        { alias: 'titleSprite', src: `${ASSET_BASE}sprites/Title.json`},
        { alias: 'blastSprite', src: `${ASSET_BASE}sprites/blast.json` },
        { alias: 'textCard', src: `${ASSET_BASE}assets/Score_Red_Card.png` },
        { alias: 'rules', src: `${ASSET_BASE}assets/Rules.png` },
        { alias: 'history', src: `${ASSET_BASE}assets/History.png` },
        { alias: 'music_sound', src: `${ASSET_BASE}assets/Sound_Music.png` },
    ]);

    console.log('All assets loaded successfully');

    // Register the custom font for use in PIXI Text
    try {
        // Use the direct path to the font file
        const fontUrl = `${ASSET_BASE}assets/Bottom_Text_Font.otf`;
        const fontFace = new FontFace('GameFont', `url(${fontUrl})`);
        
        await fontFace.load();
        document.fonts.add(fontFace);
        
        console.log('✅ Custom font "GameFont" loaded and registered successfully');
        
        // Verify the font is available
        await document.fonts.ready;
        const isAvailable = document.fonts.check('16px GameFont');
        console.log('Font availability check:', isAvailable);
        
    } catch (fontError) {
        console.warn('⚠️ Failed to load custom font "GameFont":', fontError);
        console.log('Will fallback to system fonts');
    }
}

export function hideSplash() {
    const splash = document.getElementById('splash');
    if (splash) splash.remove();
}