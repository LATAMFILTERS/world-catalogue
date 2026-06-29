/**
 * document-parser.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Deterministically splits raw documents into logical lines and sections.
 */

import type { SourceDocument, DocumentSection } from './knowledge-types';

export function parseDocument(doc: SourceDocument): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  // Basic markdown/text parsing: split by lines, look for headings (#)
  const lines = doc.content.split('\n');
  
  let currentHeading = 'General';
  let currentContent: string[] = [];
  let paragraphIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect heading
    if (trimmed.startsWith('#')) {
      // Save previous section if it has content
      if (currentContent.length > 0) {
        sections.push({
          id: `${doc.id}-sec-${paragraphIndex}`,
          documentId: doc.id,
          heading: currentHeading,
          content: currentContent.join(' '),
          paragraphIndex,
        });
        paragraphIndex++;
        currentContent = [];
      }
      
      // Remove '#' and set new heading
      currentHeading = trimmed.replace(/^#+\s*/, '');
    } else {
      currentContent.push(trimmed);
    }
  }

  // Flush remaining content
  if (currentContent.length > 0) {
    sections.push({
      id: `${doc.id}-sec-${paragraphIndex}`,
      documentId: doc.id,
      heading: currentHeading,
      content: currentContent.join(' '),
      paragraphIndex,
    });
  }

  return sections;
}
