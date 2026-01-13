import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { ShieldCheck, Phone, User } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState('');
  const [userId, setUserId] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const [step1Data, setStep1Data] = useState({
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const [step2Data, setStep2Data] = useState({
    phone: '',
    otp: ''
  });

  const handleStep1 = async (e) => {
    e.preventDefault();
    
    if (step1Data.password !== step1Data.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register/step1', {
        registry_number: step1Data.registry_number,
        email: step1Data.email,
        password: step1Data.password
      });
      
      setVerificationId(response.data.verification_id);
      toast.success('1. adım tamamlandı');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register/step2', {
        verification_id: verificationId,
        phone: step2Data.phone
      });
      
      // Mock OTP for MVP
      setMockOtp(response.data.otp_mock);
      toast.success('OTP gönderildi! (Geliştirme modu: OTP otomatik dolduruldu)');
      setStep2Data({ ...step2Data, otp: response.data.otp_mock });
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Telefon doğrulaması başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        verification_id: verificationId,
        otp: step2Data.otp
      });
      
      localStorage.setItem('token', response.data.access_token);
      setUserId(response.data.user_id);
      toast.success('Doğrulama başarılı! Profilinizi tamamlayın');
      navigate('/profile/complete');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP doğrulaması başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-slate-900' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <ShieldCheck className="w-12 h-12 text-slate-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Manrope' }}>Kimlik Doğrulama</h2>
              <p className="text-slate-600 mt-2">Sicil numaranız ve kurumsal e-postanızı girin</p>
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <Label htmlFor="registry_number">Sicil No</Label>
                <Input
                  id="registry_number"
                  value={step1Data.registry_number}
                  onChange={(e) => setStep1Data({ ...step1Data, registry_number: e.target.value })}
                  required
                  data-testid="register-registry-input"
                />
              </div>

              <div>
                <Label htmlFor="email">Kurumsal E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={step1Data.email}
                  onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                  placeholder="ornek@adalet.gov.tr"
                  required
                  data-testid="register-email-input"
                />
                <p className="text-xs text-slate-500 mt-1">Sadece .gov.tr uzantılı e-postalar kabul edilir</p>
              </div>

              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={step1Data.password}
                  onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                  required
                  data-testid="register-password-input"
                />
              </div>

              <div>
                <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={step1Data.passwordConfirm}
                  onChange={(e) => setStep1Data({ ...step1Data, passwordConfirm: e.target.value })}
                  required
                  data-testid="register-password-confirm-input"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading} data-testid="register-step1-button">
                {loading ? 'İşleniyor...' : 'Devam Et'}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <Phone className="w-12 h-12 text-slate-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Manrope' }}>Telefon Doğrulama</h2>
              <p className="text-slate-600 mt-2">Telefon numarasınızı girin</p>
            </div>

            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxxx"
                  value={step2Data.phone}
                  onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                  required
                  data-testid="register-phone-input"
                />
                <p className="text-xs text-slate-500 mt-1">0 ile başlayan 11 haneli numara</p>
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading} data-testid="register-step2-button">
                {loading ? 'Gönderiliyor...' : 'OTP Gönder'}
              </Button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <Phone className="w-12 h-12 text-slate-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Manrope' }}>OTP Doğrulama</h2>
              <p className="text-slate-600 mt-2">{step2Data.phone} numarasına kod gönderildi</p>
              {mockOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-amber-800">MVP Test Modu: OTP = <strong>{mockOtp}</strong></p>
                </div>
              )}
            </div>

            <form onSubmit={handleStep3} className="space-y-4">
              <div>
                <Label htmlFor="otp">Doğrulama Kodu</Label>
                <Input
                  id="otp"
                  value={step2Data.otp}
                  onChange={(e) => setStep2Data({ ...step2Data, otp: e.target.value })}
                  maxLength={6}
                  required
                  data-testid="register-otp-input"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading} data-testid="register-step3-button">
                {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">Zaten hesabınız var mı? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="login-link">
            Giriş Yap
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;