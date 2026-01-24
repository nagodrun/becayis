import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api, { getErrorMessage } from '../lib/api';
import { Shield, User, Users, Settings, BarChart3 } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

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
      toast.error(getErrorMessage(error, 'Giriş başarısız'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Sol taraf - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Manrope' }}>
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent">
                    Admin Girişi
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Yönetim paneline erişim için giriş yapın
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-200">Kullanıcı Adı</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="admin@kurum.gov.tr"
                      required
                      className="pl-10 h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      data-testid="admin-username-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-200">Şifre</Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifrenizi girin"
                    required
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    data-testid="admin-password-input"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white font-medium"
                  disabled={loading}
                  data-testid="admin-login-button"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>

                {/* Back to Home */}
                <div className="text-center pt-2">
                  <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </form>
            </Card>
          </div>

          {/* Sağ taraf - Bilgi kartları */}
          <div className="hidden lg:block pt-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Manrope' }}>
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent">
                  Yönetim Paneli
                </span>
              </h2>
              <p className="text-slate-400">
                Platform yönetimi ve moderasyon araçları
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Card 1 */}
              <div className="flex items-start space-x-4 p-5 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Kullanıcı Yönetimi</h3>
                  <p className="text-sm text-slate-400">Kullanıcıları görüntüleyin, engelleyin veya silin</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="flex items-start space-x-4 p-5 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <Settings className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">İlan Onaylama</h3>
                  <p className="text-sm text-slate-400">Bekleyen ilanları inceleyin ve onaylayın</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="flex items-start space-x-4 p-5 bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <div className="flex-shrink-0">
                  <BarChart3 className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Platform İstatistikleri</h3>
                  <p className="text-sm text-slate-400">Kullanıcı, ilan ve etkileşim verilerini takip edin</p>
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
