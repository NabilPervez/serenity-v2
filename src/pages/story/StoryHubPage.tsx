import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import '../../present.css';

/** Reflect — slower, written work, ordered by how often you do it (Nabil, 2026-11-03). */
const ROWS = [
  { to: '/reflect/quick', title: 'Reframe it.', meta: 'Anytime · 1 min', blurb: 'Turn what happened into the version that helps.' },
  { to: '/reflect/reframe', title: 'Guided reframe.', meta: 'Anytime · 5 min', blurb: 'Rewrite one harsh thought into a merciful one.' },
  { to: '/reflect/ledger', title: 'Effort ledger.', meta: 'Nightly', blurb: 'What I tried today, and what I hand to Allah.' },
  { to: '/reflect/pillars', title: 'Four pillars.', meta: 'Weekly', blurb: 'Community, purpose, charity, story.' },
];

export default function StoryHubPage() {
  return (
    <>
      <TopBar title="Reflect" icon="auto_stories" />
      <div className="pr-page">
        <header className="pr-hero animate-fade-up">
          <h1 className="pr-h1">The story I choose. <span>Written down.</span></h1>
        </header>
        <ul className="reflect-anchor">
          <li>Allah is the Most Forgiving and the Most Kind.</li>
          <li>I don't need to be perfect — Allah is in control, I am not.</li>
          <li>I control my effort, my emotions and my outlook.</li>
        </ul>
        <nav className="pr-spine" aria-label="Reflect">
          {ROWS.map((r, i) => (
            <Link key={r.to} to={r.to} className="pr-row reflect-link">
              <span className="pr-row-head" style={{ alignItems: 'flex-start' }}>
                <span className="pr-row-n">0{i + 1}</span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="pr-row-title">{r.title}</span>
                  <span className="pr-hint">{r.blurb}</span>
                </span>
                <span className="pr-row-meta">{r.meta}</span>
                <span className="material-symbols-outlined pr-row-chev" aria-hidden="true">chevron_right</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
