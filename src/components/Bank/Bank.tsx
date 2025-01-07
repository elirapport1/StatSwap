import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import BankTile from './BankTile.tsx';
import styles from './Bank.module.css';

/**
 * We now receive:
 *  - allTiles: the full array of TileData { tileId, statValue }
 *  - placements: dictionary { cellId -> tileId }
 *    so we know which tiles are on the grid
 * 
 * Additionally, we define a droppable area here (id="STAT_BANK") so that
 * users can drop tiles onto the bank to remove them from the grid.
 */
interface TileData {
  tileId: string;
  statValue: string;
}

interface BankProps {
  allTiles: TileData[];
  placements: Record<string, string | null>;
}

const Bank: React.FC<BankProps> = ({ allTiles, placements }) => {
  // We create a droppable container for the ENTIRE bank area:
  const { setNodeRef: bankRef } = useDroppable({
    id: 'STAT_BANK' // We'll check for this ID in handleDragEnd
  });

  // Helper: is a given tileId in the grid?
  const isTileInGrid = (tileId: string) => {
    return Object.values(placements).includes(tileId);
  };

  // Filter out tiles that are in the grid
  const availableTiles = allTiles.filter((tile) => !isTileInGrid(tile.tileId));

  // We'll do 2 rows => first 4 tiles, then next 5
  const row1 = availableTiles.slice(0, 4);
  const row2 = availableTiles.slice(4);

  return (
    // Attach our droppable ref to the main bank container
    <div ref={bankRef} className={styles.bankContainer}>
      <div className={styles.row}>
        {row1.map((tile) => (
          <BankTile
            key={tile.tileId}
            draggableId={tile.tileId}
            statValue={tile.statValue}
          />
        ))}
      </div>
      <div className={styles.row}>
        {row2.map((tile) => (
          <BankTile
            key={tile.tileId}
            draggableId={tile.tileId}
            statValue={tile.statValue}
          />
        ))}
      </div>
    </div>
  );
};

export default Bank;
