import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Mail, ArrowLeft, KeyRound, Check, AlertTriangle } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Password validation
  const passwordHasMinLength = newPassword.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(newPassword);
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(newPassword);
  const passwordIsValid = passwordHasMinLength && passwordHasUppercase && passwordHasSpecialChar;

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setResetToken(response.data.reset_token);
      
      // Show mock code in development
      if (response.data.reset_code_mock) {
        toast.info(`Doğrulama kodu: ${response.data.reset_code_mock}`, { duration: 10000 });
      }
      
      toast.success('Şifre sıfırlama kodu e-posta adresinize gönderildi.');
      setStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/verify-reset-code?reset_token=${resetToken}&code=${code}`);
      toast.success('Kod doğrulandı.');
      setStep(3);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Geçersiz kod'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordIsValid) {
      toast.error('Lütfen tüm şifre gereksinimlerini karşılayın');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword
      });
      toast.success('Şifreniz başarıyla değiştirildi.');
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Şifre değiştirilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 3 ? (
              <KeyRound className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <CardTitle className="text-2xl" style={{ fontFamily: 'Manrope' }}>
            {step === 1 && 'Şifremi Unuttum'}
            {step === 2 && 'Kodu Doğrula'}
            {step === 3 && 'Yeni Şifre Belirle'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Kayıtlı e-posta adresinizi girin, size bir doğrulama kodu göndereceğiz.'}
            {step === 2 && 'E-posta adresinize gönderilen 6 haneli kodu girin.'}
            {step === 3 && 'Yeni şifrenizi belirleyin.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@kurum.gov.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="forgot-email-input"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading} data-testid="send-code-btn">
                {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Doğrulama Kodu</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                  data-testid="reset-code-input"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading} data-testid="verify-code-btn">
                {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <PasswordInput
                  id="newPassword"
                  placeholder="Güçlü bir şifre oluşturun"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  required
                  data-testid="new-password-input"
                />
                
                {/* Caps Lock Warning */}
                {capsLockOn && (
                  <div className="mt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caps Lock açık</span>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs font-medium text-foreground mb-2">Şifre Gereksinimleri:</p>
                  <ul className="space-y-1.5">
                    <li className={`flex items-center gap-2 text-xs ${passwordHasMinLength ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasMinLength ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasMinLength ? '✓' : '✗'}
                      </span>
                      En az 8 karakter
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasUppercase ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasUppercase ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasUppercase ? '✓' : '✗'}
                      </span>
                      En az 1 büyük harf (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasSpecialChar ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasSpecialChar ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasSpecialChar ? '✓' : '✗'}
                      </span>
                      En az 1 özel karakter (!@#$%^&* vb.)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="confirm-password-input"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading || !passwordIsValid} data-testid="reset-password-btn">
                {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
