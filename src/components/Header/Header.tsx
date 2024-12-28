import React from 'react';
import styles from './Header.module.css';

/**
 * Header:
 * - Title: "StatSwap"
 * - Subtitle: "er's Stats"
 */
const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>StatSwap</h1>
      <h2 className={styles.subtitle}>Find each player's stats</h2>
    </header>
  );
};

export default Header;
