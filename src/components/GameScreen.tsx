import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_LABELS } from '../data/compounds';
import ElementTile from './ElementTile';
import ChemistryTray from './ChemistryTray';
import SuccessModal from './SuccessModal';
import MimicPreview from './MimicPreview';
import styles from './GameScreen.module.css';

export default function GameScreen() {
  const compound = useGameStore(s => s.currentCompound);
  const difficulty = useGameStore(s => s.difficulty);
  const availableElements = useGameStore(s => s.availableElements);
  const lives = useGameStore(s => s.lives);
  const score = useGameStore(s => s.score);
  const phase = useGameStore(s => s.phase);
  const stage = useGameStore(s => s.stage);
  const addToTray = useGameStore(s => s.addToTray);
  const resetTray = useGameStore(s => s.resetTray);
  const checkAnswer = useGameStore(s => s.checkAnswer);
  const goToMenu = useGameStore(s => s.goToMenu);

  if (!compound || !difficulty) return null;

  const showModal = phase === 'success' || phase === 'fail' || phase === 'gameover';

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.lives}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? styles.heartFull : styles.heartEmpty}>
              {i < lives ? '❤️' : '🤍'}
            </span>
          ))}
        </div>
        <button className={styles.diffBadge} onClick={goToMenu}>
          🔒 {DIFFICULTY_LABELS[difficulty]}
        </button>
        <div className={styles.score}>{score} P</div>
      </div>

      {/* Target compound */}
      <div className={styles.target}>
        <div className={styles.targetLabel}>TARGET COMPOUND · STAGE {stage}</div>
        <div className={styles.targetName}>[{compound.name}]</div>
        <div className={styles.targetFormula}>{compound.formula}</div>
      </div>

      {/* Elements row */}
      <div className={styles.elements}>
        {availableElements.map(sym => (
          <ElementTile
            key={sym}
            symbol={sym}
            onClick={() => addToTray(sym)}
            onDragStart={e => e.dataTransfer.setData('text/plain', sym)}
          />
        ))}
      </div>

      {/* Chemistry tray */}
      <ChemistryTray />

      {/* Action buttons */}
      <div className={styles.actions}>
        <button className={styles.resetBtn} onClick={resetTray} title="초기화">
          ↺
        </button>
        <button className={styles.mixBtn} onClick={checkAnswer}>
          맛있게 비비기! 🥄
        </button>
      </div>

      {phase === 'mimic-preview' && <MimicPreview />}
      {showModal && <SuccessModal />}
    </div>
  );
}
