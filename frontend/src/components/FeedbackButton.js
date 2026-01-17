import React, { useState } from 'react';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export const FeedbackButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error('Lütfen mesajınızı yazın');
      return;
    }

    // If user is logged in, create a support ticket
    if (user) {
      setSubmitting(true);
      try {
        await api.post('/support-tickets', {
          subject: subject.trim() || 'Geri Bildirim',
          message: feedback.trim(),
          category: category
        });
        toast.success('Destek talebiniz oluşturuldu. Panelinizdeki "Destek" sekmesinden takip edebilirsiniz.');
        setFeedback('');
        setSubject('');
        setCategory('general');
        setOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Geri bildirim gönderilemedi');
      } finally {
        setSubmitting(false);
      }
    } else {
      // For non-logged in users, just show a thank you message
      // In production, this could send an email
      toast.success('Geri bildiriminiz alındı. Teşekkür ederiz!');
      setFeedback('');
      setEmail('');
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-amber-800 to-orange-700 hover:from-amber-600 hover:to-orange-600 z-50"
        data-testid="feedback-button"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geri Bildirim / Destek Talebi</DialogTitle>
            <DialogDescription>
              {user 
                ? 'Görüş, öneri veya sorunlarınızı bizimle paylaşın. Destek talebinizi panelinizdeki "Destek" sekmesinden takip edebilirsiniz.'
                : 'Görüş ve önerilerinizi bizimle paylaşın. Size daha iyi hizmet verebilmemiz için önemli.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {user ? (
              <>
                <div>
                  <Label htmlFor="feedback_category">Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="feedback-category-select">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Genel</SelectItem>
                      <SelectItem value="bug">Hata Bildirimi</SelectItem>
                      <SelectItem value="suggestion">Öneri</SelectItem>
                      <SelectItem value="complaint">Şikayet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feedback_subject">Konu</Label>
                  <Input
                    id="feedback_subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Konuyu kısaca belirtin"
                    maxLength={100}
                    data-testid="feedback-subject-input"
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="feedback_email">E-posta (İsteğe bağlı)</Label>
                <Input
                  id="feedback_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@adalet.gov.tr"
                />
              </div>
            )}
            <div>
              <Label htmlFor="feedback_text">Mesajınız * <span className="text-muted-foreground font-normal">({feedback.length}/1000)</span></Label>
              <Textarea
                id="feedback_text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Düşüncelerinizi buraya yazın..."
                required
                data-testid="feedback-message-input"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500" 
                disabled={submitting || !feedback.trim()}
                data-testid="feedback-submit-btn"
              >
                {submitting ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
