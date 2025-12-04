import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star, Shield, Brain, Heart, MessageCircleQuestion } from 'lucide-react';
import { PRODUCTS, TESTIMONIALS } from '@/constants';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const featuredProducts = PRODUCTS.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pt-28">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-white to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-indigo rounded-full text-xs font-bold uppercase tracking-wider mb-8">
                 <Star size={14} className="text-brand-gold fill-current" />
                 AI Education for Real People
              </div>
              
              <h1 className="font-accent text-5xl md:text-6xl lg:text-7xl text-brand-indigo mb-6 leading-[1.1]">
                AI made simple. <br/>
                <span className="text-brand-blue relative inline-block">
                   Finally.
                   <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-gold/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                   </svg>
                </span>
              </h1>
              
              <p className="font-sans text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                You don't need to be a tech wizard to use AI. We help everyday people harness the power of technology to save time, spark creativity, and simplify life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/shop" 
                  className="px-8 py-4 bg-brand-indigo text-white rounded-lg font-bold text-lg hover:bg-brand-blue transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Learning <ArrowRight size={20} />
                </Link>
                <Link 
                  href="/about" 
                  className="px-8 py-4 bg-white text-brand-indigo border border-gray-200 rounded-lg font-bold text-lg hover:border-brand-indigo transition-colors flex items-center justify-center"
                >
                  Our Mission
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-blue/5 rounded-full blur-3xl -z-10"></div>
               
               <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <MessageCircleQuestion size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-brand-indigo">Question: "How do I write better prompts?"</h3>
                        <p className="text-xs text-gray-500">The #1 Beginner Struggle</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none">
                        <p className="text-sm text-gray-600">"I feel like I'm just guessing when I type. Is there a simple formula I should use to get better answers?"</p>
                     </div>
                     <div className="bg-brand-indigo/5 p-4 rounded-xl rounded-tr-none">
                        <p className="text-sm text-brand-indigo font-medium">"Absolutely. Try the <span className="font-bold">RPF Method</span>: Role + Problem + Format. <br/><br/>Instead of 'Help me', try: 'Act as a Chef (Role), suggest a dinner for 2 with pasta (Problem), as a shopping list (Format).'"</p>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                     <span>Clear</span>
                     <span>Structured</span>
                     <span>Effective</span>
                  </div>
               </div>
               
               {/* Floating Badges */}
               <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                  <CheckCircle2 className="text-brand-gold" />
                  <span className="font-bold text-brand-indigo text-sm">Instant Clarity</span>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Empathy Section */}
      <section className="py-20 bg-white">
         <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-sm text-brand-blue uppercase tracking-widest mb-3">The Reality</h2>
            <h3 className="font-accent text-3xl md:text-4xl text-brand-indigo mb-6">Does AI feel like a secret club you weren't invited to?</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
               Everywhere you look, people are talking about "prompts" and "algorithms." It's easy to feel overwhelmed, or worse—left behind. But here's the secret: <span className="font-bold text-brand-indigo">AI isn't smart. You are.</span> It's just a tool, like a calculator or a paintbrush. And we are here to show you exactly how to hold it.
            </p>
         </div>
      </section>

      {/* Value Props / "The Academy Way" */}
      <section className="py-20 bg-brand-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
               
               <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-brand-blue mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                     <Shield size={32} />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-brand-indigo mb-3">Safe & Judgment-Free</h4>
                  <p className="text-gray-600">No question is "too basic." We created a safe space where curiosity is celebrated and jargon is banned.</p>
               </div>

               <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-indigo mb-6 group-hover:bg-brand-indigo group-hover:text-white transition-colors">
                     <Brain size={32} />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-brand-indigo mb-3">Practical, Not Theoretical</h4>
                  <p className="text-gray-600">We don't teach you how the code works. We teach you how to use it to write emails, plan meals, and organize your life.</p>
               </div>

               <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                  <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                     <Heart size={32} />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-brand-indigo mb-3">Human-Centered</h4>
                  <p className="text-gray-600">Technology should serve people. Our approach focuses on empathy, creativity, and human connection first.</p>
               </div>

            </div>
         </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
               <div>
                  <h2 className="font-accent text-4xl text-brand-indigo mb-3">Your Learning Toolkit</h2>
                  <p className="text-gray-600 max-w-xl">Curated resources designed to get you from "confused" to "confident" in record time.</p>
               </div>
               <Link href="/shop" className="text-brand-indigo font-bold hover:text-brand-blue flex items-center gap-2 group">
                  View Full Catalog <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>
         </div>
      </section>

      {/* Instructor Spotlight */}
      <section className="py-24 bg-brand-indigo text-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-brand-gold rounded-full blur-[100px] opacity-20"></div>
                  <img 
                     src="https://picsum.photos/seed/isaacteacher/600/700" 
                     alt="Isaac Cronin teaching" 
                     className="relative z-10 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full object-cover h-[500px]" 
                  />
                  <div className="absolute bottom-10 -right-6 bg-white text-brand-indigo p-6 rounded-xl shadow-xl z-20 max-w-xs hidden md:block">
                     <p className="font-accent italic text-lg mb-2">"The best way to predict the future is to create it."</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-400">- Abraham Lincoln</p>
                  </div>
               </div>
               <div className="flex-1">
                  <h2 className="font-heading font-bold text-sm text-brand-gold uppercase tracking-widest mb-4">Meet Your Guide</h2>
                  <h3 className="font-accent text-4xl md:text-5xl mb-6">Isaac Cronin</h3>
                  <p className="text-indigo-200 text-lg mb-6 leading-relaxed">
                     I'm a digital designer and educator with a passion for simplicity. I started Inspired Intelligence Academy because I saw too many brilliant people intimidated by new technology.
                  </p>
                  <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
                     My promise to you is simple: No confusing jargon. No "tech-bro" attitude. Just clear, friendly guidance to help you navigate this new world with confidence.
                  </p>
                  <Link href="/about" className="inline-block px-8 py-3 border-2 border-brand-gold text-brand-gold font-bold rounded-lg hover:bg-brand-gold hover:text-brand-indigo transition-colors">
                     Read My Full Story
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="font-accent text-4xl text-brand-indigo">Stories from the Community</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {TESTIMONIALS.map((t, idx) => (
                  <div key={t.id} className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col ${idx === 1 ? 'md:-translate-y-4 shadow-md' : ''}`}>
                     <div className="flex gap-1 text-brand-gold mb-6">
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                     </div>
                     <p className="text-gray-600 mb-8 italic flex-grow">"{t.content}"</p>
                     <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                        <img src={t.avatarUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                           <p className="font-bold text-brand-indigo">{t.name}</p>
                           <p className="text-xs text-gray-500">{t.role}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-accent text-4xl md:text-5xl text-brand-indigo mb-6">Ready to stop worrying and start learning?</h2>
            <p className="text-xl text-gray-600 mb-10">Join thousands of others who are reclaiming their confidence in the digital age.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link href="/shop" className="px-10 py-4 bg-brand-gold text-brand-indigo font-bold rounded-full text-lg hover:bg-yellow-400 transition-colors shadow-lg">
                  View All Products
               </Link>
               <Link href="/contact" className="px-10 py-4 bg-gray-100 text-gray-700 font-bold rounded-full text-lg hover:bg-gray-200 transition-colors">
                  Contact Us
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}

