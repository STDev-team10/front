import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_LABELS, type Difficulty } from '../data/compounds';
import styles from './DoganScreen.module.css';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'mimic'];
const VISIBLE_CARD_LIMIT = 5;

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#A8E8B5',
  medium: '#F9D56E',
  hard: '#FFB3B3',
  mimic: '#C3A6E5',
};

export default function DoganScreen() {
  const unlockedIds = useGameStore(s => s.unlockedIds);
  const goToMenu = useGameStore(s => s.goToMenu);
  const compounds = useGameStore(s => s.compounds);
  const compoundsTotal = useGameStore(s => s.compoundsTotal);
  const compoundsPending = useGameStore(s => s.compoundsPending);
  const compoundsError = useGameStore(s => s.compoundsError);

  const total = compoundsTotal;
  const unlocked = compounds.filter(c => unlockedIds.has(c.id)).length;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={goToMenu}>← 메뉴</button>
        <div className={styles.titleWrap}>
          <span className={styles.title}>📚 화합물 도감</span>
          <span className={styles.progress}>{unlocked} / {total} 수집</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${total === 0 ? 0 : (unlocked / total) * 100}%` }}
        />
      </div>

      {compoundsError && <p className={styles.empty}>화합물 데이터를 불러오지 못했어요: {compoundsError}</p>}
      {compoundsPending && !compoundsError && <p className={styles.empty}>화합물 도감을 불러오는 중이에요...</p>}

      {DIFFICULTY_ORDER.map(diff => {
        const filteredCompounds = compounds.filter(c => c.difficulty === diff);
        const visibleCompounds = filteredCompounds.slice(0, VISIBLE_CARD_LIMIT);
        const hiddenCount = Math.max(filteredCompounds.length - VISIBLE_CARD_LIMIT, 0);
        return (
          <section key={diff} className={styles.section}>
            <h2 className={styles.sectionTitle}>{DIFFICULTY_LABELS[diff]}</h2>
            <div className={styles.grid}>
              {visibleCompounds.map(c => {
                const isUnlocked = unlockedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`${styles.card} ${isUnlocked ? styles.unlocked : styles.locked}`}
                  >
                    <div
                      className={styles.diffDot}
                      style={{ background: DIFF_COLORS[diff] }}
                    />
                    <div className={styles.emojiBox}>
                      {isUnlocked ? (
                        <span className={styles.emoji}>{c.emoji}</span>
                      ) : (
                        <span className={styles.lock}>🔒</span>
                      )}
                    </div>
                    <div className={styles.info}>
                      <p className={styles.name}>
                        {isUnlocked ? c.name : '???'}
                      </p>
                      <p className={styles.formula}>
                        {isUnlocked ? c.formula : '- - -'}
                      </p>
                      {isUnlocked && (
                        <p className={styles.desc}>{c.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {hiddenCount > 0 && (
                <div className={styles.moreCard}>
                  <div className={styles.moreCount}>+{hiddenCount}</div>
                  <p className={styles.moreLabel}>개의 화합물 더 있어요</p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
