import React, { useState } from 'react';
import playerStatsRaw from '../../data/player_stats.json' with { type: 'json' };
import type { PlayerStat, PlayerStatsData } from '../../data/playerStats.ts';
import styles from './GameEndModal.module.css';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config/supabase.js';

const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

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
    setIsSubmitting(true);
    setError('');

    // Basic phone number validation
    const phoneRegex = /^\+?1?\d{10,12}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[- ()]/g, ''))) {
      setError('Please enter a valid phone number');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('notifications')
        .insert([
          { phone_number: phoneNumber, created_at: new Date().toISOString() }
        ]);

      if (supabaseError) throw supabaseError;

      setSubmitSuccess(true);
      setPhoneNumber('');
    } catch (err) {
      setError('Failed to save phone number. Please try again.');
      console.error('Error saving phone number:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>thanks for playing StatSwap</h2>

        {/* If user won => show attemptsUsed; if lost => no attempts message */}
        {gameResult === 'win' ? (
          <p className={styles.resultText}>
            you solved in {attemptsUsed} attempts 🤩
          </p>
        ) : (
          <p className={styles.resultText}>
            better luck tomorrow ☹️
          </p>
        )}

        {/* Show the 3×3 correct answer grid, all in green */}
        {renderCorrectAnswerGrid()}

        <div className={styles.notificationSection}>
          <p>sign up below if you wanna play tomorrow's game in __ hours</p>
          <form onSubmit={handlePhoneSubmit} className={styles.phoneForm}>
            <div className={styles.inputGroup}>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (opt out any time)"
                className={styles.phoneInput}
                disabled={isSubmitting || submitSuccess}
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? 'Saving...' : submitSuccess ? '✓ Saved!' : 'Notify Me'}
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {submitSuccess && (
              <p className={styles.success}>
                Great! You'll receive a text when tomorrow's game is ready.
              </p>
            )}
          </form>
          <button className={styles.shareButton} onClick={shareResult}>
            share game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
