import React, { createContext, useState, useContext } from 'react';

interface GameContextValue {
  attemptsLeft: number;
  setAttemptsLeft: React.Dispatch<React.SetStateAction<number>>;
  activeColumn: string | null;
  setActiveColumn: React.Dispatch<React.SetStateAction<string | null>>;

  // NEW: lockedColumns store the names of columns that are locked
  lockedColumns: string[];
  setLockedColumns: React.Dispatch<React.SetStateAction<string[]>>;

  // For "win" or "lose" UI feedback
  gameResult: 'none' | 'win' | 'lose'; 
  setGameResult: React.Dispatch<React.SetStateAction<'none' | 'win' | 'lose'>>;

  
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  // NEW
  const [lockedColumns, setLockedColumns] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<'none' | 'win' | 'lose'>('none');


  const value: GameContextValue = {
    attemptsLeft,
    setAttemptsLeft,
    activeColumn,
    setActiveColumn,
    lockedColumns,
    setLockedColumns,
    gameResult,
    setGameResult
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
