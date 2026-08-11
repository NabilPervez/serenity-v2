import { useState } from 'react';
import { AFFIRMATIONS, COPING_SKILLS } from '../data/constants';
import { useAppStore } from '../store/useAppStore';

type Tab = 'affirmations' | 'coping';

export default function AffirmationsCopingModal() {
  const [tab, setTab] = useState<Tab>('affirmations');
  const {
    favoriteAffirmationIds,
    favoriteCopingSkillIds,
    toggleFavoriteAffirmation,
    toggleFavoriteCopingSkill,
  } = useAppStore();

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
        <button
          onClick={() => setTab('affirmations')}
          style={{
            flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem',
            background: tab === 'affirmations' ? 'var(--gradient-silk)' : 'transparent',
            color: tab === 'affirmations' ? 'white' : 'var(--color-on-surface-variant)',
          }}
        >
          Affirmations ({favoriteAffirmationIds.length}/7)
        </button>
        <button
          onClick={() => setTab('coping')}
          style={{
            flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.85rem',
            background: tab === 'coping' ? 'var(--gradient-silk)' : 'transparent',
            color: tab === 'coping' ? 'white' : 'var(--color-on-surface-variant)',
          }}
        >
          Coping Skills ({favoriteCopingSkillIds.length}/5)
        </button>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>
        {tab === 'affirmations'
          ? 'Choose up to 7 to say out loud each morning in the mirror.'
          : 'Pick up to 5 to practice daily.'}
      </p>

      {tab === 'affirmations' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 420, overflowY: 'auto' }}>
          {AFFIRMATIONS.map((aff) => {
            const checked = favoriteAffirmationIds.includes(aff.id);
            return (
              <label key={aff.id} className={`check-item${checked ? ' checked' : ''}`} htmlFor={`aff-${aff.id}`}>
                <input id={`aff-${aff.id}`} type="checkbox" checked={checked} onChange={() => toggleFavoriteAffirmation(aff.id)} />
                <span className="check-label" style={{ fontStyle: 'italic' }}>"{aff.text}"</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 420, overflowY: 'auto' }}>
          {COPING_SKILLS.map((skill) => {
            const checked = favoriteCopingSkillIds.includes(skill.id);
            return (
              <div
                key={skill.id}
                className={`coping-card${checked ? ' checked' : ''}`}
                onClick={() => toggleFavoriteCopingSkill(skill.id)}
                role="checkbox" aria-checked={checked} tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && toggleFavoriteCopingSkill(skill.id)}
              >
                <input type="checkbox" checked={checked} readOnly aria-hidden="true" />
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', marginTop: 2 }}>{skill.icon}</span>
                <div>
                  <p className="coping-title" style={{ fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>{skill.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>{skill.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
