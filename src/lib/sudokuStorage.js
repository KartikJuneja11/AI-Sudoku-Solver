const STORAGE_KEY = 'sudoku-game-state';

/**
 * Save the current game state to localStorage
 */
export function saveSudokuGame(gameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Load a saved game state from localStorage
 */
export function loadSudokuGame() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;
    
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clear any saved game state
 */
export function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved game:', error);
  }
}

/**
 * Check if there is a saved game available
 */
export function hasSavedGame() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}