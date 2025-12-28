/**
 * HTML Content Sanitizer for Rukun Ternak
 * 
 * Sanitizes user-generated HTML content from CKEditor
 * to prevent XSS attacks and maintain content integrity
 */

/**
 * Sanitize HTML content from CKEditor
 * Removes dangerous tags and attributes while preserving allowed formatting
 * 
 * @param {string} dirtyHtml - Raw HTML content from CKEditor
 * @returns {string} - Sanitized HTML safe to display
 */
function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  // Define allowed HTML tags
  const allowedTags = {
    'P': true,
    'H1': true,
    'H2': true,
    'H3': true,
    'H4': true,
    'H5': true,
    'H6': true,
    'BR': true,
    'EM': true,
    'I': true,
    'STRONG': true,
    'B': true,
    'U': true,
    'UL': true,
    'OL': true,
    'LI': true,
    'A': true,
    'BLOCKQUOTE': true,
    'SPAN': true,
    'DIV': true,
    'SECTION': true
  };

  // Define allowed attributes by tag
  const allowedAttributes = {
    'A': ['href', 'title', 'target', 'rel']
  };

  // Dangerous attribute patterns to block
  const dangerousAttrPattern = /^(on|javascript|data)/i;

  // Remove script and style tags completely
  let cleaned = dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // Parse HTML manually using regex (safe approach without DOM)
  const tagRegex = /<\/?([A-Z][A-Z0-9]*)\b[^>]*>/gi;
  let result = '';
  let lastIndex = 0;

  let match;
  while ((match = tagRegex.exec(cleaned)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toUpperCase();
    const isClosing = fullTag.startsWith('</');

    // Add text before tag
    result += cleaned.substring(lastIndex, match.index);

    if (isClosing) {
      // Closing tag
      if (allowedTags[tagName]) {
        result += fullTag;
      }
    } else {
      // Opening tag
      if (allowedTags[tagName]) {
        const attrString = fullTag.match(/\s[^>]*/)?.[0] || '';
        const allowedForTag = allowedAttributes[tagName] || [];

        let safeTag = `<${tagName}`;
        const attrRegex = /\s([a-z-]+)=["']?([^"'>\s]+)["']?/gi;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
          const attrName = attrMatch[1].toLowerCase();
          const attrValue = attrMatch[2];

          // Check if attribute is allowed
          if (allowedForTag.includes(attrName)) {
            // Validate href to prevent javascript: protocol
            if (attrName === 'href') {
              if (!attrValue.toLowerCase().startsWith('javascript:') &&
                  !attrValue.toLowerCase().startsWith('data:')) {
                safeTag += ` ${attrName}="${encodeAttribute(attrValue)}"`;
              }
            } else {
              safeTag += ` ${attrName}="${encodeAttribute(attrValue)}"`;
            }
          }
        }

        // Check for dangerous event handlers in inline attributes
        if (!attrString.match(/\s(on[a-z]+|javascript|data)=/i)) {
          safeTag += '>';
          result += safeTag;
        }
      }
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Add remaining text
  result += cleaned.substring(lastIndex);

  // Remove empty or whitespace-only paragraphs
  result = result.replace(/<p>\s*<\/p>/gi, '');
  result = result.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');

  return result.trim();
}

/**
 * Encode attribute value to prevent injection
 * 
 * @param {string} value - Attribute value to encode
 * @returns {string} - Encoded value
 */
function encodeAttribute(value) {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Strip all HTML tags from content (returns plain text)
 * Useful for text search, previews, or validation
 * 
 * @param {string} html - HTML content
 * @returns {string} - Plain text without HTML
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Check if HTML content is empty
 * Handles CKEditor's empty paragraph <p>&nbsp;</p>
 * 
 * @param {string} content - HTML content
 * @returns {boolean} - True if empty
 */
function isContentEmpty(content) {
  if (!content || typeof content !== 'string') return true;
  const stripped = stripHtml(content)
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length === 0;
}

/**
 * Truncate HTML content to specified length while preserving HTML structure
 * Used for previews in lists
 * 
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum character length
 * @returns {string} - Truncated HTML
 */
function truncateHtml(html, maxLength = 200) {
  if (!html || typeof html !== 'string') return '';
  const text = stripHtml(html);
  if (text.length <= maxLength) return html;
  
  const truncated = text.substring(0, maxLength).trim();
  return `<p>${encodeAttribute(truncated)}...</p>`;
}

module.exports = {
  sanitizeHtml,
  encodeAttribute,
  stripHtml,
  isContentEmpty,
  truncateHtml
};
