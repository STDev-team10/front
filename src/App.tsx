import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useGameStore } from './store/gameStore';
import AuthLanding from './components/AuthLanding';
import AuthForm from './components/AuthForm';
import ModeSelectScreen from './components/ModeSelectScreen';
import HallOfFameScreen from './components/HallOfFameScreen';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import DoganScreen from './components/DoganScreen';

export default function App() {
  const phase = useGameStore(s => s.phase);
  const loadCompounds = useGameStore(s => s.loadCompounds);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [bgmEnabled, setBgmEnabled] = useState(() => {
    try {
      return localStorage.getItem('chem-bgm-enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const bgmEnabledRef = useRef(bgmEnabled);

  useEffect(() => {
    void loadCompounds();
  }, [loadCompounds]);

  useEffect(() => {
    bgmEnabledRef.current = bgmEnabled;
  }, [bgmEnabled]);

  useEffect(() => {
    const audio = new Audio('/audio/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    bgmRef.current = audio;

    const tryPlay = () => {
      if (!bgmEnabledRef.current) return;
      void audio.play().catch(() => undefined);
    };

    tryPlay();
    window.addEventListener('pointerdown', tryPlay);
    window.addEventListener('keydown', tryPlay);

    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      audio.pause();
      audio.currentTime = 0;
      bgmRef.current = null;
    };
  }, []);

  useEffect(() => {
    const playButtonClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('button')) return;

      const audio = new Audio('/audio/button-click.mp3');
      audio.volume = 0.5;
      void audio.play().catch(() => undefined);
    };

    window.addEventListener('pointerdown', playButtonClick);

    return () => {
      window.removeEventListener('pointerdown', playButtonClick);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chem-bgm-enabled', String(bgmEnabled));
    } catch {
      // Ignore storage failures and keep the in-memory state.
    }

    const audio = bgmRef.current;
    if (!audio) return;

    audio.muted = !bgmEnabled;
    if (bgmEnabled) {
      void audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, [bgmEnabled]);

  const screen = (() => {
    if (phase === 'auth-landing') return <AuthLanding />;
    if (phase === 'auth-login') return <AuthForm mode="login" />;
    if (phase === 'auth-signup') return <AuthForm mode="signup" />;
    if (phase === 'mode-menu') return <ModeSelectScreen />;
    if (phase === 'hall-of-fame') return <HallOfFameScreen />;
    if (phase === 'menu') return <MenuScreen />;
    if (phase === 'dogan') return <DoganScreen />;
    return <GameScreen />;
  })();

  return (
    <>
      {screen}
      <button
        type="button"
        className="bgmToggle"
        onClick={() => setBgmEnabled(enabled => !enabled)}
        aria-pressed={bgmEnabled}
        aria-label={bgmEnabled ? '배경음악 끄기' : '배경음악 켜기'}
        title={bgmEnabled ? '배경음악 끄기' : '배경음악 켜기'}
      >
        <span className="bgmToggleIcon" aria-hidden="true">{bgmEnabled ? '🔊' : '🔇'}</span>
      </button>
    </>
  );
}
