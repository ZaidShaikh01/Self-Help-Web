import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const SIZE = 8;
const MINES = 10;

interface Cell {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

function createBoard(safeIndex: number): Cell[][] {
  const safeRow = Math.floor(safeIndex / SIZE);
  const safeColumn = safeIndex % SIZE;
  const candidates = Array.from({ length: SIZE * SIZE }, (_, index) => index).filter(
    (index) => index !== safeIndex,
  );
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }
  const mineLocations = new Set(candidates.slice(0, MINES));

  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, column) => {
      const mine = mineLocations.has(row * SIZE + column);
      let adjacent = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const neighborRow = row + dy;
          const neighborColumn = column + dx;
          if (
            neighborRow >= 0 &&
            neighborRow < SIZE &&
            neighborColumn >= 0 &&
            neighborColumn < SIZE &&
            mineLocations.has(neighborRow * SIZE + neighborColumn)
          ) {
            adjacent += 1;
          }
        }
      }
      return { mine, adjacent, revealed: false, flagged: false };
    }),
  );
}

function revealEmpty(board: Cell[][], row: number, column: number) {
  const cell = board[row]?.[column];
  if (!cell || cell.revealed || cell.flagged || cell.mine) return;
  cell.revealed = true;
  if (cell.adjacent) return;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dy !== 0 || dx !== 0) revealEmpty(board, row + dy, column + dx);
    }
  }
}

export default function Minesweeper() {
  const [board, setBoard] = useState<Cell[][] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const startOver = () => {
    setBoard(null);
    setGameOver(false);
    setWon(false);
  };

  const reveal = (row: number, column: number) => {
    if (gameOver || board?.[row]?.[column]?.flagged) return;
    const next = board ? board.map((line) => line.map((cell) => ({ ...cell }))) : createBoard(row * SIZE + column);
    const cell = next[row][column];
    if (cell.mine) {
      next.forEach((line) => line.forEach((item) => {
        if (item.mine) item.revealed = true;
      }));
      setBoard(next);
      setGameOver(true);
      setWon(false);
      return;
    }
    revealEmpty(next, row, column);
    const revealedSafe = next.flat().filter((item) => item.revealed && !item.mine).length;
    setBoard(next);
    if (revealedSafe === SIZE * SIZE - MINES) {
      setGameOver(true);
      setWon(true);
    }
  };

  const toggleFlag = (event: React.MouseEvent, row: number, column: number) => {
    event.preventDefault();
    if (gameOver || !board) return;
    const next = board.map((line) => line.map((cell) => ({ ...cell })));
    const cell = next[row][column];
    if (!cell.revealed) cell.flagged = !cell.flagged;
    setBoard(next);
  };

  const flaggedCount = board?.flat().filter((cell) => cell.flagged).length ?? 0;

  return (
    <section className="minesweeper-card" aria-label="Minesweeper game">
      <header className="minesweeper-header">
        <div>
          <p>MINDS AT EASE</p>
          <h2>Minesweeper</h2>
        </div>
        <div className="minesweeper-counter">MINES <strong>{MINES - flaggedCount}</strong></div>
      </header>
      <div className="minesweeper-board" role="grid" aria-label="8 by 8 minesweeper board">
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const row = Math.floor(index / SIZE);
          const column = index % SIZE;
          const cell = board?.[row]?.[column];
          const label = cell?.flagged
            ? `Row ${row + 1}, column ${column + 1}, flagged`
            : cell?.revealed
              ? `Row ${row + 1}, column ${column + 1}, ${cell.mine ? 'mine' : cell.adjacent ? `${cell.adjacent} nearby mines` : 'empty'}`
              : `Row ${row + 1}, column ${column + 1}, hidden`;
          return (
            <button
              type="button"
              key={index}
              role="gridcell"
              aria-label={label}
              className={`minesweeper-cell${cell?.revealed ? ' is-revealed' : ''}${cell?.mine && cell.revealed ? ' is-mine' : ''}`}
              onClick={() => reveal(row, column)}
              onContextMenu={(event) => toggleFlag(event, row, column)}
            >
              {cell?.flagged ? '⚑' : cell?.revealed ? cell.mine ? '✹' : cell.adjacent || '' : ''}
            </button>
          );
        })}
      </div>
      <footer className="minesweeper-footer">
        <span>{gameOver ? won ? 'All clear. Nicely done.' : 'That one was a mine.' : 'Open a square. Right-click to flag a mine.'}</span>
        <button type="button" onClick={startOver}><RotateCcw size={14} /> New game</button>
      </footer>
    </section>
  );
}
