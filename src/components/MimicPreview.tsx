import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './MimicPreview.module.css';

export default function MimicPreview() {
  const compound = useGameStore(s => s.currentCompound);
  const countdown = useGameStore(s => s.mimicCountdown);
  const tickMimic = useGameStore(s => s.tickMimic);

  useEffect(() => {
    const timer = setInterval(tickMimic, 1000);
    return () => clearInterval(timer);
  }, [tickMimic]);

  if (!compound) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.label}>🎭 기억하세요!</p>
        <h2 className={styles.name}>{compound.name}</h2>
        <div className={styles.countdown}>{countdown}</div>
        <p className={styles.hint}>이 이름을 기억해서 직접 만들어보세요!</p>
      </div>
    </div>
  );
}
