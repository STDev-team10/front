import { ELEMENT_MAP } from '../data/elements';
import styles from './ElementTile.module.css';

interface Props {
  symbol: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  small?: boolean;
  removable?: boolean;
}

export default function ElementTile({ symbol, onClick, onDragStart, small, removable }: Props) {
  const el = ELEMENT_MAP[symbol] ?? {
    symbol,
    name: symbol,
    color: '#E8E0D8',
    textColor: '#5C3D2E',
  };

  return (
    <div
      className={`${styles.tile} ${small ? styles.small : ''} ${removable ? styles.removable : ''}`}
      style={{ background: el.color, color: el.textColor }}
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      title={el.name}
    >
      <span className={styles.symbol}>{symbol}</span>
      {!small && <span className={styles.name}>{el.name}</span>}
      {removable && <span className={styles.removeIcon}>×</span>}
    </div>
  );
}
