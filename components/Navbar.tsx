'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isOpen
            ? 'bg-white shadow-md py-4' 
            : 'bg-white/80 backdrop-blur-md py-5 border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-brand-indigo text-white p-2 rounded-lg group-hover:bg-brand-blue transition-colors duration-300">
                 <Sparkles size={18} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-brand-indigo leading-none text-lg">Inspired Intelligence</span>
                <span className="font-sans text-xs text-gray-500 tracking-wider uppercase">Academy</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                    isActive(link.path) 
                      ? 'text-brand-indigo font-semibold' 
                      : 'text-gray-500 hover:text-brand-indigo'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-medium text-gray-500 hover:text-brand-indigo transition-colors flex items-center gap-2"
                  >
                    <User size={16} />
                    {profile?.username || 'Dashboard'}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push('/');
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-brand-indigo transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                  <Link 
                    href="/shop" 
                    className="px-6 py-2.5 bg-brand-indigo text-white rounded-lg text-sm font-bold hover:bg-brand-blue hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-indigo/10 flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> Shop
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-brand-indigo transition-colors">
                    Login
                  </Link>
                  <Link 
                    href="/shop" 
                    className="px-6 py-2.5 bg-brand-indigo text-white rounded-lg text-sm font-bold hover:bg-brand-blue hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-indigo/10 flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> Shop
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-indigo p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-white z-[40] pt-28 px-6 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="flex flex-col gap-6">
               {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-heading font-bold text-gray-800 hover:text-brand-indigo transition-colors border-b border-gray-100 pb-4"
                  >
                    {link.name}
                  </Link>
               ))}
               <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 mt-4 bg-brand-indigo text-white rounded-xl font-bold text-center text-lg shadow-xl"
               >
                  Browse Shop
               </Link>
               {user ? (
                 <>
                   <Link
                     href="/dashboard"
                     onClick={() => setIsOpen(false)}
                     className="w-full py-4 text-gray-500 font-medium text-center flex items-center justify-center gap-2"
                   >
                     <User size={20} />
                     Dashboard
                   </Link>
                   <button
                     onClick={async () => {
                       await signOut();
                       setIsOpen(false);
                       router.push('/');
                     }}
                     className="w-full py-4 text-gray-500 font-medium text-center flex items-center justify-center gap-2"
                   >
                     <LogOut size={20} />
                     Logout
                   </button>
                 </>
               ) : (
                 <Link
                   href="/auth/login"
                   onClick={() => setIsOpen(false)}
                   className="w-full py-4 text-gray-500 font-medium text-center"
                 >
                   Login
                 </Link>
               )}
             </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;