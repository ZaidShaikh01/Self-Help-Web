import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

export default function DinoRunner({ compact = false }: { compact?: boolean }) {
  const [obstaclePosition, setObstaclePosition] = useState(105);
  const [isJumping, setIsJumping] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const obstaclePositionRef = useRef(105);
  const jumpingRef = useRef(false);

  const jump = useCallback(() => {
    if (gameOver || !isRunning || isJumping) return;
    setIsJumping(true);
    jumpingRef.current = true;
    jumpTimer.current = setTimeout(() => {
      jumpingRef.current = false;
      setIsJumping(false);
    }, 610);
  }, [gameOver, isJumping, isRunning]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'BUTTON' || target?.tagName === 'INPUT') return;
      event.preventDefault();
      jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (!isRunning || gameOver) return;
    const timer = setInterval(() => {
      obstaclePositionRef.current -= 2;
      if (obstaclePositionRef.current < 0) {
        obstaclePositionRef.current = 105;
        setScore((current) => current + 1);
      }
      setObstaclePosition(obstaclePositionRef.current);
      if (
        obstaclePositionRef.current <= 18 &&
        obstaclePositionRef.current >= 9 &&
        !jumpingRef.current
      ) {
          setGameOver(true);
          setIsRunning(false);
      }
    }, 48);
    return () => clearInterval(timer);
  }, [gameOver, isRunning]);

  useEffect(
    () => () => {
      if (jumpTimer.current) clearTimeout(jumpTimer.current);
      obstaclePositionRef.current = 105;
      jumpingRef.current = false;
    },
    [],
  );

  const restart = () => {
    if (jumpTimer.current) clearTimeout(jumpTimer.current);
    setObstaclePosition(105);
    setIsJumping(false);
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
  };

  return (
    <section className={`dino-card${compact ? ' dino-card--compact' : ''}`} aria-label="Dino runner mini game">
      <header className="dino-card-header">
        <div>
          <p>QUICK BREAK</p>
          <h2>{compact ? 'Dino Dash' : 'A little room to play.'}</h2>
        </div>
        <span className="dino-score">SCORE <strong>{score}</strong></span>
      </header>
      <button
        type="button"
        className={`dino-playfield${gameOver ? ' is-over' : ''}`}
        onClick={jump}
        aria-label={gameOver ? `Game over. Score ${score}. Click to jump after restart.` : 'Jump over the cactus'}
      >
        <span className={`dino-runner${isJumping ? ' is-jumping' : ''}`} aria-hidden="true">▰</span>
        {!gameOver && (
          <span
            className="dino-obstacle"
            style={{ left: `${obstaclePosition}%` }}
            aria-hidden="true"
          >♟</span>
        )}
        {gameOver && <span className="dino-game-over">OOPS — TRY AGAIN</span>}
        <span className="dino-ground" aria-hidden="true" />
      </button>
      <footer className="dino-card-footer">
        <span>{gameOver ? 'Nice run. Go again?' : 'Tap the field or press Space to jump.'}</span>
        {gameOver ? (
          <button type="button" onClick={restart}><RotateCcw size={14} /> Play again</button>
        ) : (
          <button type="button" onClick={jump} disabled={isJumping}>Jump</button>
        )}
      </footer>
      {compact && <Link className="dino-full-games-link" to="/games">Explore all games →</Link>}
    </section>
  );
}
