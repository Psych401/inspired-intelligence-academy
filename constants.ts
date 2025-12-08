import { Product, ProductCategory, BlogPost, Testimonial } from './types';

export const APP_NAME = "Inspired Intelligence Academy";
export const OWNER_NAME = "Isaac Cronin";
export const CONTACT_EMAIL = "theinspiredintelligenceacademy@gmail.com";

// Products are now fetched from Supabase database (synced from Stripe)
// See app/shop/page.tsx and app/page.tsx for product fetching
// To add products, create them in Stripe Dashboard - they will automatically sync via webhook
export const PRODUCTS: Product[] = []; // Deprecated - use database products instead

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Why AI isn\'t here to replace you',
    excerpt: 'Let’s take a deep breath and look at how technology can actually be a partner, not a replacement.',
    date: 'Oct 12, 2023',
    imageUrl: 'https://picsum.photos/id/119/800/600',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: '5 Simple Ways to Use ChatGPT Today',
    excerpt: 'From meal planning to writing birthday cards, here are the easiest ways to start.',
    date: 'Oct 05, 2023',
    imageUrl: 'https://picsum.photos/id/180/800/600',
    readTime: '3 min read',
  },
  {
    id: '3',
    title: 'Understanding "Prompts" - It’s Just Asking Nicely',
    excerpt: 'Don\'t let the terminology scare you. Prompting is just clear communication.',
    date: 'Sep 28, 2023',
    imageUrl: 'https://picsum.photos/id/201/800/600',
    readTime: '4 min read',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah M.',
    role: 'Retired Teacher',
    content: 'I was terrified of AI, thinking it was only for coders. Isaac’s course made it feel so friendly and approachable. Now I use it to plan my garden!',
    avatarUrl: 'https://picsum.photos/id/64/100/100',
  },
  {
    id: '2',
    name: 'David K.',
    role: 'Small Business Owner',
    content: 'The PDF guides are a lifesaver. No fluff, just exactly what I needed to know to write better emails.',
    avatarUrl: 'https://picsum.photos/id/91/100/100',
  },
  {
    id: '3',
    name: 'Elena R.',
    role: 'Freelancer',
    content: 'Finally, an academy that speaks human language. I feel empowered, not overwhelmed.',
    avatarUrl: 'https://picsum.photos/id/338/100/100',
  },
];