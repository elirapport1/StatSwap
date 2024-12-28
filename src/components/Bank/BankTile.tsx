import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './BankTile.module.css';

/**
 * BankTile:
 *
 * One draggable stat tile in the bank. The "draggableId" prop is the unique
 * identifier used by dnd-kit to differentiate this tile from others.
 *
 * "statValue" is the numeric or string statistic (e.g. "11637").
 */
interface BankTileProps {
  draggableId: string;
  statValue: string;
}

const BankTile: React.FC<BankTileProps> = ({ draggableId, statValue }) => {
  /**
   * useDraggable:
   * - "id" is the unique identifier recognized by dnd-kit
   * - "transform" is an object with x, y, scale, etc.
   * - "attributes" + "listeners" are spread onto the element to make it draggable
   */
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId
  });

  /**
   * We'll translate the tile's position with CSS transform. This is the recommended
   * performance-friendly approach for moving draggable elements.
   */
  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div
      ref={setNodeRef}
      className={styles.tile}
      style={style}
      {...listeners}
      {...attributes}
    >
      {statValue}
    </div>
  );
};

export default BankTile;
