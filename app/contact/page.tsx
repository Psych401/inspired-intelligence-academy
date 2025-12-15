'use client';

import { useState } from 'react';
import { CONTACT_EMAIL } from '@/constants';
import { MapPin, Mail, Send, HelpCircle, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      // Validate form fields
      if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.email.trim())) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Send POST request to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      // Only show success if email was actually sent
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' }); // Reset form
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "I'm a complete beginner. Is this for me?",
      answer: "Absolutely! We specialize in teaching people with zero technical background. We skip the jargon and focus on practical, everyday uses."
    },
    {
      question: "How do I access my purchase?",
      answer: "After purchasing, you will receive an email with a login link to our Student Portal. You can view all your guides and courses there instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
            <h1 className="font-accent text-5xl text-brand-indigo mb-6">We're here to help</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you are stuck on a download, have a question about a course, or just want to say hello—we'd love to hear from you.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-10">
                
                {/* Contact Form */}
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-indigo font-heading">Send us a message</h2>
                    </div>

                    {submitted ? (
                        <div className="flex flex-col items-center justify-center text-center py-10 bg-green-50 rounded-xl border border-green-200">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-indigo mb-2">Message Sent Successfully!</h3>
                            <p className="text-gray-600">Thank you for reaching out. We'll be in touch soon.</p>
                            <button 
                                onClick={() => {
                                    setSubmitted(false);
                                    setError(null);
                                }}
                                className="mt-6 text-brand-blue font-semibold hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="text-red-800 font-semibold mb-1">Error</p>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Jane Doe"
                                    value={formState.name}
                                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="jane@example.com"
                                    value={formState.email}
                                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">How can we help?</label>
                            <textarea
                                id="message"
                                required
                                rows={6}
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="I'm curious about the beginner course..."
                                value={formState.message}
                                onChange={(e) => setFormState({...formState, message: e.target.value})}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-indigo text-white font-bold py-4 rounded-lg hover:bg-brand-blue transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Column: FAQ & Info */}
            <div className="lg:col-span-5 space-y-8">

                {/* Info Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                            <Mail size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-gray-800 mb-1">Email Support</p>
                            <p className="text-gray-600 text-sm">{CONTACT_EMAIL}</p>
                            <p className="text-xs text-gray-400 mt-1">We typically reply within 24 hours.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-brand-blue shrink-0">
                            <MapPin size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-gray-800 mb-1">Based In</p>
                            <p className="text-gray-600 text-sm">Cork, Ireland</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* FAQ Accordion */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="text-brand-gold" />
                        <h3 className="font-bold text-xl text-brand-indigo">Frequently Asked Questions</h3>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <button 
                                    className="w-full flex justify-between items-center text-left font-medium text-gray-800 hover:text-brand-blue transition-colors"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    {faq.question}
                                    {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {openFaq === index && (
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed animate-fadeIn">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

