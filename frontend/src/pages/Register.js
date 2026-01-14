import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { ShieldCheck, Mail, RefreshCw } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const [verificationCode, setVerificationCode] = useState('');

  const handleStep1 = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register/step1', {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      setVerificationId(response.data.verification_id);
      
      // For development - auto fill code
      if (response.data.email_code_mock) {
        setVerificationCode(response.data.email_code_mock);
        toast.success('Doğrulama kodu e-postanıza gönderildi! (Geliştirme: Kod otomatik dolduruldu)');
      } else {
        toast.success('Doğrulama kodu e-postanıza gönderildi');
      }
      
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-email', {
        verification_id: verificationId,
        code: verificationCode
      });
      
      localStorage.setItem('token', response.data.access_token);
      toast.success('Kayıt başarılı! Profilinizi tamamlayın');
      navigate('/profile/complete');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const response = await api.post(`/auth/resend-code?verification_id=${verificationId}`);
      
      if (response.data.email_code_mock) {
        setVerificationCode(response.data.email_code_mock);
        toast.success('Yeni kod gönderildi! (Geliştirme: Kod otomatik dolduruldu)');
      } else {
        toast.success('Yeni doğrulama kodu gönderildi');
      }
    } catch (error) {
      toast.error('Kod gönderilemedi');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 2 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <ShieldCheck className="w-12 h-12 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>Kayıt Ol</h2>
              <p className="text-muted-foreground mt-2">Kurumsal e-postanızla kayıt olun</p>
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Adınız"
                    required
                    data-testid="register-firstname-input"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Soyadınız"
                    required
                    data-testid="register-lastname-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Kurumsal E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@adalet.gov.tr"
                  required
                  data-testid="register-email-input"
                />
                <p className="text-xs text-muted-foreground mt-1">Sadece .gov.tr uzantılı e-postalar kabul edilir</p>
              </div>

              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="En az 6 karakter"
                  required
                  data-testid="register-password-input"
                />
              </div>

              <div>
                <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  placeholder="Şifrenizi tekrar girin"
                  required
                  data-testid="register-password-confirm-input"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" disabled={loading} data-testid="register-step1-button">
                {loading ? 'İşleniyor...' : 'Devam Et'}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <Mail className="w-12 h-12 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>E-posta Doğrulama</h2>
              <p className="text-muted-foreground mt-2">
                <span className="font-medium text-foreground">{formData.email}</span> adresine gönderilen 6 haneli kodu girin
              </p>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <Label htmlFor="code">Doğrulama Kodu</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  required
                  data-testid="verification-code-input"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" disabled={loading || verificationCode.length !== 6} data-testid="verify-email-button">
                {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                  data-testid="resend-code-button"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendLoading ? 'Gönderiliyor...' : 'Kodu tekrar gönder'}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Geri Dön
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium" data-testid="login-link">
            Giriş Yap
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
