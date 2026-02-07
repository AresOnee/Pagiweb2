import { useEffect, useRef } from 'preact/hooks';
import { siteConfig } from '../../data/site-config';

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile widget for anti-spam protection.
 * Renders an invisible CAPTCHA that verifies users are human.
 *
 * Requires:
 * 1. Turnstile script loaded in MainLayout.astro
 * 2. Site key configured in site-config.ts (get from Cloudflare Dashboard)
 */
export default function TurnstileWidget({ onVerify, onExpire, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no site key configured
    if (!siteConfig.turnstile?.siteKey || siteConfig.turnstile.siteKey === 'YOUR_TURNSTILE_SITE_KEY') {
      // Auto-verify in development when no key is configured
      console.warn('[Turnstile] No site key configured. Auto-verifying for development.');
      onVerify('dev-mode-token');
      return;
    }

    // Wait for Turnstile script to load
    const checkTurnstile = setInterval(() => {
      if (typeof window !== 'undefined' && window.turnstile && containerRef.current) {
        clearInterval(checkTurnstile);

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteConfig.turnstile.siteKey,
            callback: onVerify,
            'expired-callback': onExpire,
            'error-callback': onError,
            theme: 'auto',
            size: 'normal',
          });
        } catch (err) {
          console.error('[Turnstile] Render error:', err);
          onError?.();
        }
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkTurnstile);
      if (!widgetIdRef.current) {
        console.warn('[Turnstile] Script did not load within 10 seconds');
        // Don't auto-verify on timeout - user should reload
      }
    }, 10000);

    return () => {
      clearInterval(checkTurnstile);
      clearTimeout(timeout);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget already removed
        }
      }
    };
  }, [onVerify, onExpire, onError]);

  // Don't render container if no site key (dev mode)
  if (!siteConfig.turnstile?.siteKey || siteConfig.turnstile.siteKey === 'YOUR_TURNSTILE_SITE_KEY') {
    return (
      <div style={{
        padding: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-4)',
        background: 'var(--color-gray-100)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-gray-500)',
        textAlign: 'center',
      }}>
        🔧 Modo desarrollo: Turnstile desactivado
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ marginBottom: 'var(--spacing-4)', minHeight: '65px' }}
    />
  );
}
