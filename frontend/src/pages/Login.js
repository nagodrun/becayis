import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Password validation helpers
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(formData.password);
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(formData.password);
  const passwordIsValid = passwordHasMinLength && passwordHasUppercase && passwordHasSpecialChar;

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Giriş başarılı!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-card border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Giriş Yap</h1>
          <p className="text-muted-foreground">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              placeholder="ornek@adalet.gov.tr"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-background border-border text-foreground"
              data-testid="login-email-input"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Şifre</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              placeholder="Şifrenizi giriniz"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyDown}
              required
              className="bg-background border-border text-foreground"
              data-testid="login-password-input"
            />
            
            {/* Caps Lock Warning */}
            {capsLockOn && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Caps Lock açık</span>
              </div>
            )}
            
            {/* Password Requirements */}
            {formData.password.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs font-medium text-foreground mb-2">Şifre Gereksinimleri:</p>
                <ul className="space-y-1.5">
                  <li className={`flex items-center gap-2 text-xs ${passwordHasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasMinLength ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {passwordHasMinLength ? '✓' : '✗'}
                    </span>
                    En az 8 karakter
                  </li>
                  <li className={`flex items-center gap-2 text-xs ${passwordHasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasUppercase ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {passwordHasUppercase ? '✓' : '✗'}
                    </span>
                    En az 1 büyük harf (A-Z)
                  </li>
                  <li className={`flex items-center gap-2 text-xs ${passwordHasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasSpecialChar ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {passwordHasSpecialChar ? '✓' : '✗'}
                    </span>
                    En az 1 özel karakter (!@#$%^&* vb.)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline" data-testid="forgot-password-link">
              Şifremi Unuttum
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            disabled={loading || !passwordIsValid}
            data-testid="login-submit-button"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Hesabınız yok mu? </span>
          <Link to="/register" className="text-amber-500 hover:text-amber-600 font-medium" data-testid="register-link">
            Kayıt Ol
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;