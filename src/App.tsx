import { useGameStore } from './store/gameStore';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';

export default function App() {
  const phase = useGameStore(s => s.phase);

  return (
    <main className="app">
      {phase === 'menu' ? <MenuScreen /> : <GameScreen />}
    </main>
  );
}
