/**
 * Related Posts Component
 * 
 * Displays related blog posts from the same category
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types';

interface RelatedPostsProps {
  currentPostId: string;
  categorySlug: string;
}

export default function RelatedPosts({ currentPostId, categorySlug }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/wordpress/posts?category=${categorySlug}&exclude=${currentPostId}&limit=3`);
        
        if (response.ok) {
          const data = await response.json();
          setRelatedPosts(data.posts?.nodes?.map((post: any) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt?.replace(/<[^>]*>/g, '').trim() || '',
            date: new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            imageUrl: post.featuredImage?.node?.sourceUrl || '',
            readTime: post.content ? `${Math.ceil(post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min read` : '5 min read',
            slug: post.slug,
            uri: post.uri,
            link: post.uri ? `${data.siteUrl}${post.uri}` : undefined,
          })) || []);
        }
      } catch (err) {
        console.error('Error fetching related posts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchRelatedPosts();
    }
  }, [categorySlug, currentPostId]);

  if (loading || relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-12">
      <h2 className="font-heading font-bold text-3xl text-brand-indigo mb-8">Related Posts</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group"
          >
            {post.imageUrl && (
              <div className="relative overflow-hidden h-48">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.readTime}
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-brand-indigo mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center gap-2 text-brand-blue font-semibold text-sm group-hover:gap-3 transition-all">
                Read More <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

