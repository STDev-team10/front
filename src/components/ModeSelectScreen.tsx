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
] as const;

export default function ModeSelectScreen() {
  const user = useGameStore(s => s.user);
  const logout = useGameStore(s => s.logout);
  const selectPlayMode = useGameStore(s => s.selectPlayMode);
  const startSandbox = useGameStore(s => s.startSandbox);

  return (
    <div className={styles.container}>
      <div className={styles.userBar}>
        <span className={styles.userName}>
          {user?.isGuest ? '👀 게스트' : `👤 ${user?.name}`}
        </span>
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
              key={mode.id}
              className={`${styles.modeCard} ${enabled ? styles.modeEnabled : styles.modeDisabled}`}
              onClick={enabled ? (mode.id === 'sandbox' ? () => void startSandbox() : () => selectPlayMode(mode.id)) : undefined}
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
    </div>
  );
}
