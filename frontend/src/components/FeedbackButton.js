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
import api, { getErrorMessage } from '../lib/api';

export const FeedbackButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        toast.error(getErrorMessage(error, 'Geri bildirim gönderilemedi'));
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
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-sm transition-all duration-300 ring-4 ring-blue-300/30 dark:ring-blue-500/20"
        aria-label="Geri bildirim gönder"
        data-testid="feedback-button"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Geri Bildirim</span>
        {/* Animated ping effect */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geri Bildirim / Destek Talebi</DialogTitle>
            <DialogDescription>
              {user 
                ? 'Görüş, öneri veya sorunlarınızı bizimle paylaşın. Destek talebinizi panelinizdeki "Destek" sekmesinden takip edebilirsiniz.'
                : ''
              }
            </DialogDescription>
          </DialogHeader>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">Giriş Yapmanız Gerekiyor</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Geri bildirim göndermek için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                  onClick={() => {
                    setOpen(false);
                    window.location.href = '/login';
                  }}
                  data-testid="feedback-login-btn"
                >
                  Giriş Yap
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setOpen(false);
                    window.location.href = '/register';
                  }}
                  data-testid="feedback-register-btn"
                >
                  Kayıt Ol
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
