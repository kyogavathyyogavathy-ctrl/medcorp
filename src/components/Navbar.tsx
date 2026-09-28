import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  CheckCircle2, 
  FileText, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { Notification } from '../types';

interface NavbarProps {
  currentRole: 'doctor' | 'pharma' | 'admin' | 'guest';
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenDoctorAuth: (mode: 'login' | 'register') => void;
  onOpenPharmaAuth: (mode: 'login' | 'register') => void;
  activeDoctorId: string;
  activePharmaId: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  onNavigate,
  onOpenDoctorAuth,
  onOpenPharmaAuth,
  activeDoctorId,
  activePharmaId,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const doctor = StorageService.getDoctorById(activeDoctorId);
  const pharma = StorageService.getPharmaCompanyById(activePharmaId);

  const currentUserId = 
    currentRole === 'doctor' ? doctor?.id :
    currentRole === 'pharma' ? pharma?.id :
    currentRole === 'admin' ? 'admin' : '';

  useEffect(() => {
    const updateNotifs = () => {
      if (currentUserId) {
        setNotifications(StorageService.getNotificationsForUser(currentUserId));
      } else {
        setNotifications([]);
      }
    };
    updateNotifs();
    return subscribeToStorage(updateNotifs);
  }, [currentUserId]);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleMarkAllRead = () => {
    if (currentUserId) {
      StorageService.markNotificationsRead(currentUserId);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-9 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate(currentRole === 'guest' ? 'landing' : 'dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
                  <path d="M7 7l10 10M17 7L7 17" strokeWidth="1.2" opacity="0.6" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Med<span className="text-teal-600">Link</span>
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 tracking-wider uppercase">
                    B2B
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                  Verified Healthcare & Pharma Exchange
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {currentRole === 'guest' ? (
                <>
                  <button
                    onClick={() => onNavigate('landing')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'landing' ? 'text-blue-700 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Home
                  </button>
                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      if (activeTab !== 'landing') {
                        e.preventDefault();
                        onNavigate('landing');
                        setTimeout(() => {
                          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition"
                  >
                    How It Works
                  </a>
                  <button
                    onClick={() => onNavigate('search')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'search' ? 'text-blue-700 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Medicines
                  </button>
                  <a
                    href="#for-doctors"
                    onClick={(e) => {
                      if (activeTab !== 'landing') {
                        e.preventDefault();
                        onNavigate('landing');
                        setTimeout(() => {
                          document.getElementById('for-doctors')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition"
                  >
                    For Doctors
                  </a>
                  <a
                    href="#for-pharma"
                    onClick={(e) => {
                      if (activeTab !== 'landing') {
                        e.preventDefault();
                        onNavigate('landing');
                        setTimeout(() => {
                          document.getElementById('for-pharma')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition"
                  >
                    For Pharma
                  </a>
                </>
              ) : currentRole === 'doctor' ? (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'dashboard' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('search')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'search' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Find Medicines
                  </button>
                  <button
                    onClick={() => onNavigate('requests')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'requests' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Requests & Quotes
                  </button>
                  <button
                    onClick={() => onNavigate('compare')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'compare' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Compare Suppliers
                  </button>
                  <button
                    onClick={() => onNavigate('messages')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'messages' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Procurement Chat
                  </button>
                </>
              ) : currentRole === 'pharma' ? (
                <>
                  <button
                    onClick={() => onNavigate('pharma-dashboard')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'pharma-dashboard' ? 'text-teal-700 bg-teal-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Supplier Portal
                  </button>
                  <button
                    onClick={() => onNavigate('pharma-medicines')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'pharma-medicines' ? 'text-teal-700 bg-teal-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Catalog & Stock
                  </button>
                  <button
                    onClick={() => onNavigate('pharma-requests')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'pharma-requests' ? 'text-teal-700 bg-teal-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Doctor Requisitions
                  </button>
                  <button
                    onClick={() => onNavigate('messages')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === 'messages' ? 'text-teal-700 bg-teal-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Messages
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('admin-overview')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab.startsWith('admin') ? 'text-purple-700 bg-purple-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Admin Compliance Console
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Icons & Profiles */}
          <div className="flex items-center gap-3">
            
            {/* Quick Medicine Search trigger */}
            <button
              onClick={() => onNavigate('search')}
              className="hidden lg:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-slate-200"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search Paracetamol, Atorvastatin...</span>
              <kbd className="bg-white px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-200">⌘K</kbd>
            </button>

            {/* Notification Bell Dropdown */}
            {currentRole !== 'guest' && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.2 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No notifications at this time
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                              !notif.read_status ? 'bg-blue-50/40' : ''
                            }`}
                            onClick={() => {
                              if (notif.link_tab) onNavigate(notif.link_tab);
                              setNotifDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900">{notif.title}</span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Guest Auth CTAs */}
            {currentRole === 'guest' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDoctorAuth('login')}
                  className="text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition"
                >
                  Doctor Sign In
                </button>
                <button
                  onClick={() => onOpenDoctorAuth('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {currentRole === 'doctor' ? doctor?.name :
                     currentRole === 'pharma' ? pharma?.company_name : 'System Admin'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px] flex items-center justify-end gap-1">
                    {currentRole === 'doctor' && (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-teal-600 inline" />
                        <span>{doctor?.hospital.split(' ')[0]}</span>
                      </>
                    )}
                    {currentRole === 'pharma' && (
                      <>
                        <Building2 className="w-3 h-3 text-blue-600 inline" />
                        <span>Verified Supplier</span>
                      </>
                    )}
                    {currentRole === 'admin' && 'Platform Admin'}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                  {currentRole === 'doctor' ? 'MD' :
                   currentRole === 'pharma' ? 'PH' : 'AD'}
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                  title="Sign out / Return to landing page"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3">
          {currentRole === 'guest' ? (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('search'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Browse Medicines
              </button>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => { onOpenDoctorAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg bg-blue-50/50"
                >
                  Doctor Login
                </button>
                <button
                  onClick={() => { onOpenPharmaAuth('register'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg"
                >
                  Join as Pharma Company
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {currentRole === 'doctor' && (
                <>
                  <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Doctor Dashboard</button>
                  <button onClick={() => { onNavigate('search'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Find Medicines</button>
                  <button onClick={() => { onNavigate('requests'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">My Requests & Quotations</button>
                  <button onClick={() => { onNavigate('compare'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Compare Suppliers</button>
                  <button onClick={() => { onNavigate('messages'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Procurement Messages</button>
                </>
              )}
              {currentRole === 'pharma' && (
                <>
                  <button onClick={() => { onNavigate('pharma-dashboard'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Supplier Dashboard</button>
                  <button onClick={() => { onNavigate('pharma-medicines'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Catalog & Stock</button>
                  <button onClick={() => { onNavigate('pharma-requests'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Doctor Requisitions</button>
                </>
              )}
              {currentRole === 'admin' && (
                <button onClick={() => { onNavigate('admin-overview'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-slate-800">Admin Console</button>
              )}
              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-rose-600 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
