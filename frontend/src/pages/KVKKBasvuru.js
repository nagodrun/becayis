import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

const KVKKBasvuru = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    tcNo: '',
    email: '',
    phone: '',
    requestType: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);

  const requestTypes = [
    { value: 'bilgi', label: 'Kişisel verilerimin işlenip işlenmediğini öğrenmek istiyorum' },
    { value: 'erisim', label: 'Kişisel verilerime erişim talep ediyorum' },
    { value: 'duzeltme', label: 'Kişisel verilerimin düzeltilmesini istiyorum' },
    { value: 'silme', label: 'Kişisel verilerimin silinmesini istiyorum' },
    { value: 'aktarim', label: 'Kişisel verilerimin aktarıldığı üçüncü kişileri öğrenmek istiyorum' },
    { value: 'itiraz', label: 'Otomatik sistemlerle yapılan işleme itiraz ediyorum' },
    { value: 'zarar', label: 'Kanuna aykırı işleme nedeniyle zararımın giderilmesini talep ediyorum' },
    { value: 'diger', label: 'Diğer' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.requestType || !formData.details) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    
    // Simulate submission (in production, this would be sent to backend)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('KVKK başvurunuz alınmıştır. En kısa sürede tarafınıza dönüş yapılacaktır.');
    setFormData({
      fullName: '',
      tcNo: '',
      email: '',
      phone: '',
      requestType: '',
      details: ''
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                  KVKK Başvuru Formu
                </h1>
                <p className="text-muted-foreground text-sm">6698 sayılı KVKK kapsamında hak talebi</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tcNo">T.C. Kimlik No</Label>
                  <Input
                    id="tcNo"
                    value={formData.tcNo}
                    onChange={(e) => setFormData({ ...formData, tcNo: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    placeholder="11 haneli TC Kimlik No"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresi *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon Numarası</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Talep Türü *</Label>
                <Select
                  value={formData.requestType}
                  onValueChange={(value) => setFormData({ ...formData, requestType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Talep türünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Talep Detayları *</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Talebinizi detaylı olarak açıklayınız..."
                  rows={5}
                  required
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Bilgilendirme:</strong> Başvurunuz, 6698 sayılı Kanun'un 13. maddesi gereğince 
                  en geç 30 gün içinde yanıtlanacaktır. Başvurunuzun sonuçlandırılmasını takiben 
                  tarafınıza e-posta yoluyla bilgi verilecektir.
                </p>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? (
                  'Gönderiliyor...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Başvuruyu Gönder
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KVKKBasvuru;
