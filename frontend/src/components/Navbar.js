import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { User, RefreshCcw, Handshake, LogOut, Moon, Sun, ArrowLeftRight, Shield } from 'lucide-react';
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
const BecayisLogo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex flex-col items-center gap-3 font-sans group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} >
      <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer">         
        {/* Ana Gradyan Kutusu (Amber & Orange) */}
        <div className={`
          absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-500 to-amber-500           
          transition-all duration-500 ease-in-out
          ${isHovered ? 'rounded-2xl rotate-90 scale-105' : 'rounded-2xl rotate-0'}
        `} />
        {/* İkon Grubu */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Yer Değiştirme / Takas İkonu */}
          <ArrowLeftRight 
            className={`w-9 h-9 text-white transition-all duration-500
              ${isHovered ? 'rotate-180 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}
            `}
          />          
          {/* El Sıkışma İkonu (Anlaşma) */}
          <Handshake 
            className={`absolute w-7 h-7 text-white transition-all duration-500
              ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-50 -rotate-12'}
            `}
          />
        </div>
      </div>
    </div>
  );
};

// Notification Badge Component
const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-500 text-white text-xs font-bold rounded-full px-1 animate-pulse">
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
  
  // Check if we're on admin pages and if admin is logged in
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminLoggedIn = localStorage.getItem('is_admin') === 'true' && localStorage.getItem('admin_token');

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('is_admin');
    navigate('/admin/login');
  };

  const fetchUnreadCounts = useCallback(async () => {
    // Don't fetch notifications for admin pages or if admin is logged in on admin pages
    if (!user || isAdminPage) {
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
  }, [user, isAdminPage]);

  // Fetch unread counts when user changes or location changes
  useEffect(() => {
    let isMounted = true;
    
    const doFetch = async () => {
      if (isMounted) {
        await fetchUnreadCounts();
      }
    };
    
    doFetch();

    // Set up polling every 30 seconds only if user exists and not on admin page
    let interval;
    if (user && !isAdminPage) {
      interval = setInterval(doFetch, 30000);
    }
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [user, location.pathname, fetchUnreadCounts, isAdminPage]);

  const isActive = (path) => location.pathname === path;

  // Render admin navbar for admin pages
  if (isAdminPage && isAdminLoggedIn) {
    return (
      <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500 to-red-700" />
                <Shield className="relative z-10 w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-white transition-colors group-hover:text-red-400" style={{ fontFamily: 'Manrope' }}>
                Admin Panel
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                data-testid="theme-toggle"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800" data-testid="admin-menu-button">
                    <Shield className="w-5 h-5" />
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} data-testid="admin-menu-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Admin Paneli
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAdminLogout} data-testid="admin-menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Render admin login page navbar (minimal)
  if (isAdminPage && !isAdminLoggedIn) {
    return (
      <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <BecayisLogo />
              <div className="text-2xl font-extrabold text-white transition-colors group-hover:text-amber-500" style={{ fontFamily: 'Manrope' }}>
                Becayiş
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                data-testid="theme-toggle"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Regular user navbar
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <BecayisLogo />
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-lg">
                      {user?.profile?.avatar_url ? (
                         <img src={user.profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                          ) : (
                          <span className="text-xs font-normal"> 
                          {user?.profile?.display_name ? user.profile.display_name
                          .split(' ')                  // İsmi boşluklardan parçalara ayır
                          .map(n => n[0])              // Her parçanın ilk harfini al
                          .join('')                    // Harfleri birleştir
                          .toUpperCase()               // Hepsini büyük harf yap
                          : '?' 
                          } 
                          </span>  )}
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
                      <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
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
