import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import DinoRunner from './DinoRunner';
import Minesweeper from './Minesweeper';

export default function GamesPage() {
  return (
    <div className="games-page">
      <header className="games-page-header">
        <div>
          <p>PLAY IS PART OF THE PLAN</p>
          <h1>Take a small break.</h1>
          <span>Two tiny games for a quick reset. Your progress stays right here.</span>
        </div>
        <Link to="/dashboard"><ArrowLeft size={15} /> Today</Link>
      </header>
      <div className="games-grid">
        <DinoRunner />
        <Minesweeper />
      </div>
      <p className="games-page-note">No accounts, scores, or data leave your browser for these games.</p>
    </div>
  );
}
