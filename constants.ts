import { Product, ProductCategory, BlogPost, Testimonial } from './types';

export const APP_NAME = "Inspired Intelligence Academy";
export const OWNER_NAME = "Isaac Cronin";
export const CONTACT_EMAIL = "theinspiredintelligenceacademy@gmail.com";

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'AI for Absolute Beginners',
    description: 'The ultimate starting point. Learn the basics of ChatGPT and Gemini without the jargon.',
    price: 49.99,
    category: ProductCategory.COURSE,
    imageUrl: 'https://picsum.photos/id/1/600/400',
    popular: true,
  },
  {
    id: '2',
    title: 'Everyday Productivity Cheat Sheet',
    description: 'A handy PDF guide with 50 practical prompts to save you time at home and work.',
    price: 12.99,
    category: ProductCategory.GUIDE,
    imageUrl: 'https://picsum.photos/id/20/600/400',
  },
  {
    id: '3',
    title: 'The "Friendly Tutor" GPT',
    description: 'A custom GPT configuration designed to explain complex topics like you are 5 years old.',
    price: 19.99,
    category: ProductCategory.GPT,
    imageUrl: 'https://picsum.photos/id/60/600/400',
  },
  {
    id: '4',
    title: 'Weekend AI Workshop',
    description: 'A mini-course designed to get you up and running with image generation in just 2 days.',
    price: 29.99,
    category: ProductCategory.MINI_COURSE,
    imageUrl: 'https://picsum.photos/id/96/600/400',
  },
  {
    id: '5',
    title: 'The Complete Starter Bundle',
    description: 'Get the beginner course, the cheat sheet, and the workshop in one discounted package.',
    price: 79.99,
    category: ProductCategory.BUNDLE,
    imageUrl: 'https://picsum.photos/id/201/600/400',
  },
];

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