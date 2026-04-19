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
  const playMode = useGameStore(s => s.playMode);
  const availableElements = useGameStore(s => s.availableElements);
  const lives = useGameStore(s => s.lives);
  const score = useGameStore(s => s.score);
  const phase = useGameStore(s => s.phase);
  const stage = useGameStore(s => s.stage);
  const addToTray = useGameStore(s => s.addToTray);
  const resetTray = useGameStore(s => s.resetTray);
  const checkAnswer = useGameStore(s => s.checkAnswer);
  const goToMenu = useGameStore(s => s.goToMenu);
  const goToModeMenu = useGameStore(s => s.goToModeMenu);
  const openDogan = useGameStore(s => s.openDogan);

  if (playMode !== 'sandbox' && (!compound || !difficulty)) return null;

  const showModal = phase === 'success' || phase === 'fail' || phase === 'gameover';
  const maxLives = playMode === 'hardcore' ? 1 : 3;
  const isSandbox = playMode === 'sandbox';
  const isMimic = difficulty === 'mimic';
  const showFormula = playMode !== 'hardcore' && !isSandbox;
  const showTargetCard = !isSandbox && !isMimic;

  const handleElementSelect = (symbol: string) => {
    const audio = new Audio('/audio/element_select_click.wav');
    audio.volume = 0.45;
    void audio.play().catch(() => undefined);
    addToTray(symbol);
  };

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.header}>
        {isSandbox ? (
          <>
            <button className={styles.headerBtn} onClick={goToModeMenu}>되돌아가기</button>
            <button className={styles.bookBtn} onClick={openDogan} aria-label="도감 보기">
              <span className={styles.bookSpine} />
              <span className={styles.bookPages} />
              <span className={styles.bookText}>도감</span>
            </button>
            <div className={styles.score}>SANDBOX</div>
          </>
        ) : (
          <>
            <div className={styles.lives}>
              {Array.from({ length: maxLives }).map((_, i) => (
                <span key={i} className={i < lives ? styles.heartFull : styles.heartEmpty}>
                  {i < lives ? '❤️' : '🤍'}
                </span>
              ))}
            </div>
            <button className={styles.diffBadge} onClick={goToMenu}>
              🔒 {DIFFICULTY_LABELS[difficulty!]}
            </button>
            <div className={styles.score}>{score} P</div>
          </>
        )}
      </div>

      {isSandbox ? (
        <p className={styles.sandboxHint}>문제 없이 자유롭게 조합해보고, 막히면 도감을 바로 열어보세요.</p>
      ) : showTargetCard ? (
        <div className={styles.target}>
          <div className={styles.targetLabel}>TARGET COMPOUND · STAGE {stage}</div>
          <div className={styles.targetName}>[{compound!.name}]</div>
          {showFormula && <div className={styles.targetFormula}>{compound!.formula}</div>}
        </div>
      ) : null}

      {/* Elements row */}
      <div className={styles.elements}>
        {availableElements.map(sym => (
          <ElementTile
            key={sym}
            symbol={sym}
            onClick={() => handleElementSelect(sym)}
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
      {((!isSandbox && showModal) || (isSandbox && phase === 'success')) && <SuccessModal />}
    </div>
  );
}
