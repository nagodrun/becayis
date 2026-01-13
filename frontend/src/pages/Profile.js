import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState({
    display_name: '',
    institution: '',
    role: '',
    current_province: '',
    current_district: '',
    bio: ''
  });

  useEffect(() => {
    fetchProvinces();
    fetchInstitutions();
    fetchPositions();
    if (user?.profile) {
      setFormData({
        display_name: user.profile.display_name || '',
        institution: user.profile.institution || '',
        role: user.profile.role || '',
        current_province: user.profile.current_province || '',
        current_district: user.profile.current_district || '',
        bio: user.profile.bio || ''
      });
    }
  }, [user]);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/utility/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await api.get('/utility/positions');
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/profile', formData);
      await fetchUser();
      toast.success('Profiliniz güncellendi!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <UserIcon className="w-12 h-12 text-slate-900 mx-auto mb-4" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Manrope' }}>Profil Düzenle</h1>
            <p className="text-slate-600 mt-2">Bilgilerinizi güncelleyin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Görünen Ad</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                  data-testid="profile-display-name-input"
                />
              </div>

              <div>
                <Label htmlFor="institution">Kurum</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="örn: Adalet Bakanlığı"
                  required
                  data-testid="profile-institution-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Pozisyon/Görev</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="örn: Zabıt Katibi"
                required
                data-testid="profile-role-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_province">Şu Anki İl</Label>
                <Select value={formData.current_province || undefined} onValueChange={(val) => setFormData({ ...formData, current_province: val })}>
                  <SelectTrigger data-testid="profile-current-province">
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="current_district">Şu Anki İlçe</Label>
                <Input
                  id="current_district"
                  value={formData.current_district}
                  onChange={(e) => setFormData({ ...formData, current_district: e.target.value })}
                  required
                  data-testid="profile-current-district-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Hakkınızda (Opsiyonel)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Kısaca kendinizden bahsedin..."
                data-testid="profile-bio-input"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800"
                disabled={loading}
                data-testid="profile-submit-button"
              >
                {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
