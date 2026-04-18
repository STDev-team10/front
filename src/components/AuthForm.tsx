import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './AuthForm.module.css';

interface Props {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: Props) {
  const login = useGameStore(s => s.login);
  const signup = useGameStore(s => s.signup);
  const goToLogin = useGameStore(s => s.goToLogin);
  const goToSignup = useGameStore(s => s.goToSignup);
  const authError = useGameStore(s => s.authError);
  const authPending = useGameStore(s => s.authPending);

  // landing으로 돌아가기
  const goToLanding = () => useGameStore.setState({ phase: 'auth-landing', authError: '' });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(username, password);
    } else {
      await signup(username, password);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={goToLanding}>← 뒤로</button>

      <div className={styles.card}>
        <h2 className={styles.title}>
          {mode === 'login' ? '🔑 로그인' : '✏️ 회원가입'}
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>아이디</label>
            <input
              className={styles.input}
              type="text"
              placeholder="chemist01"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          {authError && <p className={styles.error}>{authError}</p>}

          <button className={styles.submitBtn} type="submit" disabled={authPending}>
            {authPending ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === 'login' ? (
            <>계정이 없으신가요? <button className={styles.switchBtn} onClick={goToSignup}>회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button className={styles.switchBtn} onClick={goToLogin}>로그인</button></>
          )}
        </p>
      </div>
    </div>
  );
}
