import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, LayoutDashboard, Calendar, History, Settings, Menu, X, Search } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    let interval;
    if (user) {
      interval = setInterval(fetchNotifications, 30000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.patch(`/notifications/${notifId}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isActivePath = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActivePath(path)
        ? 'bg-astro-dark text-white'
        : 'text-astro-muted hover:text-astro-dark hover:bg-white/60'
    }`;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="sticky top-0 z-50 bg-astro-cream/80 backdrop-blur-md border-b border-astro-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <span className="font-serif text-lg font-semibold text-astro-dark tracking-tight">
              Tumhara Pandit
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user && (
              <>
                {user.role === 'client' ? (
                  <>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link to="/marketplace" className={navLinkClass('/marketplace')}>
                      <Search className="w-4 h-4" />
                      Pandits
                    </Link>
                    <Link to="/bookings" className={navLinkClass('/bookings')}>
                      <Calendar className="w-4 h-4" />
                      Bookings
                    </Link>
                    <Link to="/consultations" className={navLinkClass('/consultations')}>
                      <History className="w-4 h-4" />
                      Consultations
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link to="/bookings" className={navLinkClass('/bookings')}>
                      <Calendar className="w-4 h-4" />
                      Appointments
                    </Link>
                    <Link to="/consultations" className={navLinkClass('/consultations')}>
                      <History className="w-4 h-4" />
                      Consultations
                    </Link>
                    <Link to="/profile" className={navLinkClass('/profile')}>
                      <Settings className="w-4 h-4" />
                      Profile
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Auth & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 rounded-full text-astro-muted hover:text-astro-dark hover:bg-white/60 relative transition-colors"
                  >
                    <Bell className="h-5 w-5" strokeWidth={1.5} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto astro-card shadow-xl p-2 z-50">
                      <div className="flex justify-between items-center p-2 border-b border-astro-border mb-2">
                        <span className="font-serif font-semibold text-sm text-astro-dark">Notifications</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-astro-cream text-astro-muted">
                          {unreadCount} Unread
                        </span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-astro-muted">No alerts yet</div>
                      ) : (
                        <div className="space-y-1">
                          {notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                handleMarkAsRead(notif._id);
                                setShowNotifDropdown(false);
                              }}
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                                notif.isRead
                                  ? 'hover:bg-astro-cream opacity-70'
                                  : 'bg-astro-cream border border-astro-border hover:bg-astro-cream-dark'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold ${!notif.isRead ? 'text-astro-dark' : 'text-astro-muted'}`}>
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-astro-muted">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-astro-muted text-[11px] leading-relaxed">{notif.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-astro-border">
                  <div className="w-9 h-9 rounded-full bg-astro-dark text-white flex items-center justify-center text-xs font-semibold">
                    {initials}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-astro-muted hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-astro-muted hover:text-astro-dark transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="astro-btn-primary px-5 py-2 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 rounded-full text-astro-muted relative"
                >
                  <Bell className="h-5 w-5" strokeWidth={1.5} />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <div className="w-8 h-8 rounded-full bg-astro-dark text-white flex items-center justify-center text-[10px] font-semibold">
                  {initials}
                </div>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-astro-muted hover:text-astro-dark"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-astro-border px-2 pt-2 pb-4 space-y-1 shadow-lg">
          {user ? (
            <>
              {(user.role === 'client'
                ? [
                    { to: '/dashboard', label: 'Dashboard' },
                    { to: '/marketplace', label: 'Pandits' },
                    { to: '/bookings', label: 'Bookings' },
                    { to: '/consultations', label: 'Consultations' },
                  ]
                : [
                    { to: '/dashboard', label: 'Dashboard' },
                    { to: '/bookings', label: 'Appointments' },
                    { to: '/consultations', label: 'Consultations' },
                    { to: '/profile', label: 'Profile' },
                  ]
              ).map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActivePath(to) ? 'bg-astro-dark text-white' : 'text-astro-muted hover:bg-astro-cream'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-astro-border flex justify-between items-center px-4">
                <p className="text-sm font-medium text-astro-dark">{user.name}</p>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500">
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 p-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center astro-btn-secondary px-4 py-2.5 text-sm">
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center astro-btn-primary px-4 py-2.5 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
