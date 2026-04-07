/**
 * Buffer module — public API for the 20s WhatsApp message buffer.
 * Story 4.2 — Buffer de Concatenacao (FR12)
 */
export { MessageBuffer, BUFFER_WINDOW_MS, type OnFlushCallback } from './message-buffer.js';
export { createBufferProcessor, type BufferProcessorDeps } from './buffer-processor.js';
