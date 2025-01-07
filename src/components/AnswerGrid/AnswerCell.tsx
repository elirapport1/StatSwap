import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './AnswerCell.module.css';
import PlacedTile from './PlacedTile.tsx';

interface AnswerCellProps {
  droppableId: string;
  occupantTileId: string | null;
  occupantValue: string | null;
  locked: boolean;
  wasIncorrect: boolean;
  shakingTiles?: Set<string>;
}

const AnswerCell: React.FC<AnswerCellProps> = ({
  droppableId,
  occupantTileId,
  occupantValue,
  locked,
  wasIncorrect,
  shakingTiles
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: locked
  });

  let baseColor = '#666';
  let highlightColor = '#444';
  if (locked) {
    baseColor = 'green';
    highlightColor = 'green';
  }

  const style = {
    backgroundColor: isOver ? highlightColor : baseColor,
    position: 'relative' as 'relative'
  };

  return (
    <div ref={setNodeRef} className={styles.cell} style={style}>
      {occupantTileId && occupantValue && (
        <PlacedTile
          tileId={occupantTileId}
          statValue={occupantValue}
          isLocked={locked}
          isRed={wasIncorrect}
          shakingTiles={shakingTiles || new Set()}
        />
      )}
    </div>
  );
};

export default AnswerCell;
