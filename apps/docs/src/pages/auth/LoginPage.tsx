import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import { useAuthStore } from '@office/auth-sdk';
import { Button } from '@office/ui-kit';

export const LoginPage = () => {
  const { t } = useTranslation('docs');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const result = await login({ email, password, rememberMe });
      if (result.kind === 'done') {
        navigate(from, { replace: true });
      } else if (result.kind === 'mfa') {
        navigate('/auth/2fa', { state: { mfaToken: result.mfaToken, methods: result.methods, primary: result.primary, from } });
      } else if (result.kind === '2fa_setup_required') {
        navigate('/auth/2fa-setup', { state: { userId: result.userId, email: result.email, totpConfigured: result.totpConfigured, from } });
      } else if (result.kind === 'password_change_required') {
        navigate('/auth/force-password-change', { state: { pwdChangeToken: result.pwdChangeToken, from } });
      }
    } catch {
      setLocalError(t('auth.loginError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-workspace px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-text">{t('app.name')}</h1>
            <p className="text-text-muted mt-2">{t('auth.loginSubtitle')}</p>
          </div>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-dim border border-red/30 rounded-lg text-red text-sm" role="alert">
              {localError ?? error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder={t('auth.emailPlaceholder')}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-text-muted">{t('auth.rememberMe')}</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {t('auth.noAccount')} <a href="/register" className="text-primary hover:underline font-medium">{t('auth.register')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};