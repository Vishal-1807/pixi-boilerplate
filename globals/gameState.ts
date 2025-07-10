// gameState.ts - Cleaned version with only necessary functions for main.ts

// Create listeners arrays outside the exported object to keep them private
let gridDimensionChangeListeners: Array<(cols: number, rows: number) => void> = [];

// Global state variables
let gameStarted: boolean = false;
let gameStartedListeners: (() => void)[] = [];
let gameEndedListeners: (() => void)[] = [];
let balanceChangeListeners: ((newBalance: number) => void)[] = [];

// Pending game restoration listeners
let pendingGameRestoreListeners: Array<() => void> = [];
let pendingGameRestoreCompleteListeners: Array<() => void> = [];

// Layout constants
const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 5;
const DEFAULT_BALANCE = 1000000;
const DEFAULT_STAKE = 1.00;
const DEFAULT_TABLE_ID = "STGMS101";

const setGameStarted = (started: boolean) => {
    const wasStarted = gameStarted;
    gameStarted = started;
    console.log(`Game started state changed to: ${started}`);
    
    // Emit event when game becomes started (not when it becomes false)
    if (started && !wasStarted) {
        console.log(`Triggering ${gameStartedListeners.length} game started listeners`);
        gameStartedListeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                console.error('Error in game started listener:', error);
            }
        });
    }
    
    // Emit event when game ends (becomes false from true)
    if (!started && wasStarted) {
        console.log(`Triggering ${gameEndedListeners.length} game ended listeners`);
        gameEndedListeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                console.error('Error in game ended listener:', error);
            }
        });
    }
}

const getGameStarted = () => {
    return gameStarted;
}

const addGameStartedListener = (callback: () => void) => {
    gameStartedListeners.push(callback);
    console.log(`Added game started listener. Total listeners: ${gameStartedListeners.length}`);
    
    // Return unsubscribe function
    return () => {
        const index = gameStartedListeners.indexOf(callback);
        if (index > -1) {
            gameStartedListeners.splice(index, 1);
            console.log(`Removed game started listener. Remaining listeners: ${gameStartedListeners.length}`);
        }
    };
}

const addGameEndedListener = (callback: () => void) => {
    gameEndedListeners.push(callback);
    console.log(`Added game ended listener. Total listeners: ${gameEndedListeners.length}`);
    
    // Return unsubscribe function
    return () => {
        const index = gameEndedListeners.indexOf(callback);
        if (index > -1) {
            gameEndedListeners.splice(index, 1);
            console.log(`Removed game ended listener. Remaining listeners: ${gameEndedListeners.length}`);
        }
    };
}

const setBalance = (balance: number) => {
    const previousBalance = GlobalState.balance;
    GlobalState.balance = balance;
    console.log(`💳 Balance updated from ${previousBalance} to ${balance}`);
    
    // Trigger balance change listeners when balance changes
    if (previousBalance !== balance) {
        triggerBalanceChange(balance);
    }
};

const getBalance = () => {
    return GlobalState.balance;
};

const triggerBalanceChange = (newBalance: number) => {
    console.log(`💳 Triggering ${balanceChangeListeners.length} balance change listeners with balance: ${newBalance}`);
    balanceChangeListeners.forEach(listener => {
        try {
            listener(newBalance);
        } catch (error) {
            console.error('💳 Error in balance change listener:', error);
        }
    });
}

const addBalanceChangeListener = (callback: (newBalance: number) => void) => {
    balanceChangeListeners.push(callback);
    console.log(`💳 Added balance change listener. Total listeners: ${balanceChangeListeners.length}`);
    
    // Return unsubscribe function
    return () => {
        const index = balanceChangeListeners.indexOf(callback);
        if (index > -1) {
            balanceChangeListeners.splice(index, 1);
            console.log(`💳 Removed balance change listener. Remaining listeners: ${balanceChangeListeners.length}`);
        }
    };
}

const getTableId = () => {
    return GlobalState.table_id;
};

const setGridDimensions = (cols: number, rows: number) => {
    const prevCols = GlobalState.total_cols;
    const prevRows = GlobalState.total_rows;
    
    GlobalState.total_cols = cols;
    GlobalState.total_rows = rows;
    
    console.log(`Grid dimensions updated: ${cols}x${rows} (previous: ${prevCols}x${prevRows})`);
    
    // Trigger listeners only if dimensions actually changed
    if (prevCols !== cols || prevRows !== rows) {
        console.log(`Triggering ${gridDimensionChangeListeners.length} grid dimension change listeners`);
        gridDimensionChangeListeners.forEach(listener => {
            try {
                listener(cols, rows);
            } catch (error) {
                console.error('Error in grid dimension change listener:', error);
            }
        });
    }
};

const addGridDimensionChangeListener = (callback: (cols: number, rows: number) => void) => {
    gridDimensionChangeListeners.push(callback);
    console.log(`Added grid dimension change listener. Total listeners: ${gridDimensionChangeListeners.length}`);
    
    // Return unsubscribe function
    return () => {
        const index = gridDimensionChangeListeners.indexOf(callback);
        if (index > -1) {
            gridDimensionChangeListeners.splice(index, 1);
            console.log(`Removed grid dimension change listener. Remaining listeners: ${gridDimensionChangeListeners.length}`);
        }
    };
};

const setStakeAmount = (amount: number) => {
    GlobalState.stakeAmount = amount;
    console.log(`Stake amount set to: ${amount}`);
};

const getStakeAmount = () => {
    return GlobalState.stakeAmount;
};

const setRoundId = (roundId: string) => {
    GlobalState.roundId = roundId;
    console.log('Round ID set:', roundId);
};

const getRoundId = () => {
    return GlobalState.roundId;
};

const setCurrentRow = (row: number) => {
    console.log(`Setting current row to: ${row}`);
    GlobalState.current_row = row;
};

const getCurrentRow = () => {
    return GlobalState.current_row;
};

const setGameMatrix = (matrix: string[][]) => {
    GlobalState.game_matrix = matrix;
    console.log('Game matrix updated');
};

const setReward = (newReward: number) => {
    GlobalState.reward = newReward;
    console.log(`Reward set to: ${newReward}`);
}

const getReward = () => {
    return GlobalState.reward;
}

const setToken = (token: string) => {
    console.log('Setting token for React integration:', token);
    GlobalState.token = token;
}

const getToken = () => {
    return GlobalState.token;
}

// Function to add pending game restore listener
const addPendingGameRestoreListener = (listener: () => void) => {
    pendingGameRestoreListeners.push(listener);
    console.log(`Added pending game restore listener. Total listeners: ${pendingGameRestoreListeners.length}`);

    // Return unsubscribe function
    return () => {
        const index = pendingGameRestoreListeners.indexOf(listener);
        if (index > -1) {
            pendingGameRestoreListeners.splice(index, 1);
            console.log(`Removed pending game restore listener. Remaining listeners: ${pendingGameRestoreListeners.length}`);
        }
    };
};

// Function to add pending game restore completion listener
const addPendingGameRestoreCompleteListener = (listener: () => void) => {
    pendingGameRestoreCompleteListeners.push(listener);
    console.log(`Added pending game restore complete listener. Total listeners: ${pendingGameRestoreCompleteListeners.length}`);

    // Return unsubscribe function
    return () => {
        const index = pendingGameRestoreCompleteListeners.indexOf(listener);
        if (index > -1) {
            pendingGameRestoreCompleteListeners.splice(index, 1);
            console.log(`Removed pending game restore complete listener. Remaining listeners: ${pendingGameRestoreCompleteListeners.length}`);
        }
    };
};

// Function to trigger pending game restore (placeholder for extensibility)
const triggerPendingGameRestore = () => {
    console.log('Triggering pending game restore');
    // This can be extended later if needed
};

export const GlobalState = {
    // Core state
    token: null as string | null,
    total_rows: DEFAULT_ROWS,
    total_cols: DEFAULT_COLS,
    current_row: DEFAULT_ROWS - 1, // Start at bottom row
    game_matrix: [] as string[][],
    
    // Game state
    balance: DEFAULT_BALANCE,
    stakeAmount: DEFAULT_STAKE,
    roundId: null as string | null,
    reward: 0,
    
    // Table data
    table_id: DEFAULT_TABLE_ID,
    
    // Token functions
    getToken,
    setToken,
    
    // Game state functions
    setGameStarted,
    getGameStarted,
    addGameStartedListener,
    addGameEndedListener,
    
    // Balance functions
    setBalance,
    getBalance,
    addBalanceChangeListener,
    
    // Grid functions
    setGridDimensions,
    addGridDimensionChangeListener,
    
    // Game data functions
    getTableId,
    setStakeAmount,
    getStakeAmount,
    setRoundId,
    getRoundId,
    setCurrentRow,
    getCurrentRow,
    setGameMatrix,
    setReward,
    getReward,
    
    // Extensibility placeholders
    addPendingGameRestoreListener,
    addPendingGameRestoreCompleteListener,
    triggerPendingGameRestore,
};