import { useGameStore } from '../store/gameStore';
import styles from './SuccessModal.module.css';

export default function SuccessModal() {
  const compound = useGameStore(s => s.currentCompound);
  const phase = useGameStore(s => s.phase);
  const nextStage = useGameStore(s => s.nextStage);
  const goToMenu = useGameStore(s => s.goToMenu);
  const remainingCompounds = useGameStore(s => s.remainingCompounds);

  if (!compound || (phase !== 'success' && phase !== 'gameover' && phase !== 'fail')) return null;

  const isSuccess = phase === 'success';
  const isGameOver = phase === 'gameover';
  const isFail = phase === 'fail';
  const hasMore = remainingCompounds.length > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {isSuccess && (
          <>
            <div className={styles.imgBox}>
              <span className={styles.emoji}>{compound.emoji}</span>
            </div>
            <h2 className={styles.compoundName}>{compound.name}</h2>
            <p className={styles.formula}>{compound.formula}</p>
            <div className={styles.descBox}>
              <p className={styles.desc}>"{compound.description}"</p>
            </div>
            <button className={styles.nextBtn} onClick={hasMore ? nextStage : goToMenu}>
              {hasMore ? '다음 단계 ›' : '메뉴로 돌아가기 ›'}
            </button>
          </>
        )}

        {isFail && (
          <>
            <div className={styles.imgBox}>
              <span className={styles.emoji}>💔</span>
            </div>
            <h2 className={styles.compoundName}>앗, 틀렸어요!</h2>
            <p className={styles.formula}>{compound.formula}</p>
            <div className={styles.descBox}>
              <p className={styles.desc}>
                정답은 {Object.entries(compound.elements).map(([e, c]) => `${e}×${c}`).join(', ')} 입니다.
              </p>
            </div>
            <button className={styles.nextBtn} onClick={nextStage}>
              다음 문제 도전 ›
            </button>
          </>
        )}

        {isGameOver && (
          <>
            <div className={styles.imgBox}>
              <span className={styles.emoji}>🎉</span>
            </div>
            <h2 className={styles.compoundName}>게임 완료!</h2>
            <p className={styles.formula}>모든 단계를 클리어했어요!</p>
            <button className={styles.nextBtn} onClick={goToMenu}>
              메뉴로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
