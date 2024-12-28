import React from 'react';
import { useGameContext } from '../../context/GameContext';
import styles from './AttemptsIndicator.module.css';

/**
 * AttemptsIndicator:
 * - Displays up to 3 circles.
 * - If attemptsLeft is 3 => all circles filled.
 * - If attemptsLeft is 2 => the last circle is hollow, etc.
 * - If attemptsLeft is 0 => all circles are hollow (user lost).
 */
const AttemptsIndicator: React.FC = () => {
  const { attemptsLeft } = useGameContext();

  // We'll show 3 circles. If attemptsLeft >= that circle index => filled, else empty
  const totalCircles = 3;
  const circles = [];

  for (let i = 0; i < totalCircles; i++) {
    // For circle index i, if i < attemptsLeft => filled, otherwise empty
    const filled = i < attemptsLeft;
    circles.push(
      <div
        key={i}
        className={`${styles.circle} ${filled ? styles.filled : styles.empty}`}
      />
    );
  }

  return <div className={styles.container}>{circles}</div>;
};

export default AttemptsIndicator;
