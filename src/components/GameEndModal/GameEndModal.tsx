import React from 'react';
import playerStatsRaw from '../../data/player_stats.json' with { type: 'json' };
import type { PlayerStat, PlayerStatsData } from '../../data/playerStats.ts';
import styles from './GameEndModal.module.css';

const playerStats = playerStatsRaw as PlayerStatsData;

interface GameEndModalProps {
  onClose: () => void;             // closes the popup
  gameResult: 'win' | 'lose';
  attemptsUsed: number;            // how many times user clicked "Submit" to guess
  finalGrid: ('correct' | 'incorrect')[][];
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  onClose,
  gameResult,
  attemptsUsed,
  finalGrid
}) => {
  /**
   * buildShareText():
   * Produces the share text for the final outcome.
   * We’ll simply show 3 lines of 🟩🟩🟩 for a 3×3 correct grid. 
   * If user "win," we show attemptsUsed as well.
   */
  function buildShareText(): string {
    const dateStr = new Date().toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'); // e.g. "12.26.24"

    // Convert finalGrid to lines of emojis:
    const lines = finalGrid.map(row => {
      return row.map(cell => (cell === 'correct' ? '🟩' : '🟥')).join('');
    });

    const header = ['StatSwap', dateStr];
    const footer = [];

    if (gameResult === 'win') {
      if (attemptsUsed === 1) {
        footer.push("🟢🟢🟢");
      }
      if (attemptsUsed === 2) {
        footer.push("❌🟢🟢");
      }
      if (attemptsUsed === 3) {
        footer.push("❌❌🟢");
      }
    }

    // Combine into one text block
    // e.g.
    // StatSwap
    // 12/26/24
    // 🟩🟩🟥
    // 🟩🟩🟥
    // 🟩🟩🟥
    // (Solved in 2 attempts)
    return [
      ...header,
      ...lines,
      ...footer
    ].join('\n');
  }

  /**
   * copyToClipboard:
   * Copies the share text to the user’s clipboard.
   */
  function copyToClipboard() {
    const text = buildShareText();
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  /**
   * renderCorrectAnswerGrid():
   * Renders a 3×3 grid exactly like your main AnswerGrid, 
   * but every cell is green and displays the correct statistic from playerStats.
   */
  function renderCorrectAnswerGrid() {
    const players = Object.keys(playerStats);
    if (!players.length) {
      return <div>No data loaded for the correct answer grid.</div>;
    }
    const categories = Object.keys(playerStats[players[0]]) as Array<keyof PlayerStat>;

    return (
      <div className={styles.container}>
        {/* Header row: 3 player labels */}
        <div className={styles.headerRow}>
          <div className={styles.cornerLabel} />
          {players.map((playerName) => (
            <div
              key={playerName}
              className={styles.playerLabel}
              style={{ backgroundColor: 'green' }}
            >
              {playerName}
            </div>
          ))}
        </div>

        {/* For each category row, show that label + 3 green statistic cells */}
        {categories.map((category) => (
          <div className={styles.gridRow} key={category}>
            <div
              className={styles.categoryLabel}
              style={{ backgroundColor: 'green' }}
            >
              {category}
            </div>

            {players.map((playerName) => {
              const correctValue = playerStats[playerName][category as keyof PlayerStat];
              return (
                <div
                  key={`${playerName}-${category}`}
                  className={styles.cell}
                  style={{ backgroundColor: 'green' }}
                >
                  {correctValue}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>thanks for playing StatSwap</h2>

        {/* If user won => show attemptsUsed; if lost => no attempts message */}
        {gameResult === 'win' ? (
          <p className={styles.resultText}>
            you solved in {attemptsUsed} attempts
          </p>
        ) : (
          <p className={styles.resultText}>
            better luck tomorrow ☹️
          </p>
        )}

        {/* Show the 3×3 correct answer grid, all in green */}
        {renderCorrectAnswerGrid()}

        <button className={styles.shareButton} onClick={copyToClipboard}>
          share your game
        </button>
        
      </div>
    </div>
  );
};

export default GameEndModal;
