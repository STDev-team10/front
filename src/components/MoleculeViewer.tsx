import { useEffect, useRef, useState } from 'react';
import { fetchCompound3d, fetch3dSdf } from '../api/pubchem';
import styles from './MoleculeViewer.module.css';

interface Props {
  compoundId: string;
  fallbackEmoji: string;
}

type Status = 'loading' | 'ready' | 'error';

function waitFor3Dmol(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.$3Dmol) { resolve(); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.$3Dmol) { clearInterval(timer); resolve(); }
      else if (Date.now() - start > timeout) { clearInterval(timer); reject(new Error('3Dmol load timeout')); }
    }, 100);
  });
}

export default function MoleculeViewer({ compoundId, fallbackEmoji }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<$3DmolViewer | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await waitFor3Dmol();
        if (cancelled) return;

        const info = await fetchCompound3d(compoundId);
        if (cancelled) return;
        if (!info.has3d || !info.pubchemCid) throw new Error('no 3d');

        const sdf = await fetch3dSdf(info.pubchemCid);
        if (cancelled) return;
        if (!sdf) throw new Error('no sdf');

        if (!containerRef.current || cancelled) return;

        viewerRef.current?.clear();

        const viewer = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: '#f7f0e6',
          antialias: true,
        });
        viewerRef.current = viewer;

        viewer.addModel(sdf, 'sdf');
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.28 } });
        viewer.zoomTo();
        viewer.spin('y', 0.8);
        viewer.render();

        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    setStatus('loading');
    void init();

    return () => {
      cancelled = true;
      viewerRef.current?.clear();
      viewerRef.current = null;
    };
  }, [compoundId]);

  return (
    <div className={styles.wrap}>
      {/* canvas는 항상 DOM에 있어야 WebGL 컨텍스트가 정상 초기화됨 */}
      <div ref={containerRef} className={styles.canvas} />

      {status === 'loading' && (
        <div className={styles.overlay}>
          <span className={styles.spinner} />
          <span className={styles.hint}>분자 구조 불러오는 중</span>
        </div>
      )}
      {status === 'error' && (
        <div className={styles.overlay}>
          <span className={styles.fallbackEmoji}>{fallbackEmoji}</span>
        </div>
      )}
    </div>
  );
}
