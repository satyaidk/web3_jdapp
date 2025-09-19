'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';
import { useAppStore } from '@/store';
import { useAuthSync } from '@/hooks/useAuthSync';
import SwitchIndicator from './SwitchIndicator';
import { signOut as nextAuthSignOut } from 'next-auth/react';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, signOut } = useAppStore();
  
  // Sync NextAuth session with our store
  useAuthSync();
  const isEventsPage = pathname?.startsWith('/events') ?? false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      // Sign out from NextAuth (for OAuth users)
      await nextAuthSignOut({ callbackUrl: '/' });
      
      // Sign out from our Zustand store
      signOut();
      
      // Close the menu
      setShowUserMenu(false);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: just sign out from our store
      signOut();
      setShowUserMenu(false);
      router.push('/');
    }
  };
  
  const jobLinks = [
    { name: 'Home', href: '/' },
    { name: 'Companies', href: '/companies' },
    { name: 'Developers', href: '/developers' },
    { name: 'Freelancers', href: '/freelancers' },
    { name: 'Profile', href: '/profile' },
  ];
  
  const eventLinks = [
    { name: 'Events', href: '/events' },
    { name: 'Create Event', href: '/events/create' },
    { name: 'My Events', href: '/events/my-events' },
    { name: 'Rewards', href: '/events/rewards' },
    { name: 'Dashboard', href: '/events/dashboard' },
    { name: 'Communities', href: '/events/communities' },
  ];
  
  const navLinks = isEventsPage ? eventLinks : jobLinks;

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 rounded-b-2xl mx-2 mt-2",
        isScrolled
          ? "bg-background/20 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl max-w-7xl left-1/2 transform -translate-x-1/2"
          : "bg-transparent max-w-full left-0 transform-none",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Animation */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href={isEventsPage ? '/' : '/events'} 
              className="relative text-2xl font-bold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-all duration-300 group"
            >
              <span className="relative z-10">{isEventsPage ? 'Events' : 'Job Network'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500"></div>
            </Link>
            <SwitchIndicator isEventsPage={isEventsPage} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <UserCircleIcon className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-lg border border-white/10 dark:border-white/10 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200/20 dark:border-gray-700/20">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUserMenu(false);
                          router.push('/profile');
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer rounded-md hover:shadow-sm"
                      >
                        <UserCircleIcon className="h-4 w-4" />
                        <span>View Profile</span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer rounded-md hover:shadow-sm"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 backdrop-blur-md border border-indigo-400/30 text-sm font-medium rounded-lg text-white bg-indigo-600/20 hover:bg-indigo-600/30 hover:border-indigo-400/50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className={cn(
            "px-2 pt-2 pb-3 space-y-1 border-t transition-all duration-300",
            isScrolled
              ? "bg-background/20 backdrop-blur-md border-white/10"
              : "bg-white/10 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className={cn(
              "pt-4 pb-3 border-t transition-all duration-300",
              isScrolled
                ? "border-white/10"
                : "border-gray-200/50 dark:border-gray-700/50"
            )}>
              {isAuthenticated ? (
                <div className="px-3 space-y-3">
                  <div className="flex items-center justify-center space-x-3 px-3 py-2 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
                    <div className="relative">
                      <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser?.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="block w-full text-center px-4 py-2 bg-indigo-600/20 backdrop-blur-md border border-indigo-400/30 text-sm font-medium rounded-lg text-white hover:bg-indigo-600/30 hover:border-indigo-400/50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2 bg-red-600/20 backdrop-blur-md border border-red-400/30 text-sm font-medium rounded-lg text-white hover:bg-red-600/30 hover:border-red-400/50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center px-3 space-x-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center px-4 py-2 backdrop-blur-md border border-indigo-400/30 text-sm font-medium rounded-lg text-white bg-indigo-600/20 hover:bg-indigo-600/30 hover:border-indigo-400/50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              <div className="mt-3 px-3">
                <Link
                  href={isEventsPage ? '/' : '/events'}
                  className="block w-full text-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-transparent hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-200"
                >
                  Switch to {isEventsPage ? 'Job Network' : 'Events'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
