import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';
import { $theme, toggleTheme, initTheme } from '../../stores/theme';
import { showToast } from '../../stores/toast';
import styles from './DarkModeToggle.module.css';

/** Dark/light mode toggle button. Mount with client:load. */
export default function DarkModeToggle() {
  const theme = useStore($theme);

  useEffect(() => {
    initTheme();
  }, []);

  const handleToggle = () => {
    toggleTheme();
    const next = $theme.get();
    showToast(
      next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado',
      'info'
    );
  };

  return (
    <button
      class={styles['theme-toggle']}
      onClick={handleToggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {/* Sun icon — visible in dark mode via CSS */}
      <svg class={styles['icon-sun']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      {/* Moon icon — visible in light mode via CSS */}
      <svg class={styles['icon-moon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
