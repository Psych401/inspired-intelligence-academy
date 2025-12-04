import React from 'react';
import Link from 'next/link';
import { Youtube, Sparkles, Mail, MapPin } from 'lucide-react';
import { CONTACT_EMAIL } from '@/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-indigo text-white pt-20 pb-10 border-t-4 border-brand-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
           
           {/* Brand Column */}
           <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2 group">
                  <div className="bg-white/10 p-2 rounded-lg">
                     <Sparkles className="text-brand-gold" size={20} />
                  </div>
                  <span className="font-heading font-bold text-xl tracking-tight">Inspired Intelligence</span>
              </Link>
              <p className="text-indigo-200 text-sm leading-relaxed">
                 Empowering everyday people to harness the power of AI—not just to learn technology, but to transform their lives with it.
              </p>
              <div className="flex gap-4">
                 {[Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-indigo transition-all duration-300">
                       <Icon size={18} />
                    </a>
                 ))}
              </div>
           </div>

           {/* Quick Links */}
           <div>
              <h4 className="font-bold text-white mb-6 text-lg">Explore</h4>
              <ul className="space-y-4 text-sm text-indigo-200">
                 <li><Link href="/" className="hover:text-brand-gold transition-colors flex items-center gap-2">Home</Link></li>
                 <li><Link href="/about" className="hover:text-brand-gold transition-colors flex items-center gap-2">Our Mission</Link></li>
                 <li><Link href="/shop" className="hover:text-brand-gold transition-colors flex items-center gap-2">All Products</Link></li>
                 <li><Link href="/blog" className="hover:text-brand-gold transition-colors flex items-center gap-2">The Blog</Link></li>
              </ul>
           </div>

           {/* Resources */}
           <div>
              <h4 className="font-bold text-white mb-6 text-lg">Student Resources</h4>
              <ul className="space-y-4 text-sm text-indigo-200">
                 <li><Link href="/contact" className="hover:text-brand-gold transition-colors">Login</Link></li>
                 <li><Link href="/contact" className="hover:text-brand-gold transition-colors">Contact</Link></li>
                 <li><Link href="/privacy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link></li>
              </ul>
           </div>

           {/* Contact */}
           <div>
              <h4 className="font-bold text-white mb-6 text-lg">Get in Touch</h4>
              <ul className="space-y-4 text-sm text-indigo-200">
                 <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-brand-gold" />
                    <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors break-all">
                       {CONTACT_EMAIL}
                    </a>
                 </li>
                 <li className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-brand-gold" />
                    <span>Cork, Ireland</span>
                 </li>
              </ul>
           </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-indigo-300">
           <p>&copy; {new Date().getFullYear()} Inspired Intelligence Academy. All rights reserved.</p>
           <p className="text-center md:text-right">Designed with care for beginners everywhere.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;