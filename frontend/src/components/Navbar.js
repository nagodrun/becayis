import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { User, LogOut, Moon, Sun, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Animated Swap Icon Component
const SwapIcon = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative w-9 h-9 flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        absolute inset-0 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 
        transition-all duration-300 ease-out
        ${isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
      `} />
      <ArrowLeftRight 
        className={`
          relative z-10 w-5 h-5 text-white
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}
        `}
      />
    </div>
  );
};

// Notification Badge Component
const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCounts = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const [notificationsRes, invitationsRes, conversationsRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/invitations'),
        api.get('/conversations')
      ]);

      // Count unread notifications
      const unreadNotifications = notificationsRes.data.filter(n => !n.read).length;
      
      // Count pending received invitations
      const pendingInvitations = invitationsRes.data.received?.filter(i => i.status === 'pending').length || 0;
      
      // Count unread messages (conversations with unread last message)
      const unreadMessages = conversationsRes.data.filter(c => 
        c.last_message && !c.last_message.read && c.last_message.sender_id !== user.id
      ).length;

      const total = unreadNotifications + pendingInvitations + unreadMessages;
      setUnreadCount(total);
    } catch {
      // Silently fail - don't show error for notification fetch
    }
  }, [user]);

  // Fetch unread counts when user changes or location changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCounts();

    // Set up polling every 30 seconds only if user exists
    if (user) {
      const interval = setInterval(fetchUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname, fetchUnreadCounts]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <SwapIcon />
            <div className="text-2xl font-extrabold text-foreground transition-colors group-hover:text-amber-500" style={{ fontFamily: 'Manrope' }}>
              Becayiş
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center space-x-2" data-testid="user-menu-button">
                    <div className="relative">
                      <User className="w-5 h-5" />
                      <NotificationBadge count={unreadCount} />
                    </div>
                    <span className="hidden md:inline">{user?.profile?.display_name || 'Profil'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Profilim
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-link">
                  <Button variant="ghost">Giriş Yap</Button>
                </Link>
                <Link to="/register" data-testid="nav-register-link">
                  <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
