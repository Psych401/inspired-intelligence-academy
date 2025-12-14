/**
 * Table of Contents Component
 * 
 * Generates a table of contents from HTML content by extracting headings
 */

'use client';

import { useEffect, useState } from 'react';
import { Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { extractHeadings } from '@/lib/blog-content';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  mobile?: boolean;
}

export default function TableOfContents({ content, mobile = false }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!content) return;

    // Extract headings using utility function
    const headings = extractHeadings(content);

    const items: TocItem[] = headings.map(({ id, text, level }) => ({
      id,
      text,
      level,
    }));

    setTocItems(items);

    // Add scroll spy to highlight active heading
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  if (tocItems.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {mobile ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full mb-4"
          >
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-brand-indigo" />
              <h3 className="font-heading font-bold text-lg text-brand-indigo">Table of Contents</h3>
            </div>
            {isOpen ? (
              <ChevronUp size={20} className="text-brand-indigo" />
            ) : (
              <ChevronDown size={20} className="text-brand-indigo" />
            )}
          </button>
          {isOpen && (
            <nav className="space-y-2 max-h-96 overflow-y-auto">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(item.id);
                    setIsOpen(false);
                  }}
                  className={`block text-sm transition-colors ${
                    item.level === 1
                      ? 'font-semibold text-brand-indigo'
                      : item.level === 2
                      ? 'font-medium text-gray-700 ml-4'
                      : 'text-gray-600 ml-8'
                  } ${
                    activeId === item.id
                      ? 'text-brand-blue border-l-2 border-brand-blue pl-3'
                      : 'hover:text-brand-blue pl-3'
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Hash size={18} className="text-brand-indigo" />
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Table of Contents</h3>
          </div>
          <nav className="space-y-2">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(item.id);
                }}
                className={`block text-sm transition-colors ${
                  item.level === 1
                    ? 'font-semibold text-brand-indigo'
                    : item.level === 2
                    ? 'font-medium text-gray-700 ml-4'
                    : 'text-gray-600 ml-8'
                } ${
                  activeId === item.id
                    ? 'text-brand-blue border-l-2 border-brand-blue pl-3'
                    : 'hover:text-brand-blue pl-3'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

