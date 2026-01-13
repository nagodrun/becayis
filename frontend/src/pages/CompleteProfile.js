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

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
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
  }, []);

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
      await api.post('/profile', formData);
      await fetchUser();
      toast.success('Profiliniz oluşturuldu!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Profil oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <UserIcon className="w-12 h-12 text-slate-900 mx-auto mb-4" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Manrope' }}>Profilinizi Tamamlayın</h1>
          <p className="text-slate-600 mt-2">Bu bilgiler ilan oluşturmak için gereklidir</p>
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
                placeholder="örn: Milli Eğitim Bakanlığı"
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
              placeholder="örn: Öğretmen, Müdür, Memur"
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

          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800"
            disabled={loading}
            data-testid="profile-submit-button"
          >
            {loading ? 'Oluşturuluyor...' : 'Profili Tamamla'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfile;