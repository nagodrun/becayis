import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';
import { FileText } from 'lucide-react';

const CreateEditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [formData, setFormData] = useState({
    institution: '',
    role: '',
    current_province: '',
    current_district: '',
    desired_province: '',
    desired_district: '',
    notes: ''
  });

  useEffect(() => {
    fetchProvinces();
    if (isEdit) {
      fetchListing();
    }
  }, [id]);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setFormData({
        institution: response.data.institution,
        role: response.data.role,
        current_province: response.data.current_province,
        current_district: response.data.current_district,
        desired_province: response.data.desired_province,
        desired_district: response.data.desired_district,
        notes: response.data.notes || ''
      });
    } catch (error) {
      toast.error('İlan yüklenemedi');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, formData);
        toast.success('İlan güncellendi');
      } else {
        await api.post('/listings', formData);
        toast.success('İlan oluşturuldu');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'İlan kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-slate-900 mx-auto mb-4" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Manrope' }}>
              {isEdit ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
            </h1>
            <p className="text-slate-600 mt-2">Yer değişimi için ilan bilgilerinizi girin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution">Kurum</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="örn: Milli Eğitim Bakanlığı"
                  required
                  data-testid="listing-institution-input"
                />
              </div>

              <div>
                <Label htmlFor="role">Pozisyon/Görev</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="örn: Öğretmen"
                  required
                  data-testid="listing-role-input"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Şu Anki Konumunuz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_province">İl</Label>
                  <Select value={formData.current_province || undefined} onValueChange={(val) => setFormData({ ...formData, current_province: val })}>
                    <SelectTrigger data-testid="listing-current-province">
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="current_district">İlçe</Label>
                  <Input
                    id="current_district"
                    value={formData.current_district}
                    onChange={(e) => setFormData({ ...formData, current_district: e.target.value })}
                    required
                    data-testid="listing-current-district-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Hedef Konumunuz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desired_province">İl</Label>
                  <Select value={formData.desired_province || undefined} onValueChange={(val) => setFormData({ ...formData, desired_province: val })}>
                    <SelectTrigger data-testid="listing-desired-province">
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="desired_district">İlçe</Label>
                  <Input
                    id="desired_district"
                    value={formData.desired_district}
                    onChange={(e) => setFormData({ ...formData, desired_district: e.target.value })}
                    required
                    data-testid="listing-desired-district-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Ek bilgi veya tercihlerinizi buraya ekleyebilirsiniz..."
                data-testid="listing-notes-input"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
                data-testid="listing-cancel-button"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800"
                disabled={loading}
                data-testid="listing-submit-button"
              >
                {loading ? 'Kaydediliyor...' : isEdit ? 'İlanı Güncelle' : 'İlanı Yayınla'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateEditListing;