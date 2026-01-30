import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, clearCart } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './QuoteForm.module.css';

interface FormData {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
}

const validators: Record<string, (value: string) => string | undefined> = {
  nombre: (v) => (v.trim().length >= 3 ? undefined : 'Ingresa tu nombre completo'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : 'Ingresa un email válido'),
  telefono: (v) => (/^[\d\s+()-]{8,}$/.test(v) ? undefined : 'Ingresa un teléfono válido'),
};

/** Quote form with validation. Mount with client:load on /cotizacion. */
export default function QuoteForm() {
  const cart = useStore($cart);
  const [form, setForm] = useState<FormData>({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    if (!validateAll()) {
      showToast('Por favor corrige los errores del formulario', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Agrega productos antes de enviar la cotización', 'error');
      return;
    }

    setIsSubmitting(true);

    // Build payload
    const payload = {
      access_key: 'YOUR_WEB3FORMS_API_KEY',
      subject: `Nueva cotización - ${form.nombre}`,
      from_name: form.nombre,
      nombre: form.nombre,
      empresa: form.empresa || 'No especificada',
      email: form.email,
      telefono: form.telefono,
      mensaje: form.mensaje || 'Sin mensaje adicional',
      productos: cart.map((item) => `${item.title} (SKU: ${item.sku}) x${item.quantity}`).join('\n'),
      total_items: cart.length.toString(),
      fecha: new Date().toISOString(),
    };

    // Simulate API call (Web3Forms API key will be configured in Phase 9)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Cotización enviada:', payload);

      showToast('¡Cotización enviada con éxito! Te contactaremos pronto.', 'success');
      clearCart();
      setForm({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '' });
      setErrors({});
      setTouched({});
      setIsSubmitted(true);
    } catch {
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

  if (isSubmitted && cart.length === 0) {
    return (
      <div class={styles['quote-form-container']}>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" width="64" height="64" style={{ margin: '0 auto var(--spacing-4)' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 style={{ marginBottom: 'var(--spacing-2)' }}>¡Cotización Enviada!</h3>
          <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--spacing-6)' }}>
            Te contactaremos pronto con los detalles de tu cotización.
          </p>
          <a href="/productos" class="btn btn-primary">Seguir Comprando</a>
        </div>
      </div>
    );
  }

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

        {/* Submit */}
        <button
          type="submit"
          class={`btn btn-primary ${styles['form-submit']}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Enviando...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Enviar Solicitud de Cotización
            </>
          )}
        </button>
      </form>
    </div>
  );
}
