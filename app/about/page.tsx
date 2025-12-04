import Image from 'next/image';
import { OWNER_NAME } from '@/constants';
import { Heart, Lightbulb, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white pt-24">
      {/* Header */}
      <div className="bg-brand-indigo text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">About the Academy</h1>
          <p className="text-xl text-gray-200 font-serif italic">
            "My goal isn't to make you a tech wizard. It's to make you feel like one."
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
           <div className="grid md:grid-cols-2">
              <div className="h-96 md:h-auto relative">
                 <Image 
                    src="/isaac-profile-picture.png" 
                    alt={OWNER_NAME} 
                    fill
                    className="object-cover"
                    priority
                 />
              </div>
              <div className="p-10 md:p-14 flex flex-col justify-center">
                 <h2 className="font-heading font-bold text-3xl text-brand-indigo mb-2">Hi, I'm {OWNER_NAME}.</h2>
                 <p className="text-brand-blue font-semibold mb-6">Digital Designer & AI Educator</p>
                 <div className="space-y-4 text-gray-600 leading-relaxed font-sans">
                    <p>
                       For years, I watched as technology advanced, leaving many brilliant, creative, and hardworking people feeling left behind. I realized that the problem wasn't the people—it was how the technology was being taught.
                    </p>
                    <p>
                       I founded Inspired Intelligence Academy with a simple mission: to strip away the jargon and the "tech-bro" attitude, and replace it with empathy, clarity, and practical utility.
                    </p>
                    <p>
                       I believe AI is a tool for human flourishing. Whether you are a parent, a retiree, a small business owner, or a student, you have a place here.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Mission Values */}
        <div className="mt-20">
           <div className="text-center mb-12">
              <h3 className="font-heading font-bold text-3xl text-brand-indigo">Our Core Values</h3>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                 <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={32} />
                 </div>
                 <h4 className="font-bold text-xl mb-3">Empathy First</h4>
                 <p className="text-gray-600">We understand that learning something new can be scary. We teach with patience and kindness.</p>
              </div>
              <div className="text-center p-6">
                 <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lightbulb size={32} />
                 </div>
                 <h4 className="font-bold text-xl mb-3">Practical Clarity</h4>
                 <p className="text-gray-600">No theories. Just real, actionable steps you can use in your daily life immediately.</p>
              </div>
              <div className="text-center p-6">
                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} />
                 </div>
                 <h4 className="font-bold text-xl mb-3">Empowerment</h4>
                 <p className="text-gray-600">We don't just give you fish; we teach you how to fish in the digital ocean.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

