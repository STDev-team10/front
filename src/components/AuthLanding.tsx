import { useGameStore } from '../store/gameStore';
import styles from './AuthLanding.module.css';

export default function AuthLanding() {
  const goToLogin = useGameStore(s => s.goToLogin);
  const goToSignup = useGameStore(s => s.goToSignup);
  const loginAsGuest = useGameStore(s => s.loginAsGuest);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.emoji}>🥗</div>
        <h1 className={styles.title}>화학 비빔밥</h1>
        <p className={styles.sub}>원소를 조합해 화합물을 만들어보세요!</p>
      </div>

      <div className={styles.buttons}>
        <button className={styles.loginBtn} onClick={goToLogin}>
          로그인
        </button>
        <button className={styles.signupBtn} onClick={goToSignup}>
          회원가입
        </button>
        <button className={styles.guestBtn} onClick={loginAsGuest}>
          👀 게스트로 시작
        </button>
      </div>
    </div>
  );
}
