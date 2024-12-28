import React from 'react';
import AnswerCell from './AnswerCell';
import styles from './AnswerGrid.module.css';
import playerStats from '../../data/player_stats.json';

interface CellStatus {
  locked: boolean;
  incorrectHistory: Set<string>; 
}

interface AnswerGridProps {
  placements: Record<string, string | null>;
  tileMap: Record<string, string>;
  cellStatus: Record<string, CellStatus>;
}

const AnswerGrid: React.FC<AnswerGridProps> = ({
  placements,
  tileMap,
  cellStatus
}) => {
  const players = Object.keys(playerStats);
  if (!players.length) {
    return <div>No data loaded for playerStats.</div>;
  }

  const categories = Object.keys(playerStats[players[0]]);

  return (
    <div className={styles.container}>
      {/* top row: corner + players */}
      <div className={styles.headerRow}>
        <div className={styles.cornerLabel} />
        {players.map((p) => (
          <div key={p} className={styles.playerLabel}>
            {p}
          </div>
        ))}
      </div>

      {categories.map((cat) => (
        <div className={styles.gridRow} key={cat}>
          <div className={styles.categoryLabel}>{cat}</div>
          {players.map((p) => {
            const cellId = `${p}-${cat}`;
            const occupantId = placements[cellId];
            const occupantVal = occupantId ? tileMap[occupantId] : null;
            const { locked, incorrectHistory } = cellStatus[cellId];

            return (
              <AnswerCell
                key={cellId}
                droppableId={cellId}
                occupantTileId={occupantId}
                occupantValue={occupantVal}
                locked={locked}
                wasIncorrect={
                  occupantId
                    ? incorrectHistory.has(occupantId)
                    : false
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AnswerGrid;
