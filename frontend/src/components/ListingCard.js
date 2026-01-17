import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Briefcase, Building2, ArrowRight, Send } from 'lucide-react';
import { formatDate } from '../lib/utils';

// Mask name: "Ahmet Yılmaz" -> "A*** Y***"
const maskName = (name) => {
  if (!name) return 'Anonim';
  return name.split(' ').map(word => {
    if (word.length <= 1) return word;
    return word[0] + '*'.repeat(Math.min(word.length - 1, 3));
  }).join(' ');
};

export const ListingCard = ({ listing, onInvite, showInviteButton = true, showInviteForGuest = false }) => {
  const { profile, user_initials } = listing;
  const navigate = useNavigate();

  const handleGuestInvite = () => {
    navigate('/register');
  };

  // Get avatar URL or use initials
  const avatarUrl = profile?.avatar_url;
  const initials = user_initials || '??';
  const maskedName = maskName(profile?.display_name);

  return (
    <Card
      className="p-4 hover:shadow-md transition-all group relative overflow-hidden"
      data-testid="listing-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-blue-900/20" />
      
      <div className="relative">
        {listing.title && (
          <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1">{listing.title}</h3>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {/* Smaller Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-sm">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={maskedName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">{initials}</span>
              )}
            </div>
            <div>
              <div className="font-medium text-sm text-foreground">
                {maskedName}
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(listing.created_at)}</div>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${
            listing.status === 'active' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
              : listing.status === 'pending_approval'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
              : listing.status === 'rejected'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
          }`}>
            {listing.status === 'active' ? 'Açık' : 
             listing.status === 'pending_approval' ? 'Onay Bekliyor' : 
             listing.status === 'rejected' ? 'Reddedildi' : 'Kapalı'}
          </Badge>
        </div>

        {/* Institution and Role side by side - smaller */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center min-w-0">
            <Building2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{listing.institution}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center min-w-0">
            <Briefcase className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{listing.role}</span>
          </div>
        </div>

        {/* Location Box - more compact */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex-1 min-w-0">
              <div className="text-muted-foreground mb-0.5">Mevcut</div>
              <div className="flex items-center font-medium text-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="truncate">{listing.current_province}</span>
              </div>
            </div>
            
            <ArrowRight className="w-4 h-4 text-amber-500 mx-2 flex-shrink-0" />
            
            <div className="flex-1 min-w-0 text-right">
              <div className="text-muted-foreground mb-0.5">Hedef</div>
              <div className="flex items-center justify-end font-medium text-foreground">
                <span className="truncate">{listing.desired_province}</span>
                <MapPin className="w-3.5 h-3.5 ml-1 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {listing.notes && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{listing.notes}</p>
        )}

        {showInviteButton && onInvite && (
          <Button
            onClick={() => onInvite(listing)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-8 text-sm"
            data-testid="invite-button"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Becayiş Talebi Gönder
          </Button>
        )}

        {showInviteForGuest && (
          <Button
            onClick={handleGuestInvite}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-8 text-sm"
            data-testid="guest-invite-button"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Becayiş Talebi Gönder
          </Button>
        )}
      </div>
    </Card>
  );
};
