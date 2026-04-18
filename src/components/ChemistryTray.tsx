import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import ElementTile from './ElementTile';
import styles from './ChemistryTray.module.css';

export default function ChemistryTray() {
  const trayElements = useGameStore(s => s.trayElements);
  const removeFromTray = useGameStore(s => s.removeFromTray);
  const addToTray = useGameStore(s => s.addToTray);
  const trayRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    trayRef.current?.classList.add(styles.dragOver);
  };

  const handleDragLeave = () => {
    trayRef.current?.classList.remove(styles.dragOver);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    trayRef.current?.classList.remove(styles.dragOver);
    const symbol = e.dataTransfer.getData('text/plain');
    if (symbol) addToTray(symbol);
  };

  return (
    <div
      ref={trayRef}
      className={styles.tray}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.header}>▷ CHEMISTRY TRAY</div>
      {trayElements.length === 0 ? (
        <p className={styles.placeholder}>▷ 드래그하거나 클릭하세요</p>
      ) : (
        <div className={styles.elements}>
          {trayElements.map((sym, i) => (
            <ElementTile
              key={i}
              symbol={sym}
              small
              removable
              onClick={() => removeFromTray(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
