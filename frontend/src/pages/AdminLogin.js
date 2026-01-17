import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';
import { Shield, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Admin Girişi</h1>
          <p className="text-slate-600">Yönetim paneline erişim.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              data-testid="admin-username-input"
            />
          </div>

          <div>
            <Label htmlFor="password">Şifre</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyDown={handleKeyEvent}
              onKeyUp={handleKeyEvent}
              required
              data-testid="admin-password-input"
            />
            {capsLockOn && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Caps Lock açık</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
            data-testid="admin-login-button"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Ana Sayfaya Dön
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;