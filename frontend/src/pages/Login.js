import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/api';
import { Mail, Users, MapPin, MessageSquare } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Giriş başarılı!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Giriş başarısız'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Sol taraf - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Giriş Yap
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hesabınıza giriş yapın ve platformumuzdan faydalanın
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-posta Adresi</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      placeholder="ornek@kurum.gov.tr"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="pl-10 h-11"
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
                    required
                    className="h-11"
                    data-testid="login-password-input"
                  />
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
                  className="w-full h-11 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white font-medium"
                  disabled={loading}
                  data-testid="login-submit-button"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>

                {/* Register Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" className="text-amber-600 hover:underline font-medium" data-testid="register-link">
                      Üye Ol
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </div>

          {/* Sağ taraf - Bilgi kartları */}
          <div className="hidden lg:block pt-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Hoş Geldiniz!
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Hesabınıza giriş yapın ve avantajlardan yararlanın
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Card 1 */}
              <div className="flex items-start space-x-4 p-5 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <Users className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Kişisel Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tüm ilanlarınızı ve becayiş taleplerinizi tek yerden yönetin</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="flex items-start space-x-4 p-5 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <MapPin className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Konum Eşleştirme</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Size uygun becayiş ilanlarını kolayca bulun ve eşleşin</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="flex items-start space-x-4 p-5 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  <MessageSquare className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Güvenli İletişim</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Karşılıklı onay sonrası güvenli mesajlaşma imkanı</p>
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
