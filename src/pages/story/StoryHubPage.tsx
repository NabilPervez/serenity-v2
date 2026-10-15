import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';

const TILES = [
  { to: '/story/reframe', icon: 'edit_note', title: 'Reframe', blurb: 'Rewrite one harsh thought into a merciful one' },
  { to: '/story/ledger', icon: 'nightlight', title: 'Effort Ledger', blurb: 'Tonight: what I tried, and what I hand to Allah' },
  { to: '/story/pillars', icon: 'foundation', title: 'Four Pillars', blurb: 'Weekly: Community, Purpose, Charity, Story' },
];

export default function StoryHubPage() {
  return (
    <>
      <TopBar title="Story" icon="auto_stories" />
      <div className="story-page">
        <div className="card anchor-card">
          <p className="story-section-title">The story I'm choosing</p>
          <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Allah is the Most Forgiving and the Most Kind.</li>
            <li>I don't need to be perfect — Allah is in control, I am not.</li>
            <li>I control my effort, my emotions and my outlook.</li>
          </ul>
        </div>
        <div className="story-hub">
          {TILES.map((t) => (
            <Link key={t.to} to={t.to} className="card story-tile">
              <div className="story-tile-icon"><span className="material-symbols-outlined">{t.icon}</span></div>
              <h3>{t.title}</h3>
              <p>{t.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
