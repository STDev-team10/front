import { useEffect, useState } from 'react';
import { fetchTimeAttackRanking, type TimeAttackRankingEntry, type TimeAttackRankingResponse } from '../api/compounds';
import { type Difficulty, DIFFICULTY_LABELS, DIFFICULTY_EMOJIS } from '../data/compounds';
import { useGameStore } from '../store/gameStore';
import styles from './MenuScreen.module.css';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'mimic'];

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export default function MenuScreen() {
  const [bestRecords, setBestRecords] = useState<Partial<Record<Difficulty, TimeAttackRankingEntry | null>>>({});
  const [bestRecordsPending, setBestRecordsPending] = useState(false);
  const [rankingDifficulty, setRankingDifficulty] = useState<Difficulty | null>(null);
  const [rankingData, setRankingData] = useState<TimeAttackRankingResponse | null>(null);
  const [rankingPending, setRankingPending] = useState(false);
  const [rankingError, setRankingError] = useState('');
  const phase = useGameStore(s => s.phase);
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

  const getMyRankingItem = (data: TimeAttackRankingResponse | null) => {
    if (!data) return null;
    if (data.my_item) return data.my_item;
    if (!user?.name) return null;
    return data.items.find(entry => entry.username === user.name) ?? null;
  };

  useEffect(() => {
    if (!user?.token || user.isGuest || playMode === 'sandbox') {
      setBestRecords({});
      setBestRecordsPending(false);
      return;
    }

    let cancelled = false;
    setBestRecordsPending(true);

    void Promise.allSettled(
      DIFFICULTIES.map(async difficulty => {
        const ranking = await fetchTimeAttackRanking(user.token!, playMode, difficulty);
        return [difficulty, ranking] as const;
      }),
    )
      .then(results => {
        if (cancelled) return;
        const nextRecords: Partial<Record<Difficulty, TimeAttackRankingEntry | null>> = {};
        results.forEach(result => {
          if (result.status !== 'fulfilled') return;
          const [difficulty, ranking] = result.value;
          nextRecords[difficulty] = getMyRankingItem(ranking);
        });
        setBestRecords(nextRecords);
        setBestRecordsPending(false);
      })
      .catch(() => {
        if (cancelled) return;
        setBestRecords({});
        setBestRecordsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [phase, playMode, user?.isGuest, user?.token]);

  const openRanking = (difficulty: Difficulty) => {
    setRankingDifficulty(difficulty);
    setRankingPending(true);
    setRankingError('');
    setRankingData(null);

    void fetchTimeAttackRanking(user?.token, playMode as 'normal' | 'hardcore', difficulty)
      .then(data => {
        setRankingData(data);
        setRankingPending(false);
      })
      .catch(() => {
        setRankingError('랭킹을 불러오지 못했어요.');
        setRankingPending(false);
      });
  };

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
        {DIFFICULTIES.map((d, i) => {
          const bestRecord = bestRecords[d];
          const bestRecordLabel = user?.isGuest
            ? '최고 기록은 로그인 후 저장돼요'
            : bestRecordsPending
              ? '최고 기록 불러오는 중...'
              : bestRecord
                ? `최고 기록 ${formatTime(bestRecord.clear_time_ms)}`
                : '아직 기록 없음';

          return (
            <div key={d} className={styles.levelRow}>
              <button className={styles.levelBtn} onClick={() => startGame(d)}>
                <span className={styles.levelEmoji}>{DIFFICULTY_EMOJIS[d]}</span>
                <div className={styles.levelText}>
                  <span className={styles.levelStep}>LEVEL {i + 1}</span>
                  <span className={styles.levelLabel}>{DIFFICULTY_LABELS[d]}</span>
                  <span className={styles.levelRecord}>{bestRecordLabel}</span>
                </div>
              </button>
              {playMode !== 'sandbox' && (
                <button
                  type="button"
                  className={styles.crownBtn}
                  onClick={() => openRanking(d)}
                  aria-label={`${DIFFICULTY_LABELS[d]} 랭킹 보기`}
                >
                  👑
                </button>
              )}
            </div>
          );
        })}
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

      {rankingDifficulty && (
        <div className={styles.rankingOverlay} onClick={() => setRankingDifficulty(null)}>
          <div className={styles.rankingCard} onClick={event => event.stopPropagation()}>
            <div className={styles.rankingHeader}>
              <div>
                <p className={styles.rankingEyebrow}>TIME ATTACK RANKING</p>
                <h2 className={styles.rankingTitle}>{DIFFICULTY_LABELS[rankingDifficulty]}</h2>
              </div>
              <button className={styles.rankingClose} onClick={() => setRankingDifficulty(null)}>닫기</button>
            </div>

            {rankingPending && <p className={styles.rankingHint}>랭킹을 불러오는 중이에요...</p>}
            {rankingError && <p className={styles.rankingHint}>{rankingError}</p>}

            {!rankingPending && !rankingError && rankingData && (
              <>
                <div className={styles.rankingList}>
                  {rankingData.items.length > 0 ? rankingData.items.map(entry => (
                    <div key={`${entry.user_id}-${entry.rank}-${entry.cleared_at}`} className={styles.rankingItem}>
                      <span className={styles.rankingRank}>{entry.rank}</span>
                      <span className={styles.rankingName}>{entry.username}</span>
                      <span className={styles.rankingTime}>{formatTime(entry.clear_time_ms)}</span>
                    </div>
                  )) : (
                    <p className={styles.rankingHint}>아직 등록된 기록이 없어요.</p>
                  )}
                </div>

                <div className={styles.myRankingBox}>
                  <p className={styles.myRankingLabel}>내 현재 순위</p>
                  {getMyRankingItem(rankingData) ? (
                    <p className={styles.myRankingValue}>
                      {getMyRankingItem(rankingData)!.rank}위 · {formatTime(getMyRankingItem(rankingData)!.clear_time_ms)}
                    </p>
                  ) : (
                    <p className={styles.myRankingValue}>아직 내 기록이 없어요.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
