import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Mail, AlertTriangle, Users, MapPin, MessageSquare, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start min-h-[calc(100vh-4rem)]">
          
          {/* Sol taraf - Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex flex-col p-6 text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Giriş Yap
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hesabınıza giriş yapın ve becayiş platformumuzdan faydalanın
                </p>
              </div>
              
              <div className="p-6 pt-0 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">E-posta Adresi</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        placeholder="ornek@adalet.gov.tr"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10"
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      placeholder="Şifrenizi girin"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onKeyDown={handleKeyDown}
                      onKeyUp={handleKeyDown}
                      required
                      showIcon={true}
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

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-amber-600 hover:underline" data-testid="forgot-password-link">
                      Şifremi Unuttum
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white transition-all duration-200"
                    disabled={loading || !passwordIsValid}
                    data-testid="login-submit-button"
                  >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" className="text-amber-600 hover:underline font-medium" data-testid="register-link">
                      Üye Ol
                    </Link>
                  </p>
                </div>

                {/* Info Alert */}
                <div className="rounded-lg border p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Güvenli Giriş:</strong> Giriş yaptıktan sonra panelden tüm becayiş işlemlerinizi yönetebilirsiniz.
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Üyelik Avantajları:</h3>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• İlan oluşturma ve yönetme</li>
                    <li>• Becayiş talebi gönderme</li>
                    <li>• Anlık mesajlaşma</li>
                    <li>• Bildirim ve uyarılar</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Sağ taraf - Bilgi kartları (sadece desktop) */}
          <div className="hidden lg:block">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Hoş Geldiniz!
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Hesabınıza giriş yapın ve becayiş fırsatlarını keşfedin
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Card 1 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Kişisel Panel</h3>
                  <p className="text-gray-600 dark:text-gray-300">Tüm ilanlarınızı ve becayiş taleplerinizi tek yerden yönetin</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <MapPin className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Konum Eşleştirme</h3>
                  <p className="text-gray-600 dark:text-gray-300">Size uygun becayiş ilanlarını kolayca bulun ve eşleşin</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Güvenli İletişim</h3>
                  <p className="text-gray-600 dark:text-gray-300">Karşılıklı onay sonrası güvenli mesajlaşma imkanı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
