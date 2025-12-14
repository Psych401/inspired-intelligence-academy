'use client';

import { Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useWordPressPosts } from '@/hooks/useWordPressPosts';
import Image from 'next/image';

export default function Blog() {
  const { posts, loading, error, refetch } = useWordPressPosts();

  return (
    <div className="min-h-screen bg-brand-white pb-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
            <span className="text-brand-blue font-semibold uppercase tracking-wider text-sm">The Academy Log</span>
            <h1 className="font-heading font-bold text-4xl text-brand-indigo mt-2 mb-4">Insights & Inspiration</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
            Weekly articles to help you understand the changing world of AI, written in plain English.
            </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-brand-indigo mx-auto mb-4" />
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No blog posts available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                    <div className="relative overflow-hidden h-56">
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover transform hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                        </div>
                        <h2 className="font-heading font-bold text-xl text-brand-indigo mb-3 hover:text-brand-blue transition-colors cursor-pointer">
                            {post.title}
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                            {post.excerpt}
                        </p>
                        <div className="mt-auto">
                            {post.link ? (
                              <a 
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-blue font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                              >
                                Read Article <ArrowRight size={16} />
                              </a>
                            ) : (
                              <button className="text-brand-blue font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                                Read Article <ArrowRight size={16} />
                              </button>
                            )}
                        </div>
                    </div>
                </article>
            ))}
          </div>
        )}

        <div className="mt-16 bg-brand-indigo rounded-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
                <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4">Never miss an update</h3>
                <p className="text-gray-300 max-w-lg mx-auto mb-8">
                    Get these articles delivered straight to your inbox every Friday morning. Perfect for reading with your morning coffee.
                </p>
                <div className="flex justify-center">
                    <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm inline-flex">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className="bg-transparent text-white placeholder-gray-400 px-4 py-3 outline-none w-64 md:w-80"
                        />
                        <button className="bg-brand-gold text-brand-indigo font-bold px-6 py-3 rounded-md hover:bg-white transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

