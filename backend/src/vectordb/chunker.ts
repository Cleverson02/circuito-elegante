import { createHash } from 'node:crypto';
import { encode } from 'gpt-tokenizer';

const MAX_TOKENS = 500;

export interface Chunk {
  sectionTitle: string;
  content: string;
  contentHash: string;
  tokenCount: number;
}

export function chunkByHeadings(text: string, hotelName?: string): Chunk[] {
  const lines = text.split('\n');
  const sections: { title: string; lines: string[] }[] = [];
  let currentTitle = hotelName ?? 'General';
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        sections.push({ title: currentTitle, lines: currentLines });
      }
      currentTitle = headingMatch[1]!.trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({ title: currentTitle, lines: currentLines });
  }

  const chunks: Chunk[] = [];

  for (const section of sections) {
    const content = section.lines.join('\n').trim();
    if (!content) continue;

    const tokens = encode(content);
    if (tokens.length <= MAX_TOKENS) {
      chunks.push({
        sectionTitle: section.title,
        content,
        contentHash: hashContent(content),
        tokenCount: tokens.length,
      });
    } else {
      const subChunks = splitByTokenLimit(content, MAX_TOKENS);
      for (let i = 0; i < subChunks.length; i++) {
        const sub = subChunks[i]!;
        chunks.push({
          sectionTitle: `${section.title} (part ${i + 1})`,
          content: sub,
          contentHash: hashContent(sub),
          tokenCount: encode(sub).length,
        });
      }
    }
  }

  return chunks;
}

function splitByTokenLimit(text: string, limit: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const result: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (encode(candidate).length <= limit) {
      current = candidate;
    } else {
      if (current) result.push(current.trim());
      if (encode(para).length <= limit) {
        current = para;
      } else {
        // Split long paragraph by sentences
        const sentences = para.split(/(?<=[.!?])\s+/);
        current = '';
        for (const sentence of sentences) {
          const next = current ? `${current} ${sentence}` : sentence;
          if (encode(next).length <= limit) {
            current = next;
          } else {
            if (current) result.push(current.trim());
            current = sentence;
          }
        }
      }
    }
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
