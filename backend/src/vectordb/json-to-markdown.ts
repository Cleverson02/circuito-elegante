/**
 * JSON-to-Markdown Adapter — Story 1.8
 *
 * Converts structured hotel JSONB data (10 taxonomy categories) into
 * categorized Markdown documents for embedding. Each category maps to
 * one of 5 embedding categories: description, experience, policy, location, faq.
 */

export type EmbeddingCategory = 'faq' | 'description' | 'experience' | 'policy' | 'location';

/** Maps taxonomy categories → embedding categories */
const TAXONOMY_TO_EMBEDDING: Record<string, EmbeddingCategory> = {
  identity:       'description',
  accommodations: 'description',
  reputation:     'description',
  infrastructure: 'experience',
  gastronomy:     'experience',
  experiences:    'experience',
  policies:       'policy',
  transport:      'location',
  concierge:      'faq',
  integration:    'description',
};

export interface MarkdownDocument {
  category: EmbeddingCategory;
  taxonomyCategory: string;
  markdown: string;
}

function formatValue(value: unknown, indent = 0): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    // Array of objects (e.g., restaurants, room_types)
    if (typeof value[0] === 'object' && value[0] !== null) {
      return value
        .map((item) => formatObject(item as Record<string, unknown>, indent))
        .join('\n');
    }
    // Array of primitives
    return value.map((v) => `- ${String(v)}`).join('\n');
  }

  if (typeof value === 'object') {
    return formatObject(value as Record<string, unknown>, indent);
  }

  return String(value);
}

function formatObject(obj: Record<string, unknown>, indent = 0): string {
  const lines: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    if (typeof val === 'string' && val.trim() === '') continue;

    const label = formatLabel(key);

    if (typeof val === 'object' && !Array.isArray(val)) {
      lines.push(`**${label}:**`);
      lines.push(formatValue(val, indent + 1));
    } else if (Array.isArray(val)) {
      lines.push(`**${label}:**`);
      lines.push(formatValue(val, indent));
    } else {
      lines.push(`**${label}:** ${formatValue(val)}`);
    }
  }
  return lines.join('\n');
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a hotel's JSONB `data` into categorized Markdown documents.
 * Skips internal metadata keys (prefixed with _).
 */
export function jsonToMarkdown(
  hotelName: string,
  data: Record<string, unknown>,
): MarkdownDocument[] {
  const documents: MarkdownDocument[] = [];

  for (const [taxonomyCategory, categoryData] of Object.entries(data)) {
    // Skip metadata keys
    if (taxonomyCategory.startsWith('_')) continue;
    if (categoryData === null || categoryData === undefined) continue;
    if (typeof categoryData !== 'object' || Array.isArray(categoryData)) continue;

    const embeddingCategory = TAXONOMY_TO_EMBEDDING[taxonomyCategory];
    if (!embeddingCategory) continue;

    const obj = categoryData as Record<string, unknown>;
    const nonNullEntries = Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && !(typeof v === 'string' && v.trim() === ''),
    );
    if (nonNullEntries.length === 0) continue;

    const markdownLines: string[] = [
      `Hotel: ${hotelName} | Categoria: ${formatLabel(taxonomyCategory)}`,
      '',
    ];

    for (const [field, value] of nonNullEntries) {
      const label = formatLabel(field);
      const formatted = formatValue(value);
      if (!formatted) continue;

      if (typeof value === 'object') {
        markdownLines.push(`## ${label}`);
        markdownLines.push(formatted);
        markdownLines.push('');
      } else {
        markdownLines.push(`**${label}:** ${formatted}`);
      }
    }

    documents.push({
      category: embeddingCategory,
      taxonomyCategory,
      markdown: markdownLines.join('\n').trim(),
    });
  }

  return documents;
}

/**
 * Extract FAQ entries from concierge.faq as individual chunks.
 * Each Q+A pair becomes one chunk for maximum retrieval precision.
 */
export function extractFaqChunks(
  hotelName: string,
  data: Record<string, unknown>,
): { content: string; fieldName: string }[] {
  const concierge = data['concierge'] as Record<string, unknown> | undefined;
  if (!concierge) return [];

  const chunks: { content: string; fieldName: string }[] = [];

  const faq = concierge['faq'];
  if (Array.isArray(faq)) {
    for (const entry of faq) {
      if (typeof entry === 'object' && entry !== null) {
        const obj = entry as Record<string, unknown>;
        const question = obj['question'] ?? obj['pergunta'] ?? obj['q'];
        const answer = obj['answer'] ?? obj['resposta'] ?? obj['a'];
        if (question && answer) {
          chunks.push({
            content: `Hotel: ${hotelName}\nPergunta: ${String(question)}\nResposta: ${String(answer)}`,
            fieldName: 'faq',
          });
        }
      } else if (typeof entry === 'string' && entry.trim()) {
        chunks.push({
          content: `Hotel: ${hotelName}\nFAQ: ${entry}`,
          fieldName: 'faq',
        });
      }
    }
  }

  // Also extract objections and sales arguments as FAQ-like chunks
  const objections = concierge['objections'];
  if (Array.isArray(objections)) {
    for (const obj of objections) {
      if (typeof obj === 'object' && obj !== null) {
        const o = obj as Record<string, unknown>;
        const objection = o['objection'] ?? o['objecao'];
        const response = o['response'] ?? o['resposta'];
        if (objection && response) {
          chunks.push({
            content: `Hotel: ${hotelName}\nObjeção comum: ${String(objection)}\nResposta: ${String(response)}`,
            fieldName: 'objections',
          });
        }
      }
    }
  }

  return chunks;
}
