import { type Difficulty, DIFFICULTY_LABELS, DIFFICULTY_EMOJIS } from '../data/compounds';
import { useGameStore } from '../store/gameStore';
import styles from './MenuScreen.module.css';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'mimic'];

export default function MenuScreen() {
  const startGame = useGameStore(s => s.startGame);

  return (
    <div className={styles.container}>
      <div className={styles.titleBox}>
        <div className={styles.titleEmoji}>🥗</div>
        <h1 className={styles.title}>화학 비빔밥</h1>
        <p className={styles.subtitle}>올바른 원소를 조합해 화합물을 만들어보세요!</p>
      </div>

      <div className={styles.levels}>
        {DIFFICULTIES.map((d, i) => (
          <button key={d} className={styles.levelBtn} onClick={() => startGame(d)}>
            <span className={styles.levelEmoji}>{DIFFICULTY_EMOJIS[d]}</span>
            <span className={styles.levelStep}>LEVEL {i + 1}</span>
            <span className={styles.levelLabel}>{DIFFICULTY_LABELS[d]}</span>
          </button>
        ))}
      </div>

      <p className={styles.hint}>원소를 클릭하거나 드래그해서 트레이에 넣으세요!</p>
    </div>
  );
}
