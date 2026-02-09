import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, clearCart } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import { siteConfig } from '../../data/site-config';
import TurnstileWidget from './TurnstileWidget';
import styles from './QuoteForm.module.css';

// Check if Web3Forms is configured
const isWeb3FormsConfigured = siteConfig.web3forms?.accessKey &&
  siteConfig.web3forms.accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY';

// Anti-spam: minimum time before submission allowed (3 seconds)
const MIN_SUBMIT_TIME_MS = 3000;

// H5: Auto-save form data key
const FORM_DRAFT_KEY = 'gelchile_quote_draft';

interface FormData {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  mensaje: string;
  website: string; // Honeypot field
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
}

// H9: More specific error messages
const validators: Record<string, (value: string) => string | undefined> = {
  nombre: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return 'El nombre es obligatorio';
    if (trimmed.length < 3) return 'Ingresa nombre completo (mínimo 3 caracteres)';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmed)) return 'Solo letras y espacios permitidos';
    return undefined;
  },
  email: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return 'El email es obligatorio';
    if (!/@/.test(trimmed)) return 'Falta el símbolo @';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Formato inválido. Ejemplo: usuario@empresa.cl';
    return undefined;
  },
  telefono: (v) => {
    const digits = v.replace(/\D/g, '');
    if (!v.trim()) return 'El teléfono es obligatorio';
    if (digits.length < 8) return 'Mínimo 8 dígitos';
    if (digits.length > 15) return 'Máximo 15 dígitos';
    if (!/^[\d\s+()-]+$/.test(v)) return 'Solo números, espacios y símbolos +()-';
    return undefined;
  },
};

/** Quote form with validation. Mount with client:load on /cotizacion. */
export default function QuoteForm() {
  const cart = useStore($cart);

  // Anti-spam: track form load time
  const formLoadTimeRef = useRef<number>(Date.now());

  const [form, setForm] = useState<FormData>({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    mensaje: '',
    website: '', // Honeypot
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // H5: Restore form draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        // Only restore non-sensitive fields (exclude honeypot)
        setForm((prev) => ({
          ...prev,
          nombre: draft.nombre || '',
          empresa: draft.empresa || '',
          email: draft.email || '',
          telefono: draft.telefono || '',
          mensaje: draft.mensaje || '',
        }));
        setHasDraft(true);
      }
    } catch (e) {
      console.error('Error restoring form draft:', e);
    }
  }, []);

  // H5: Auto-save form data (debounced via form state changes)
  useEffect(() => {
    // Don't save honeypot or empty forms
    const hasContent = form.nombre || form.empresa || form.email || form.telefono || form.mensaje;
    if (!hasContent) return;

    try {
      const toSave = {
        nombre: form.nombre,
        empresa: form.empresa,
        email: form.email,
        telefono: form.telefono,
        mensaje: form.mensaje,
        savedAt: Date.now(),
      };
      localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Error saving form draft:', e);
    }
  }, [form.nombre, form.empresa, form.email, form.telefono, form.mensaje]);

  // H5: Clear draft helper
  const clearDraft = () => {
    try {
      localStorage.removeItem(FORM_DRAFT_KEY);
      setHasDraft(false);
    } catch (e) {
      console.error('Error clearing form draft:', e);
    }
  };

  const validateField = (name: string, value: string): string | undefined => {
    const validator = validators[name];
    return validator ? validator(value) : undefined;
  };

  const handleInput = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Re-validate on input if field was already touched and has error
    if (touched[name] && errors[name as keyof FormErrors]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name as keyof FormData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let valid = true;
    for (const name of Object.keys(validators)) {
      const error = validateField(name, form[name as keyof FormData]);
      if (error) {
        newErrors[name as keyof FormErrors] = error;
        valid = false;
      }
    }
    setErrors(newErrors);
    setTouched({ nombre: true, email: true, telefono: true });
    return valid;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Anti-spam: time validation (silent rejection)
    const timeElapsed = Date.now() - formLoadTimeRef.current;
    if (timeElapsed < MIN_SUBMIT_TIME_MS) {
      // Fake success to fool bots
      showToast('¡Cotización enviada con éxito! Te contactaremos pronto.', 'success');
      return;
    }

    // Anti-spam: honeypot check (silent rejection)
    if (form.website) {
      // Fake success to fool bots
      showToast('¡Cotización enviada con éxito! Te contactaremos pronto.', 'success');
      return;
    }

    // Anti-spam: Turnstile verification
    if (!turnstileToken) {
      showToast('Por favor completa la verificación de seguridad', 'error');
      return;
    }

    if (!validateAll()) {
      showToast('Por favor corrige los errores del formulario', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Agrega productos antes de enviar la cotización', 'error');
      return;
    }

    setIsSubmitting(true);

    // Build payload for Web3Forms
    const productsList = cart
      .map((item) => `• ${item.title} (SKU: ${item.sku}) - Cantidad: ${item.quantity}`)
      .join('\n');

    const payload = {
      access_key: siteConfig.web3forms.accessKey,
      subject: `🔌 Nueva Cotización - ${form.nombre} | GelChile`,
      from_name: form.nombre,
      replyto: form.email,
      // Form fields
      Nombre: form.nombre,
      Empresa: form.empresa || 'No especificada',
      Email: form.email,
      Teléfono: form.telefono,
      Mensaje: form.mensaje || 'Sin mensaje adicional',
      // Products
      'Productos Solicitados': productsList,
      'Total de Productos': cart.length.toString(),
      // Metadata
      Fecha: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
      // Turnstile token for server-side verification
      'cf-turnstile-response': turnstileToken,
    };

    try {
      if (isWeb3FormsConfigured) {
        // Production: send via Web3Forms API
        const response = await fetch(siteConfig.web3forms.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Error al enviar');
        }
      } else {
        // Development: simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('[Dev Mode] Cotización simulada:', payload);
      }

      // Success - clear form, draft, and redirect
      clearCart();
      clearDraft(); // H5: Clear auto-saved draft
      setForm({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '', website: '' });
      setErrors({});
      setTouched({});
      setTurnstileToken(null);

      // Redirect to success page
      window.location.href = '/cotizacion-enviada';
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      showToast('Error al enviar la cotización. Inténtalo nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClass = (name: string): string => {
    if (errors[name as keyof FormErrors] && touched[name]) return `${styles['form-input']} ${styles.error}`;
    if (touched[name] && form[name as keyof FormData] && !errors[name as keyof FormErrors]) return `${styles['form-input']} ${styles.success}`;
    return styles['form-input'];
  };

  const getGroupClass = (name: string): string => {
    if (errors[name as keyof FormErrors] && touched[name]) return `${styles['form-group']} ${styles['has-error']}`;
    return styles['form-group'];
  };

  // H3: Reset form handler
  const handleReset = () => {
    setForm({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '', website: '' });
    setErrors({});
    setTouched({});
    clearDraft();
    showToast('Formulario limpiado', 'info');
  };

  return (
    <div class={styles['quote-form-container']}>
      <h2>Solicitar Cotización</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Nombre */}
        <div class={getGroupClass('nombre')}>
          <label class={styles['form-label']}>
            Nombre completo <span class={styles.required}>*</span>
          </label>
          <input
            type="text"
            class={getFieldClass('nombre')}
            placeholder="Tu nombre completo"
            value={form.nombre}
            onInput={(e) => handleInput('nombre', (e.target as HTMLInputElement).value)}
            onBlur={() => handleBlur('nombre')}
            required
          />
          {errors.nombre && touched.nombre && (
            <span class={styles['form-error']} style={{ display: 'block' }}>{errors.nombre}</span>
          )}
        </div>

        {/* Empresa */}
        <div class={styles['form-group']}>
          <label class={styles['form-label']}>Empresa</label>
          <input
            type="text"
            class={styles['form-input']}
            placeholder="Nombre de tu empresa (opcional)"
            value={form.empresa}
            onInput={(e) => handleInput('empresa', (e.target as HTMLInputElement).value)}
          />
        </div>

        {/* Email */}
        <div class={getGroupClass('email')}>
          <label class={styles['form-label']}>
            Email <span class={styles.required}>*</span>
          </label>
          <input
            type="email"
            class={getFieldClass('email')}
            placeholder="tu@email.com"
            value={form.email}
            onInput={(e) => handleInput('email', (e.target as HTMLInputElement).value)}
            onBlur={() => handleBlur('email')}
            required
          />
          {errors.email && touched.email && (
            <span class={styles['form-error']} style={{ display: 'block' }}>{errors.email}</span>
          )}
        </div>

        {/* Teléfono */}
        <div class={getGroupClass('telefono')}>
          <label class={styles['form-label']}>
            Teléfono <span class={styles.required}>*</span>
          </label>
          <input
            type="tel"
            class={getFieldClass('telefono')}
            placeholder="+56 9 1234 5678"
            value={form.telefono}
            onInput={(e) => handleInput('telefono', (e.target as HTMLInputElement).value)}
            onBlur={() => handleBlur('telefono')}
            required
          />
          {errors.telefono && touched.telefono && (
            <span class={styles['form-error']} style={{ display: 'block' }}>{errors.telefono}</span>
          )}
        </div>

        {/* Mensaje */}
        <div class={styles['form-group']}>
          <label class={styles['form-label']}>Mensaje adicional</label>
          <textarea
            class={styles['form-textarea']}
            placeholder="Detalles adicionales sobre tu cotización..."
            value={form.mensaje}
            onInput={(e) => handleInput('mensaje', (e.target as HTMLTextAreaElement).value)}
            rows={4}
          />
        </div>

        {/* Honeypot - hidden from humans, visible to bots */}
        <div class={styles.honeypot} aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              value={form.website}
              onInput={(e) => handleInput('website', (e.target as HTMLInputElement).value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        {/* Cloudflare Turnstile */}
        <TurnstileWidget
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => showToast('Error en verificación de seguridad', 'error')}
        />

        {/* H5: Form actions with auto-save indicator */}
        <div class={styles['form-actions']}>
          <button
            type="submit"
            class={`btn btn-primary ${styles['form-submit']}`}
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? (
              <>
                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Enviando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Enviar Solicitud de Cotización
              </>
            )}
          </button>

          {/* H3: Reset form button */}
          <button
            type="button"
            class={styles['form-reset']}
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Limpiar formulario
          </button>
        </div>

        {/* H5: Auto-save indicator */}
        {hasDraft && (
          <p class={styles['draft-indicator']}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Borrador guardado automáticamente
          </p>
        )}
      </form>
    </div>
  );
}
