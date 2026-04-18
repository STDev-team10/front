import { useEffect, useRef, useState } from 'react';
import { fetchPubchemCid, fetch3dSdf } from '../api/pubchem';
import styles from './MoleculeViewer.module.css';

interface Props {
  formula: string;
  compoundId: string;
  fallbackEmoji: string;
}

type Status = 'loading' | 'ready' | 'error';

function waitFor3Dmol(timeout = 6000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.$3Dmol) { resolve(); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.$3Dmol) { clearInterval(timer); resolve(); }
      else if (Date.now() - start > timeout) { clearInterval(timer); reject(new Error('timeout')); }
    }, 100);
  });
}

export default function MoleculeViewer({ formula, compoundId, fallbackEmoji }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<$3DmolViewer | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await waitFor3Dmol();
        if (cancelled) return;

        const cid = await fetchPubchemCid(formula, compoundId);
        if (!cid || cancelled) throw new Error('no cid');

        const sdf = await fetch3dSdf(cid);
        if (!sdf || cancelled) throw new Error('no sdf');

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
  }, [formula, compoundId]);

  return (
    <div className={styles.wrap}>
      <div
        ref={containerRef}
        className={styles.canvas}
        style={{ visibility: status === 'ready' ? 'visible' : 'hidden' }}
      />
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
