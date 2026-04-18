import { type Difficulty, DIFFICULTY_LABELS, DIFFICULTY_EMOJIS } from '../data/compounds';
import { useGameStore } from '../store/gameStore';
import styles from './MenuScreen.module.css';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'mimic'];

export default function MenuScreen() {
  const startGame = useGameStore(s => s.startGame);
  const openDogan = useGameStore(s => s.openDogan);
  const goToModeMenu = useGameStore(s => s.goToModeMenu);
  const logout = useGameStore(s => s.logout);
  const user = useGameStore(s => s.user);
  const playMode = useGameStore(s => s.playMode);
  const unlockedIds = useGameStore(s => s.unlockedIds);
  const compounds = useGameStore(s => s.compounds);
  const compoundsTotal = useGameStore(s => s.compoundsTotal);
  const compoundsPending = useGameStore(s => s.compoundsPending);
  const compoundsError = useGameStore(s => s.compoundsError);
  const unlockedCount = compounds.filter(c => unlockedIds.has(c.id)).length;

  return (
    <div className={styles.container}>
      {/* 유저 정보 */}
      <div className={styles.userBar}>
        <div className={styles.userMeta}>
          <span className={styles.userName}>
            {user?.isGuest ? '👀 게스트' : `👤 ${user?.name}`}
          </span>
          <button className={styles.backBtn} onClick={goToModeMenu}>← 모드 선택</button>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </div>

      <div className={styles.titleBox}>
        <div className={styles.titleEmoji}>🥗</div>
        <h1 className={styles.title}>화학 비빔밥</h1>
        <p className={styles.modeChip}>
          {playMode === 'hardcore' ? 'HARDCORE MODE' : playMode === 'sandbox' ? 'SANDBOX MODE' : 'NORMAL MODE'}
        </p>
        <p className={styles.subtitle}>올바른 원소를 조합해 화합물을 만들어보세요!</p>
      </div>

      <div className={styles.levels}>
        {DIFFICULTIES.map((d, i) => (
          <button key={d} className={styles.levelBtn} onClick={() => startGame(d)}>
            <span className={styles.levelEmoji}>{DIFFICULTY_EMOJIS[d]}</span>
            <div className={styles.levelText}>
              <span className={styles.levelStep}>LEVEL {i + 1}</span>
              <span className={styles.levelLabel}>{DIFFICULTY_LABELS[d]}</span>
            </div>
          </button>
        ))}
      </div>

      <button className={styles.doganBtn} onClick={openDogan}>
        📚 화합물 도감
        <span className={styles.doganCount}>{unlockedCount} / {compoundsTotal}</span>
      </button>

      <p className={styles.hint}>
        {compoundsError
          ? compoundsError
          : compoundsPending
            ? '화합물 데이터를 불러오는 중이에요...'
            : '원소를 클릭하거나 드래그해서 트레이에 넣으세요!'}
      </p>
    </div>
  );
}
