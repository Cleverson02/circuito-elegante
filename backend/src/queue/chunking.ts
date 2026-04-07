/**
 * Chunking Engine — Human-Typing Simulation.
 * Story 4.3 — FR21 (Human-Typing Simulation & Chunking)
 *
 * Splits LLM responses into natural chunks that simulate human typing cadence.
 * [Source: architecture.md#section-8.2 — Chunking Algorithm]
 */

import type { TypingChunk } from './types.js';

const MAX_CHUNK_CHARS = 400;
const INSTANT_THRESHOLD = 50;
const MAX_CHUNKS_BEFORE_CONSOLIDATION = 6;
const CONSOLIDATED_TARGET_MAX = 5;
const DELAY_VARIATION = 0.2; // ±20%

/**
 * Calculate typing delay for a text chunk.
 * Formula: (text.length / 10) * 1000 ms with ±20% random variation.
 * Returns 0 for short messages (< 50 chars) — instant send, no typing event.
 */
export function calculateDelay(text: string): number {
  if (text.length < INSTANT_THRESHOLD) {
    return 0;
  }
  const baseDelay = (text.length / 10) * 1000;
  const variation = baseDelay * DELAY_VARIATION;
  return Math.round(baseDelay + (Math.random() * variation * 2 - variation));
}

/**
 * Split a single paragraph into sentence-based chunks when it exceeds MAX_CHUNK_CHARS.
 * Splits at sentence boundaries (.!?) and buffers sentences until reaching the limit.
 */
function splitBySentences(paragraph: string): string[] {
  // Split preserving the delimiter at the end of each sentence
  const sentences = paragraph.match(/[^.!?]+[.!?]+\s*/g);
  if (!sentences) {
    // No sentence boundaries found — return as-is
    return [paragraph.trim()];
  }

  // Capture trailing text after the last sentence-ending punctuation
  const matchedLength = sentences.join('').length;
  const trailing = paragraph.slice(matchedLength).trim();

  const chunks: string[] = [];
  let buffer = '';

  for (const sentence of sentences) {
    if (buffer.length + sentence.length > MAX_CHUNK_CHARS && buffer.length > 0) {
      chunks.push(buffer.trim());
      buffer = '';
    }
    buffer += sentence;
  }

  // Append trailing text (without punctuation) to last buffer
  if (trailing.length > 0) {
    buffer += ' ' + trailing;
  }

  if (buffer.trim().length > 0) {
    chunks.push(buffer.trim());
  }

  return chunks;
}

/**
 * Consolidate chunks when there are too many (> 6).
 * Merges adjacent small chunks to reach 4-5 total, recalculating delays.
 */
export function consolidateChunks(chunks: TypingChunk[]): TypingChunk[] {
  if (chunks.length <= MAX_CHUNKS_BEFORE_CONSOLIDATION) {
    return chunks;
  }

  const targetCount = CONSOLIDATED_TARGET_MAX;
  const merged: TypingChunk[] = [];
  const groupSize = Math.ceil(chunks.length / targetCount);

  for (let i = 0; i < chunks.length; i += groupSize) {
    const group = chunks.slice(i, i + groupSize);
    const combinedText = group.map((c) => c.text).join('\n\n');
    merged.push({
      text: combinedText,
      delay: calculateDelay(combinedText),
      isMedia: group.some((c) => c.isMedia),
    });
  }

  // If consolidation overshot, merge last two
  while (merged.length > CONSOLIDATED_TARGET_MAX) {
    const last = merged.pop()!;
    const secondLast = merged[merged.length - 1]!;
    secondLast.text = secondLast.text + '\n\n' + last.text;
    secondLast.delay = calculateDelay(secondLast.text);
    secondLast.isMedia = secondLast.isMedia || last.isMedia;
  }

  return merged;
}

/**
 * Break an LLM response into natural typing chunks.
 *
 * Algorithm:
 * 1. Split by paragraphs (\n\n+)
 * 2. Paragraphs <= 400 chars → 1 chunk
 * 3. Paragraphs > 400 chars → split by sentences (.!?)
 * 4. If total > 6 chunks → consolidate to 4-5
 */
export function chunkResponse(text: string): TypingChunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const rawChunks: TypingChunk[] = [];

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (trimmed.length <= MAX_CHUNK_CHARS) {
      rawChunks.push({
        text: trimmed,
        delay: calculateDelay(trimmed),
        isMedia: false,
      });
    } else {
      // Split long paragraphs by sentences
      const sentenceChunks = splitBySentences(trimmed);
      for (const sc of sentenceChunks) {
        rawChunks.push({
          text: sc,
          delay: calculateDelay(sc),
          isMedia: false,
        });
      }
    }
  }

  return consolidateChunks(rawChunks);
}
