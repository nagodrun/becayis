import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { Mail, RefreshCw, AlertTriangle, CircleCheck, Users, Shield, MapPin } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const [verificationCode, setVerificationCode] = useState('');

  // Password validation helpers
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(formData.password);
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(formData.password);
  const passwordIsValid = passwordHasMinLength && passwordHasUppercase && passwordHasSpecialChar;

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    
    if (!passwordIsValid) {
      toast.error('Lütfen tüm şifre gereksinimlerini karşılayın');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start min-h-[calc(100vh-4rem)]">
          
          {/* Sol taraf - Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex flex-col p-6 text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Üye Ol
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hesabınızı oluşturun ve becayiş platformumuza katılın
                </p>
              </div>
              
              <div className="p-6 pt-0 space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        step >= s 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {s}
                      </div>
                      {s < 2 && <div className={`w-16 h-1 mx-2 transition-colors ${step > s ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <form onSubmit={handleStep1} className="space-y-4" data-testid="register-form">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">İsim</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Soyisim</Label>
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

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-posta Adresi</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ornek@kurum.gov.tr"
                        required
                        data-testid="register-email-input"
                      />
                      <p className="text-xs text-gray-500">Sadece .gov.tr uzantılı e-postalar kabul edilir</p>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                      <PasswordInput
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyDown}
                        placeholder="Güçlü bir şifre oluşturun"
                        required
                        data-testid="register-password-input"
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
                    </div>

                    {/* Password Confirm */}
                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm" className="text-sm font-medium">Şifre Tekrar</Label>
                      <PasswordInput
                        id="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                        placeholder="Şifrenizi tekrar girin"
                        required
                        data-testid="register-password-confirm-input"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white transition-all duration-200" 
                      disabled={loading || !passwordIsValid} 
                      data-testid="register-step1-button"
                    >
                      {loading ? 'İşleniyor...' : 'Devam Et'}
                    </Button>
                  </form>
                )}

                {step === 2 && (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>E-posta Doğrulama</h2>
                      <p className="text-muted-foreground mt-2 text-sm">
                        <span className="font-medium text-foreground">{formData.email}</span> adresine gönderilen 6 haneli kodu girin
                      </p>
                    </div>

                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium">Doğrulama Kodu</Label>
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

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white" 
                        disabled={loading || verificationCode.length !== 6} 
                        data-testid="verify-email-button"
                      >
                        {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendLoading}
                          className="text-sm text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center"
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

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" className="text-amber-600 hover:underline font-medium" data-testid="login-link">
                      Giriş Yap
                    </Link>
                  </p>
                </div>

                {/* Info Alert */}
                <div className="rounded-lg border p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-start gap-3">
                    <CircleCheck className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      Kayıt olduktan sonra e-posta adresinize gönderilen doğrulama kodunu girerek hesabınızı aktifleştirin.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sağ taraf - Bilgi kartları (sadece desktop) */}
          <div className="hidden lg:block">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Neden Becayiş Platformumuzu
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Kullanmalısınız?
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Türkiye genelinde kamu çalışanları için güvenilir becayiş platformu
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Card 1 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <CircleCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Güvenli ve Hızlı</h3>
                  <p className="text-gray-600 dark:text-gray-300">Kurumsal e-posta doğrulaması ile sadece gerçek kamu çalışanları</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Geniş Ağ</h3>
                  <p className="text-gray-600 dark:text-gray-300">Tüm Türkiye genelinde binlerce aktif becayiş ilanı</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gizlilik Öncelikli</h3>
                  <p className="text-gray-600 dark:text-gray-300">İletişim bilgileriniz sadece karşılıklı onay sonrası paylaşılır</p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <MapPin className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Konum Eşleştirme</h3>
                  <p className="text-gray-600 dark:text-gray-300">Mevcut ve hedef konumunuza göre otomatik eşleşme önerileri</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
