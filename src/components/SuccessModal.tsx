import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { fetchCompoundExplanation } from '../api/ask';
import MoleculeViewer from './MoleculeViewer';
import styles from './SuccessModal.module.css';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export default function SuccessModal() {
  const compound = useGameStore(s => s.currentCompound);
  const phase = useGameStore(s => s.phase);
  const playMode = useGameStore(s => s.playMode);
  const lives = useGameStore(s => s.lives);
  const nextStage = useGameStore(s => s.nextStage);
  const dismissResult = useGameStore(s => s.dismissResult);
  const goToMenu = useGameStore(s => s.goToMenu);
  const remainingCompounds = useGameStore(s => s.remainingCompounds);
  const latestClearTimeMs = useGameStore(s => s.latestClearTimeMs);
  const latestTimeAttackRecord = useGameStore(s => s.latestTimeAttackRecord);
  const timeAttackRanking = useGameStore(s => s.timeAttackRanking);
  const myTimeAttackBest = useGameStore(s => s.myTimeAttackBest);
  const timeAttackPending = useGameStore(s => s.timeAttackPending);
  const timeAttackError = useGameStore(s => s.timeAttackError);
  const user = useGameStore(s => s.user);
  const newHallOfFameDiscovery = useGameStore(s => s.newHallOfFameDiscovery);
  const clearHallOfFameDiscovery = useGameStore(s => s.clearHallOfFameDiscovery);

  const isSuccess = phase === 'success';
  const isGameOver = phase === 'gameover';
  const isStageClear = isGameOver && lives > 0;
  const isLifeGameOver = isGameOver && lives <= 0;

  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isSuccess || !compound) return;
    setAiExplanation('');
    setAiLoading(true);
    fetchCompoundExplanation(compound.id)
      .then(setAiExplanation)
      .catch(() => undefined)
      .finally(() => setAiLoading(false));
  }, [compound?.name, isSuccess]);

  useEffect(() => {
    if (!isLifeGameOver) return;

    const audio = new Audio('/audio/game-over.mp3');
    audio.volume = 0.55;
    void audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isLifeGameOver]);

  if (!compound || (phase !== 'success' && phase !== 'gameover' && phase !== 'fail')) return null;
  const isFail = phase === 'fail';
  const hasMore = remainingCompounds.length > 0;
  const showFormula = playMode !== 'hardcore';
  const isSandbox = playMode === 'sandbox';
  const showTimeAttack = isSuccess && !isSandbox && !user?.isGuest && latestClearTimeMs !== null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {isSuccess && (
          <>
            <div className={styles.content}>
              <MoleculeViewer
                compoundId={compound.id}
                fallbackEmoji={compound.emoji}
              />
              <h2 className={styles.compoundName}>{compound.name}</h2>
              {showFormula && <p className={styles.formula}>{compound.formula}</p>}
              <div className={styles.descBox}>
                <p className={styles.desc}>
                  {isSandbox ? `"${compound.name}" 도감이 해제되었어요!` : `"${compound.description}"`}
                </p>
              </div>
              <div className={styles.aiBox}>
                {aiLoading && <p className={styles.aiLoading}>✨ AI 설명 불러오는 중...</p>}
                {!aiLoading && aiExplanation && (
                  <div className={styles.aiText}>
                    <span className={styles.aiLabel}>AI선생님:</span>
                    <span>{aiExplanation}</span>
                  </div>
                )}
              </div>
              {showTimeAttack && (
                <div className={styles.timeAttackBox}>
                  <p className={styles.timeRow}>이번 기록: {formatTime(latestClearTimeMs)}</p>
                  {latestTimeAttackRecord && <p className={styles.timeRow}>현재 순위: {latestTimeAttackRecord.rank}위</p>}
                  {latestTimeAttackRecord && (
                    <p className={styles.timeRow}>
                      개인 최고 기록 갱신: {latestTimeAttackRecord.is_personal_best ? '예' : '아니오'}
                    </p>
                  )}
                  {myTimeAttackBest && <p className={styles.timeRow}>내 최고 기록: {formatTime(myTimeAttackBest.clear_time_ms)}</p>}
                  {timeAttackPending && <p className={styles.timeHint}>랭킹을 불러오는 중이에요...</p>}
                  {timeAttackError && <p className={styles.timeHint}>{timeAttackError}</p>}
                  {!timeAttackPending && timeAttackRanking.length > 0 && (
                    <div className={styles.rankingBox}>
                      <p className={styles.rankingTitle}>상위 10명 랭킹</p>
                      {timeAttackRanking.map(entry => (
                        <p key={`${entry.user_id}-${entry.rank}-${entry.cleared_at}`} className={styles.rankingRow}>
                          {entry.rank}. {entry.username} · {formatTime(entry.clear_time_ms)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {newHallOfFameDiscovery && (
                <div className={styles.hofBanner}>
                  🏆 명예의 전당 최초 발견!
                  <button className={styles.hofClose} onClick={clearHallOfFameDiscovery}>✕</button>
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button className={styles.nextBtn} onClick={isSandbox ? dismissResult : hasMore ? nextStage : goToMenu}>
                {isSandbox ? '계속 실험하기 ›' : hasMore ? '다음 단계 ›' : '메뉴로 돌아가기 ›'}
              </button>
            </div>
          </>
        )}

        {isFail && (
          <>
            <div className={styles.content}>
              <div className={styles.imgBox}>
                <span className={styles.emoji}>💔</span>
              </div>
              <h2 className={styles.compoundName}>앗, 틀렸어요!</h2>
              {showFormula && <p className={styles.formula}>{compound.formula}</p>}
              <div className={styles.descBox}>
                <p className={styles.desc}>
                  정답은 {Object.entries(compound.elements).map(([e, c]) => `${e}×${c}`).join(', ')} 입니다.
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.nextBtn} onClick={nextStage}>
                다음 문제 도전 ›
              </button>
            </div>
          </>
        )}

        {isLifeGameOver && (
          <>
            <div className={styles.content}>
              <div className={styles.imgBox}>
                <span className={styles.emoji}>☠️</span>
              </div>
              <h2 className={styles.compoundName}>게임 오버!</h2>
              {showFormula && <p className={styles.formula}>{compound.formula}</p>}
              <div className={styles.descBox}>
                <p className={styles.desc}>
                  정답은 {Object.entries(compound.elements).map(([e, c]) => `${e}×${c}`).join(', ')} 입니다.
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.nextBtn} onClick={goToMenu}>
                메뉴로 돌아가기
              </button>
            </div>
          </>
        )}

        {isStageClear && (
          <>
            <div className={styles.content}>
              <div className={styles.imgBox}>
                <span className={styles.emoji}>🎉</span>
              </div>
              <h2 className={styles.compoundName}>게임 완료!</h2>
              <p className={styles.formula}>모든 단계를 클리어했어요!</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.nextBtn} onClick={goToMenu}>
                메뉴로 돌아가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
