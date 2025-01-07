import React, { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './PlacedTile.module.css';

interface PlacedTileProps {
  tileId: string;
  statValue: string;
  isLocked: boolean;
  isRed: boolean;
  shakingTiles: Set<string>;
}

const PlacedTile: React.FC<PlacedTileProps> = ({
  tileId,
  statValue,
  isLocked,
  isRed,
  shakingTiles
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: tileId,
    disabled: isLocked
  });

  /**
   * Priority:
   * 1) If locked => green
   * 2) else if isDragging => white
   * 3) else if isRed => red
   * 4) else => white
   */
  const style = useMemo(() => {
    let background = '#d4d6da';
    let color = '#000';

    if (isLocked) {
      background = 'green';
      color = '#fff';
    } else if (isDragging) {
      background = '#d4d6da';  // revert to normal color while dragging
      color = '#000';
    } else if (isRed) {
      background = 'red';
      color = '#fff';
    }

    return {
      transform: transform ? CSS.Translate.toString(transform) : undefined,
      opacity: isDragging ? 0.8 : 1, // slightly transparent, as requested
      cursor: isLocked ? 'default' : 'grab',
      backgroundColor: background,
      color: color,
      zIndex: isDragging ? 9999 : 'auto' // ensures it goes above the grid
    };
  }, [transform, isDragging, isLocked, isRed]);

  return (
    <div
      ref={setNodeRef}
      className={styles.placedTile}
      style={style}
      {...(!isLocked ? listeners : {})}
      {...(!isLocked ? attributes : {})}
    >
      {statValue}
    </div>
  );
};

export default PlacedTile;
