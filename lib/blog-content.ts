/**
 * Blog Content Utilities
 * 
 * Functions to process blog post content HTML
 */

/**
 * Adds IDs to headings in HTML content if they don't already have them
 */
export function addHeadingIds(html: string): string {
  if (!html) return html;

  // Use regex to find headings and add IDs
  let processedHtml = html;
  let headingIndex = 0;

  // Match headings (h1-h6) that don't have an id attribute
  processedHtml = processedHtml.replace(
    /<(h[1-6])([^>]*)>(.*?)<\/\1>/gi,
    (match, tag, attributes, content) => {
      // Check if heading already has an id
      if (attributes && /id=["']([^"']+)["']/i.test(attributes)) {
        return match; // Keep as is if it has an ID
      }

      // Generate ID from content
      const text = content.replace(/<[^>]*>/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `heading-${headingIndex++}`;

      // Add id attribute
      const newAttributes = attributes
        ? `${attributes} id="${id}"`
        : `id="${id}"`;

      return `<${tag} ${newAttributes}>${content}</${tag}>`;
    }
  );

  return processedHtml;
}

/**
 * Extracts headings from HTML content
 */
export function extractHeadings(html: string): Array<{ id: string; text: string; level: number }> {
  if (!html) return [];

  const headings: Array<{ id: string; text: string; level: number }> = [];
  const processedHtml = addHeadingIds(html);

  // Match all headings
  const headingRegex = /<(h[1-6])([^>]*)>(.*?)<\/\1>/gi;
  let match;

  while ((match = headingRegex.exec(processedHtml)) !== null) {
    const [, tag, attributes, content] = match;
    const level = parseInt(tag.charAt(1));
    const text = content.replace(/<[^>]*>/g, '').trim();

    // Extract ID from attributes
    const idMatch = attributes.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : `heading-${headings.length}`;

    headings.push({ id, text, level });
  }

  return headings;
}

