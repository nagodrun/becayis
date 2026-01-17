import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { Shield, AlertTriangle, User, Lock, Settings, Users, BarChart3 } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyEvent = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/login', null, {
        params: {
          username: formData.username,
          password: formData.password
        }
      });
      localStorage.setItem('admin_token', response.data.access_token);
      localStorage.setItem('is_admin', 'true');
      toast.success('Admin girişi başarılı!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start min-h-[calc(100vh-4rem)]">
          
          {/* Sol taraf - Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <Card className="shadow-xl border-0 bg-slate-800/80 backdrop-blur-sm border-slate-700">
              <div className="flex flex-col p-6 text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent">
                    Admin Girişi
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Yönetim paneline erişim için giriş yapın
                </p>
              </div>
              
              <div className="p-6 pt-0 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
                  
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-200">Kullanıcı Adı / E-posta</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="admin@kurum.gov.tr"
                        required
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        data-testid="admin-username-input"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-200">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 z-10" />
                      <PasswordInput
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onKeyDown={handleKeyEvent}
                        onKeyUp={handleKeyEvent}
                        placeholder="Şifrenizi girin"
                        required
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        data-testid="admin-password-input"
                      />
                    </div>
                    {capsLockOn && (
                      <div className="mt-2 flex items-center gap-2 text-amber-400 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Caps Lock açık</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white transition-all duration-200"
                    disabled={loading}
                    data-testid="admin-login-button"
                  >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </form>

                {/* Back to Home */}
                <div className="text-center">
                  <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Ana Sayfaya Dön
                  </Link>
                </div>

                {/* Warning Alert */}
                <div className="rounded-lg border p-4 border-red-800/50 bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="text-sm text-red-200">
                      <strong>Yetkili Erişim:</strong> Bu alan sadece yetkili yöneticiler içindir. Tüm girişler kayıt altına alınmaktadır.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sağ taraf - Bilgi kartları (sadece desktop) */}
          <div className="hidden lg:block">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Manrope' }}>
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent">
                  Yönetim Paneli
                </span>
              </h2>
              <p className="text-lg text-slate-400">
                Platform yönetimi ve moderasyon araçları
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Card 1 */}
              <div className="flex items-start space-x-4 p-6 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Kullanıcı Yönetimi</h3>
                  <p className="text-slate-400">Kullanıcıları görüntüleyin, engelleyin veya silin</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="flex items-start space-x-4 p-6 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <Settings className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">İlan Onaylama</h3>
                  <p className="text-slate-400">Bekleyen ilanları inceleyin ve onaylayın</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="flex items-start space-x-4 p-6 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <BarChart3 className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Platform İstatistikleri</h3>
                  <p className="text-slate-400">Kullanıcı, ilan ve etkileşim verilerini takip edin</p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="flex items-start space-x-4 p-6 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Güvenlik Kontrolleri</h3>
                  <p className="text-slate-400">Şüpheli aktiviteleri izleyin ve aksiyon alın</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
