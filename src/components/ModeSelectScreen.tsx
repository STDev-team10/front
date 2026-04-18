import { useState } from 'react';
import { fetchPointsRanking, type PointsRankingResponse } from '../api/auth';
import { type PlayMode, useGameStore } from '../store/gameStore';
import styles from './ModeSelectScreen.module.css';

const MODES = [
  {
    id: 'normal' as PlayMode,
    emoji: '🧪',
    title: 'normal 모드',
    description: '기존 레벨 선택으로 들어가서 차근차근 플레이해요.',
    actionLabel: '시작하기',
  },
  {
    id: 'hardcore' as PlayMode,
    emoji: '💥',
    title: 'hardcore 모드',
    description: '하트 1개, 화학식 숨김, 대신 더 높은 점수를 얻는 긴장감 모드예요.',
    actionLabel: '도전하기',
  },
  {
    id: 'sandbox' as PlayMode,
    emoji: '🧰',
    title: '샌드박스 모드',
    description: '문제 없이 바로 실험 화면으로 들어가고, 플레이 중에도 도감을 펼쳐볼 수 있어요.',
    actionLabel: '바로 시작',
  },
  {
    id: 'hall-of-fame',
    emoji: '🏆',
    title: '명예의 전당',
    description: '다른 유저들이 먼저 발견한 특별한 이미지들을 확인해보세요.',
    actionLabel: '입장하기',
  },
] as const;

export default function ModeSelectScreen() {
  const [pointsOpen, setPointsOpen] = useState(false);
  const [pointsRanking, setPointsRanking] = useState<PointsRankingResponse | null>(null);
  const [pointsPending, setPointsPending] = useState(false);
  const [pointsError, setPointsError] = useState('');
  const user = useGameStore(s => s.user);
  const logout = useGameStore(s => s.logout);
  const goToHallOfFame = useGameStore(s => s.goToHallOfFame);
  const selectPlayMode = useGameStore(s => s.selectPlayMode);
  const startSandbox = useGameStore(s => s.startSandbox);

  const openPointsRanking = () => {
    if (!user?.token || user.isGuest) return;

    setPointsOpen(true);
    setPointsRanking(null);
    setPointsPending(true);
    setPointsError('');

    void fetchPointsRanking(user.token)
      .then(data => {
        setPointsRanking(data);
        setPointsPending(false);
      })
      .catch((error: unknown) => {
        setPointsError(error instanceof Error ? error.message : '포인트 랭킹을 불러오지 못했어요.');
        setPointsPending(false);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.userBar}>
        <div className={styles.userMeta}>
          <span className={styles.userName}>
            {user?.isGuest ? '👀 게스트' : `👤 ${user?.name}`}
          </span>
          <button
            type="button"
            className={styles.pointsBtn}
            onClick={openPointsRanking}
            disabled={!user || user.isGuest}
          >
            ⭐ {user?.points ?? 0}P
          </button>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </div>

      <div className={styles.titleBox}>
        <div className={styles.titleEmoji}>⚗️</div>
        <h1 className={styles.title}>플레이 모드 선택</h1>
        <p className={styles.subtitle}>원하는 방식으로 화학 비빔밥을 시작해보세요.</p>
      </div>

      <div className={styles.modeList}>
        {MODES.map(mode => {
          const enabled = true;
          return (
            <button
              key={String(mode.id)}
              className={`${styles.modeCard} ${enabled ? styles.modeEnabled : styles.modeDisabled}`}
              onClick={enabled
                ? mode.id === 'sandbox'
                  ? () => void startSandbox()
                  : mode.id === 'hall-of-fame'
                    ? goToHallOfFame
                    : () => selectPlayMode(mode.id)
                : undefined}
              disabled={!enabled}
            >
              <div className={styles.modeHead}>
                <span className={styles.modeEmoji}>{mode.emoji}</span>
                <span className={styles.modeBadge}>OPEN</span>
              </div>
              <div className={styles.modeText}>
                <span className={styles.modeTitle}>{mode.title}</span>
                <span className={styles.modeDesc}>{mode.description}</span>
              </div>
              <span className={styles.modeAction}>{mode.actionLabel}</span>
            </button>
          );
        })}
      </div>

      {pointsOpen && (
        <div className={styles.rankingOverlay} onClick={() => setPointsOpen(false)}>
          <div className={styles.rankingCard} onClick={event => event.stopPropagation()}>
            <div className={styles.rankingHeader}>
              <div>
                <p className={styles.rankingEyebrow}>POINT RANKING</p>
                <h2 className={styles.rankingTitle}>포인트 순위</h2>
              </div>
              <button className={styles.rankingClose} onClick={() => setPointsOpen(false)}>닫기</button>
            </div>

            {pointsPending && <p className={styles.rankingHint}>포인트 랭킹을 불러오는 중이에요...</p>}
            {pointsError && <p className={styles.rankingHint}>{pointsError}</p>}

            {!pointsPending && !pointsError && pointsRanking && (
              <>
                <div className={styles.rankingList}>
                  {pointsRanking.items.length > 0 ? pointsRanking.items.map(entry => (
                    <div key={`${entry.user_id}-${entry.rank}`} className={styles.rankingItem}>
                      <span className={styles.rankingRank}>{entry.rank}</span>
                      <span className={styles.rankingName}>{entry.username}</span>
                      <span className={styles.rankingPoints}>{entry.points}P</span>
                    </div>
                  )) : (
                    <p className={styles.rankingHint}>아직 등록된 포인트 기록이 없어요.</p>
                  )}
                </div>

                <div className={styles.myRankingBox}>
                  <p className={styles.myRankingLabel}>내 현재 순위</p>
                  {pointsRanking.my_item ? (
                    <p className={styles.myRankingValue}>
                      {pointsRanking.my_item.rank}위 · {pointsRanking.my_item.points}P
                    </p>
                  ) : (
                    <p className={styles.myRankingValue}>아직 내 포인트 기록이 없어요.</p>
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
