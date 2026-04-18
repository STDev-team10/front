import { useEffect } from 'react';
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

  useEffect(() => {
    void loadCompounds();
  }, [loadCompounds]);

  if (phase === 'auth-landing') return <AuthLanding />;
  if (phase === 'auth-login') return <AuthForm mode="login" />;
  if (phase === 'auth-signup') return <AuthForm mode="signup" />;
  if (phase === 'mode-menu') return <ModeSelectScreen />;
  if (phase === 'hall-of-fame') return <HallOfFameScreen />;
  if (phase === 'menu') return <MenuScreen />;
  if (phase === 'dogan') return <DoganScreen />;
  return <GameScreen />;
}
