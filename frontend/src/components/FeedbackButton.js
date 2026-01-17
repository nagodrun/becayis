import React, { useState } from 'react';
import { Button } from './ui/button';
import { MessageCircle, X } from 'lucide-react';
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
import { toast } from 'sonner';

export const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send feedback to backend
    toast.success('Geri bildiriminiz alındı. Teşekkür ederiz!');
    setFeedback('');
    setEmail('');
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-amber-800 to-orange-700 hover:from-amber-600 hover:to-orange-600"
        data-testid="feedback-button"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geri Bildirim</DialogTitle>
            <DialogDescription>
              Görüş ve önerilerinizi bizimle paylaşın. Size daha iyi hizmet verebilmemiz için önemli.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedback_email">E-posta (Zorunlu)</Label>
              <Input
                id="feedback_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@adalet.gov.tr"
              />
            </div>
            <div>
              <Label htmlFor="feedback_text">Mesajınız (Zorunlu)</Label>
              <Textarea
                id="feedback_text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Düşüncelerinizi buraya yazın..."
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Gönder</Button>
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
