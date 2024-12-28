import React from 'react';
import { useGameContext } from '../../context/GameContext';
import styles from './GuessControls.module.css';

interface GuessControlsProps {
  // We'll read placements to see if there's any tile in the bank
  placements: Record<string, string | null>;
  onSubmitGuess: () => void;
}

const GuessControls: React.FC<GuessControlsProps> = ({
  placements,
  onSubmitGuess
}) => {
  const { attemptsLeft, gameResult } = useGameContext();

  // If there's a tile in the bank => the user hasn't placed all tiles => disable
  // We can only do that if we know how many total tiles should be on the grid.
  // For now, we check if there's any tile that is "null" => meaning it's still in the bank.
  // Actually, we need to know the # of tiles in the game vs. the # placed.
  // An easier approach: we check if the bank is truly empty by counting occupantTileId
  // or just pass down a "isBankEmpty" prop.

  // We'll do a quick approach: if there's any occupant == null => bank not empty
  // but that only works if #cells == #tiles, which should be 9 in your 3x3 scenario.
  const placedCount = Object.values(placements).filter((val) => val !== null).length;
  const totalTiles = 9; // for a 3x3 scenario
  const canSubmit = (placedCount === totalTiles) && (attemptsLeft > 0) && (gameResult === 'none');

  return (
    <div className={styles.guessControls}>
      <button
        className={styles.submitButton}
        onClick={onSubmitGuess}
        disabled={!canSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default GuessControls;
