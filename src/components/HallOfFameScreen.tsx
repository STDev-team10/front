import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { fetchHallOfFame, type HallOfFameItem } from '../api/hallOfFame';
import styles from './HallOfFameScreen.module.css';

const BASE_ITEMS: Omit<HallOfFameItem, 'discoverers'>[] = [
  { id: 'guigeumseok', title: '귀금속', subtitle: '빛나는 금속의 가치', image_filename: 'guigeumseok.png' },
  { id: 'dynamite', title: '다이너마이트', subtitle: '폭발의 과학', image_filename: 'dynamite.png' },
  { id: 'radium', title: '라듐', subtitle: '방사성 원소의 발견', image_filename: 'radium.png' },
  { id: 'lax', title: '락스', subtitle: '강력한 세정의 화학', image_filename: 'lax.png' },
  { id: 'biso', title: '비소', subtitle: '독성의 원소', image_filename: 'biso.png' },
  { id: 'salchungje', title: '살충제', subtitle: '해충을 막는 화학', image_filename: 'salchungje.png' },
  { id: 'seokmyeon', title: '석면', subtitle: '금지된 광물', image_filename: 'seokmyeon.png' },
  { id: 'alcohol', title: '알콜', subtitle: '발효와 증류의 산물', image_filename: 'alcohol.png' },
  { id: 'sueun', title: '수은', subtitle: '액체 금속의 비밀', image_filename: 'sueun.png' },
  { id: 'haber', title: '하버', subtitle: '공기에서 빵을, 그리고 독가스를', image_filename: 'haber.png' },
];

export default function HallOfFameScreen() {
  const goToModeMenu = useGameStore(s => s.goToModeMenu);
  const [discovererMap, setDiscovererMap] = useState<Record<string, string[]>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchHallOfFame()
      .then(apiItems => {
        const map: Record<string, string[]> = {};
        apiItems.forEach(item => { map[item.id] = item.discoverers; });
        setDiscovererMap(map);
      })
      .catch(() => undefined);
  }, []);

  const items: HallOfFameItem[] = useMemo(
    () => BASE_ITEMS.map(base => ({ ...base, discoverers: discovererMap[base.id] ?? [] })),
    [discovererMap],
  );

  const selectedItem = useMemo(
    () => items.find(item => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={goToModeMenu}>← 모드 선택</button>
        <div className={styles.titleWrap}>
          <p className={styles.eyebrow}>HALL OF FAME</p>
          <h1 className={styles.title}>명예의 전당</h1>
        </div>
      </div>

      <p className={styles.subtitle}>
        누군가 먼저 발견한 특별한 이미지들이 모이는 공간입니다.
      </p>

      <div className={styles.grid}>
        {items.map(item => {
          const isDiscovered = item.discoverers.length > 0;
          const isBroken = brokenImages[item.id];
          const imageSrc = `/hall-of-fame/${item.image_filename}`;

          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.card} ${isDiscovered ? styles.discovered : styles.undiscovered}`}
              onClick={() => isDiscovered && setSelectedItemId(item.id)}
            >
              <div className={styles.thumb}>
                {isDiscovered && !isBroken ? (
                  <img
                    className={styles.image}
                    src={imageSrc}
                    alt={item.title}
                    onError={() => setBrokenImages(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className={styles.unknown}>
                    <span className={styles.question}>?</span>
                    <span className={styles.unknownLabel}>미발견</span>
                  </div>
                )}
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardSubtitle}>{item.subtitle}</span>
                <span className={styles.cardMeta}>
                  {isDiscovered ? `${item.discoverers.length}명이 발견` : '아직 아무도 발견하지 못했어요'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedItem && (
        <div className={styles.overlay} onClick={() => setSelectedItemId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>DISCOVERERS</p>
                <h2 className={styles.modalTitle}>{selectedItem.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedItemId(null)}>닫기</button>
            </div>

            <div className={styles.modalImageWrap}>
              <img
                className={styles.modalImage}
                src={`/hall-of-fame/${selectedItem.image_filename}`}
                alt={selectedItem.title}
              />
            </div>

            <div className={styles.nameList}>
              {selectedItem.discoverers.map(name => (
                <div key={name} className={styles.nameChip}>{name}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
