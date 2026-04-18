import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ELEMENT_MAP } from '../data/elements';
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

  const elementTokens: string[] = [];
  Object.entries(compound.elements).forEach(([symbol, count]) => {
    for (let i = 0; i < count; i++) elementTokens.push(symbol);
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.label}>🎭 기억하세요!</p>
        <h2 className={styles.name}>{compound.name}</h2>
        <div className={styles.tokens}>
          {elementTokens.map((sym, i) => {
            const el = ELEMENT_MAP[sym];
            return (
              <div
                key={i}
                className={styles.token}
                style={{ background: el?.color ?? '#eee', color: el?.textColor ?? '#333' }}
              >
                {sym}
              </div>
            );
          })}
        </div>
        <div className={styles.countdown}>{countdown}</div>
        <p className={styles.hint}>이 식을 기억해서 직접 만들어보세요!</p>
      </div>
    </div>
  );
}
