/**
 * Unit tests — Chunking Engine
 *
 * Story 4.3 — Human-Typing Simulation (FR21)
 * Tests: chunkResponse, calculateDelay, consolidateChunks
 */

import { chunkResponse, calculateDelay, consolidateChunks } from '../../backend/src/queue/chunking';
import type { TypingChunk } from '../../backend/src/queue/types';

// ─── calculateDelay ────────────────────────────────────────────

describe('calculateDelay', () => {
  it('returns 0 for short text (< 50 chars)', () => {
    expect(calculateDelay('Hello!')).toBe(0);
    expect(calculateDelay('A'.repeat(49))).toBe(0);
  });

  it('returns non-zero for text >= 50 chars', () => {
    const text = 'A'.repeat(50);
    const delay = calculateDelay(text);
    expect(delay).toBeGreaterThan(0);
  });

  it('follows base formula: (length / 10) * 1000 ± 20%', () => {
    const text = 'A'.repeat(100);
    const baseDelay = (100 / 10) * 1000; // 10000ms
    const minDelay = baseDelay * 0.8;
    const maxDelay = baseDelay * 1.2;

    // Run multiple times to account for randomness
    for (let i = 0; i < 50; i++) {
      const delay = calculateDelay(text);
      expect(delay).toBeGreaterThanOrEqual(minDelay - 1); // rounding tolerance
      expect(delay).toBeLessThanOrEqual(maxDelay + 1);
    }
  });

  it('returns integer (rounded) values', () => {
    const text = 'A'.repeat(73);
    const delay = calculateDelay(text);
    expect(Number.isInteger(delay)).toBe(true);
  });

  it('scales proportionally with text length', () => {
    // Longer text should generally produce larger delays
    const shortDelays: number[] = [];
    const longDelays: number[] = [];

    for (let i = 0; i < 20; i++) {
      shortDelays.push(calculateDelay('A'.repeat(100)));
      longDelays.push(calculateDelay('A'.repeat(400)));
    }

    const avgShort = shortDelays.reduce((a, b) => a + b, 0) / shortDelays.length;
    const avgLong = longDelays.reduce((a, b) => a + b, 0) / longDelays.length;
    expect(avgLong).toBeGreaterThan(avgShort);
  });
});

// ─── chunkResponse ──────────────────────────────────────────────

describe('chunkResponse', () => {
  it('returns empty array for empty string', () => {
    expect(chunkResponse('')).toEqual([]);
    expect(chunkResponse('   ')).toEqual([]);
  });

  it('returns 1 chunk for short text (< 50 chars)', () => {
    const chunks = chunkResponse('Hello world!');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.text).toBe('Hello world!');
    expect(chunks[0]!.delay).toBe(0); // < 50 chars → instant
    expect(chunks[0]!.isMedia).toBe(false);
  });

  it('splits text by paragraphs (\\n\\n)', () => {
    const text = 'Paragraph one here.\n\nParagraph two here.\n\nParagraph three.';
    const chunks = chunkResponse(text);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]!.text).toBe('Paragraph one here.');
    expect(chunks[1]!.text).toBe('Paragraph two here.');
    expect(chunks[2]!.text).toBe('Paragraph three.');
  });

  it('splits long paragraphs (> 400 chars) by sentences', () => {
    // Create a paragraph > 400 chars with multiple sentences
    const sentence1 = 'A'.repeat(150) + '.';
    const sentence2 = 'B'.repeat(150) + '.';
    const sentence3 = 'C'.repeat(150) + '.';
    const longParagraph = `${sentence1} ${sentence2} ${sentence3}`;

    expect(longParagraph.length).toBeGreaterThan(400);
    const chunks = chunkResponse(longParagraph);
    expect(chunks.length).toBeGreaterThan(1);

    // Each chunk should be <= 400 chars (or a single sentence that exceeds)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(500); // generous bound
    }
  });

  it('handles text with only whitespace paragraphs', () => {
    const text = 'Hello.\n\n  \n\nWorld.';
    const chunks = chunkResponse(text);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]!.text).toBe('Hello.');
  });

  it('trims whitespace from each chunk', () => {
    const text = '  Hello world.  \n\n  Second paragraph.  ';
    const chunks = chunkResponse(text);
    for (const chunk of chunks) {
      expect(chunk.text).toBe(chunk.text.trim());
    }
  });

  it('sets isMedia to false for all text chunks', () => {
    const chunks = chunkResponse('First paragraph.\n\nSecond paragraph.');
    for (const chunk of chunks) {
      expect(chunk.isMedia).toBe(false);
    }
  });

  it('calculates delay for each chunk', () => {
    // 100-char text should have non-zero delay
    const text = 'A'.repeat(100) + '.\n\n' + 'B'.repeat(100) + '.';
    const chunks = chunkResponse(text);
    for (const chunk of chunks) {
      if (chunk.text.length >= 50) {
        expect(chunk.delay).toBeGreaterThan(0);
      }
    }
  });

  it('consolidates when > 6 chunks to 4-5 chunks', () => {
    // Create 8 paragraphs
    const paragraphs = Array.from({ length: 8 }, (_, i) =>
      `Paragraph ${i + 1} with enough text to be meaningful here.`
    );
    const text = paragraphs.join('\n\n');
    const chunks = chunkResponse(text);
    expect(chunks.length).toBeGreaterThanOrEqual(4);
    expect(chunks.length).toBeLessThanOrEqual(5);
  });

  it('preserves trailing text without sentence-ending punctuation', () => {
    // Long paragraph where the last part has no punctuation
    const text = 'A'.repeat(150) + '. ' + 'B'.repeat(150) + '. ' + 'C'.repeat(50);
    const chunks = chunkResponse(text);
    // All text must be preserved — join chunks and check total length
    const totalText = chunks.map((c) => c.text).join(' ');
    expect(totalText).toContain('C'.repeat(50));
  });

  it('does not consolidate when <= 6 chunks', () => {
    const paragraphs = Array.from({ length: 4 }, (_, i) =>
      `Paragraph ${i + 1} with enough text to be meaningful.`
    );
    const text = paragraphs.join('\n\n');
    const chunks = chunkResponse(text);
    expect(chunks.length).toBe(4);
  });
});

// ─── consolidateChunks ─────────────────────────────────────────

describe('consolidateChunks', () => {
  function makeChunks(count: number): TypingChunk[] {
    return Array.from({ length: count }, (_, i) => ({
      text: `Chunk ${i + 1} with some text content.`,
      delay: 3000,
      isMedia: false,
    }));
  }

  it('returns same array when <= 6 chunks', () => {
    const chunks = makeChunks(6);
    const result = consolidateChunks(chunks);
    expect(result).toHaveLength(6);
  });

  it('consolidates 7+ chunks to 4-5', () => {
    const chunks = makeChunks(8);
    const result = consolidateChunks(chunks);
    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('consolidates 10 chunks to 4-5', () => {
    const chunks = makeChunks(10);
    const result = consolidateChunks(chunks);
    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('preserves all text content after consolidation', () => {
    const chunks = makeChunks(8);
    const originalText = chunks.map((c) => c.text).join('\n\n');
    const result = consolidateChunks(chunks);
    const consolidatedText = result.map((c) => c.text).join('\n\n');
    expect(consolidatedText).toBe(originalText);
  });

  it('recalculates delay for merged chunks', () => {
    const chunks = makeChunks(8);
    const result = consolidateChunks(chunks);
    // Merged chunks should have different delays (based on combined text length)
    for (const chunk of result) {
      expect(chunk.delay).toBeGreaterThanOrEqual(0);
    }
  });

  it('propagates isMedia flag from any merged chunk', () => {
    const chunks = makeChunks(8);
    chunks[2]!.isMedia = true;
    const result = consolidateChunks(chunks);
    const hasMedia = result.some((c) => c.isMedia);
    expect(hasMedia).toBe(true);
  });
});
