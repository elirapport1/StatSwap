import React, { useState, useEffect } from 'react';
import { DndContext, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import playerStats from './data/player_stats.json';

import Header from './components/Header/Header';
import AttemptsIndicator from './components/AttemptsIndicator/AttemptsIndicator';
import AnswerGrid from './components/AnswerGrid/AnswerGrid';
import Bank from './components/Bank/Bank';
import { useGameContext } from './context/GameContext';
import GuessControls from './components/GuessControls/GuessControls';
import styles from './components/GuessControls/GuessControls.module.css';
import GameEndModal from './components/GameEndModal/GameEndModal';

/**
 * placements: cellId -> occupantTileId
 */
type Placements = Record<string, string | null>;

interface TileData {
  tileId: string;
  statValue: string;
}

/**
 * We track "locked" if the user got it correct, 
 * and "incorrectHistory" to see if tile X on cell Y was guessed incorrectly before.
 */
interface CellStatus {
  locked: boolean;
  incorrectHistory: Set<string>; 
  // which tileIds were guessed incorrectly in this cell
}

/** parse the "player" portion from "Derek Fisher-Career Minutes" */
function parsePlayer(cellId: string): string {
  return cellId.split('-')[0].trim();
}
/** parse the "category" portion */
function parseCategory(cellId: string): string {
  return cellId.split('-').slice(1).join('-').trim();
}

const App: React.FC = () => {
  const {
    attemptsLeft,
    setAttemptsLeft,
    gameResult,
    setGameResult
  } = useGameContext();

  const [activeId, setActiveId] = useState<string | null>(null);

  /**
   * 1) Build the tile data from playerStats
   */
  const [allTiles, setAllTiles] = useState<TileData[]>([]);

  useEffect(() => {
    const statsArray: string[] = [];
    for (const p in playerStats) {
      const statsObj = playerStats[p];
      for (const c in statsObj) {
        const val = statsObj[c];
        statsArray.push(val != null ? String(val) : 'N/A');
      }
    }
    const shuffled = [...statsArray].sort(() => 0.5 - Math.random());
    const tileObjs = shuffled.map((val, i) => ({
      tileId: `bankTile-${i}`,
      statValue: val
    }));
    setAllTiles(tileObjs);
  }, []);

  // tileMap: tileId -> statValue
  const tileMap = allTiles.reduce<Record<string, string>>((acc, t) => {
    acc[t.tileId] = t.statValue;
    return acc;
  }, {});

  /**
   * 2) placements: For each cell, which occupant tile is there?
   */
  const [placements, setPlacements] = useState<Placements>(() => {
    const init: Placements = {};
    const players = Object.keys(playerStats);
    if (!players.length) return init;
    const categories = Object.keys(playerStats[players[0]]);
    for (const p of players) {
      for (const c of categories) {
        init[`${p}-${c}`] = null;
      }
    }
    return init;
  });

  /**
   * 3) cellStatus: For each cell, track {locked, incorrectHistory}
   * locked = user got it correct
   * incorrectHistory = which tileIds were guessed incorrectly here in the past
   */
  const [cellStatus, setCellStatus] = useState<Record<string, CellStatus>>(() => {
    const init: Record<string, CellStatus> = {};
    const players = Object.keys(playerStats);
    if (!players.length) return init;
    const categories = Object.keys(playerStats[players[0]]);
    for (const p of players) {
      for (const c of categories) {
        init[`${p}-${c}`] = {
          locked: false,
          incorrectHistory: new Set<string>()
        };
      }
    }
    return init;
  });

  // For short banners
  const [correctBanner, setCorrectBanner] = useState(false);
  const [incorrectBanner, setIncorrectBanner] = useState(false);

  // For final popup
  const [finalGrid, setFinalGrid] = useState<('correct'|'incorrect')[][]>([[],[],[]]);
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  function updatePlacements(fn: (prev: Placements) => Placements) {
    setPlacements((prev) => fn(prev));
  }
  function updateCellStatus(fn: (prev: Record<string, CellStatus>) => Record<string, CellStatus>) {
    setCellStatus((prev) => fn(prev));
  }

  /** On drag over: If the target cell is locked => do nothing special. 
   * We'll finalize in onDragEnd. 
   */
  function handleDragOver(e: DragOverEvent) {
    // not strictly needed, but sometimes useful to check locked
  }

  /** On drag end: finalize tile placement. 
   *  - If user drops on a locked cell => revert
   *  - If user drops on a cell that has occupant => occupant is bumped to bank
   *  - If cell was incorrect for this tile in the past => tile is red
   */
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) {
      setActiveId(null);
      return;
    }
    const fromTileId = active.id;
    const toCellId = over.id;

    // If dropping onto bank => remove occupant from old cell
    if (toCellId === 'STAT_BANK') {
      updatePlacements((prev) => {
        const copy = { ...prev };
        for (const cid in copy) {
          if (copy[cid] === fromTileId) {
            copy[cid] = null;
          }
        }
        return copy;
      });
      setActiveId(null);
      return;
    }

    // If the target cell is not recognized, revert
    if (!placements.hasOwnProperty(toCellId)) {
      setActiveId(null);
      return;
    }

    // If cell is locked => revert
    if (cellStatus[toCellId].locked) {
      setActiveId(null);
      return;
    }

    // Bump occupant if any
    updatePlacements((prev) => {
      const copy = { ...prev };

      // Remove tile from old cell
      for (const cid in copy) {
        if (copy[cid] === fromTileId) {
          copy[cid] = null;
        }
      }

      // If the cell already occupant => bump occupant to bank
      const occupant = copy[toCellId];
      if (occupant) {
        copy[toCellId] = null;
      }

      copy[toCellId] = fromTileId;
      return copy;
    });

    setActiveId(null);
  }

  /** handleSubmitGuess:
   *  - Decrement attempt
   *  - For each cell occupant, check correctness. If correct => lock. If not => revert occupant, record that occupant was incorrect for that cell => future placements of that occupant on that cell => red
   */
  function handleSubmitGuess() {
    if (attemptsLeft <= 0 || gameResult !== 'none') return;

    setAttemptsLeft((prev) => prev - 1);
    setAttemptsUsed((prev) => prev + 1);

    const newPlacements = { ...placements };
    const newCellStatus = { ...cellStatus };
    const players = Object.keys(playerStats);
    const categories = Object.keys(playerStats[players[0]]);

    let allCorrect = true;

    for (const cid in newPlacements) {
      const occupantTile = newPlacements[cid];
      if (!occupantTile) {
        // empty => not correct
        allCorrect = false;
        continue;
      }

      // Check correctness
      const p = parsePlayer(cid);
      const cat = parseCategory(cid);
      const needed = String(playerStats[p][cat]);
      const tileVal = tileMap[occupantTile];

      if (tileVal === needed) {
        // correct => lock cell
        newCellStatus[cid] = {
          locked: true,
          incorrectHistory: newCellStatus[cid].incorrectHistory
        };
      } else {
        // incorrect => revert occupant
        newPlacements[cid] = null;
        // record occupant in incorrectHistory
        const newSet = new Set(newCellStatus[cid].incorrectHistory);
        newSet.add(occupantTile);
        newCellStatus[cid] = {
          locked: false,
          incorrectHistory: newSet
        };
        allCorrect = false;
      }
    }

    setPlacements(newPlacements);
    setCellStatus(newCellStatus);

    // if every cell is locked => user wins
    let everyLocked = true;
    for (const c in newCellStatus) {
      if (!newCellStatus[c].locked) {
        everyLocked = false;
        break;
      }
    }

    // If attemptsLeft-1 <= 0 => lose
    if (attemptsLeft - 1 <= 0 && (!everyLocked)) {
      setGameResult('lose');
      buildFinalGridForPopup(newPlacements);
    } else {
      if (everyLocked) {
        setGameResult('win');
        buildFinalGridForPopup(newPlacements);
      }
    }
  }

  function buildFinalGridForPopup(placementSnapshot: Placements) {
    const players = Object.keys(playerStats);
    const categories = Object.keys(playerStats[players[0]]);
    const grid: ('correct'|'incorrect')[][] = [[],[],[]];
    for (let i=0;i<3;i++){
      for (let j=0;j<3;j++){
        const cellId = `${players[j]}-${categories[i]}`;
        const occupant = placementSnapshot[cellId];
        if (!occupant) {
          grid[i][j] = 'incorrect';
        } else {
          const needed = String(playerStats[players[j]][categories[i]]);
          const tileVal = tileMap[occupant];
          grid[i][j] = (tileVal===needed) ? 'correct':'incorrect';
        }
      }
    }
    setFinalGrid(grid);
  }

  return (
    <div className="App">
      <Header />

      <DndContext
        onDragStart={(e) => {
          setActiveId(e.active.id as string);
        }}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="mainContainer">
          <div className={styles.alertContainer}>
            {correctBanner && <div className={styles.correctBanner}>Correct!</div>}
            {incorrectBanner && <div className={styles.incorrectBanner}>Incorrect!</div>}
          </div>

          <AnswerGrid
            placements={placements}
            tileMap={tileMap}
            cellStatus={cellStatus}
          />

          <div className="topRow">
            <AttemptsIndicator />
            <GuessControls
              placements={placements}
              onSubmitGuess={handleSubmitGuess}
            />
          </div>

          <Bank allTiles={allTiles} placements={placements} />

          {gameResult !== 'none' && (
            <GameEndModal
              gameResult={gameResult as ('win'|'lose')}
              attemptsUsed={attemptsUsed}
              finalGrid={finalGrid}
              onClose={() => {
                setGameResult('none');
              }}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default App;
