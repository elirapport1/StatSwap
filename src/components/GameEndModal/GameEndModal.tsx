import React, { useState } from 'react';
import playerStatsRaw from '../../data/player_stats.json' with { type: 'json' };
import type { PlayerStat, PlayerStatsData } from '../../data/playerStats.ts';
import styles from './GameEndModal.module.css';

const playerStats = playerStatsRaw as PlayerStatsData;

interface GameEndModalProps {
  gameResult: 'win' | 'lose';
  attemptsUsed: number;            // how many times user clicked "Submit" to guess
  finalGrid: ('correct' | 'incorrect')[][];
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  gameResult,
  attemptsUsed,
  finalGrid
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const number = value.replace(/\D/g, '');
    
    // Format the number as user types
    if (number.length <= 3) {
      return number;
    } else if (number.length <= 6) {
      return `${number.slice(0, 3)}-${number.slice(3)}`;
    } else {
      return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    // Reset success state if number is cleared
    if (!formattedNumber) {
      setSubmitSuccess(false);
    }
  };

  /**
   * buildShareText():
   * Produces the share text for the final outcome.
   * We'll simply show 3 lines of 🟩🟩🟩 for a 3×3 correct grid. 
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
   * shareResult:
   * Uses Web Share API if available (mobile), falls back to clipboard
   */
  async function shareResult() {
    const text = buildShareText();
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        // User cancelled or share failed - fall back to clipboard
        copyToClipboard();
      }
    } else {
      // Web Share API not available - use clipboard
      copyToClipboard();
    }
  }

  /**
   * copyToClipboard:
   * Copies the share text to the user's clipboard.
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(true);
    setPhoneNumber(phoneNumber); // Keep the number visible
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title} style={{ fontSize: '1.7rem' }}>thanks for playing StatSwap</h2>
        {/* If user won => show attemptsUsed; if lost => no attempts message */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.15rem' }}>
          {gameResult === 'win' ? (
            <p className={styles.resultText}>
              solved in {attemptsUsed} attempts 🤩
            </p>
          ) : (
            <p className={styles.resultText}>
              better luck tomorrow ☹️
            </p>
          )}
          <button className={styles.shareButton} onClick={shareResult} style={{padding: '0.5rem 1rem', marginTop: '.4rem'}}>
            share game
          </button>
        </div>
        
        
        

        {/* Show the 3×3 correct answer grid, all in green */}
        {renderCorrectAnswerGrid()}
        
        {/* Notification signup section */}
        <div className={styles.notificationSection} style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handlePhoneSubmit} className={styles.phoneForm}>
            <div className={styles.inputGroup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="enter your 📞 to"
                className={styles.phoneInput}
                disabled={submitSuccess}
                style={{ 
                  flex: 1, 
                  marginRight: '-2px', 
                  width: '8px', 
                  minWidth: '115px', 
                  padding: '8px 7px',
                  borderColor: submitSuccess ? 'green' : undefined,
                  textAlign: 'left',
                }}
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                autoComplete="tel"
                inputMode="tel"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!phoneNumber || submitSuccess}
                style={{ 
                  padding: '8px 7px', 
                  height: '40px',
                  backgroundColor: submitSuccess ? 'green' : undefined,
                }}
              >
                {submitSuccess ? 'texts enabled' : 'play tomorrow'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
