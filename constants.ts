import { Testimonial } from './types';

export const APP_NAME = "Inspired Intelligence Academy";
export const OWNER_NAME = "Isaac Cronin";
export const CONTACT_EMAIL = "theinspiredintelligenceacademy@gmail.com";

// Products are now fetched from Supabase database (synced from Stripe)
// See app/shop/page.tsx and app/page.tsx for product fetching
// To add products, create them in Stripe Dashboard - they will automatically sync via webhook

// Blog posts are now fetched from WordPress backend via GraphQL
// See app/blog/page.tsx and hooks/useWordPressPosts.ts
// Configure WORDPRESS_GRAPHQL_URL in your .env.local file

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