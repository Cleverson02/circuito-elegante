// Elevare API Integration — Public API
// Barrel export for backend/src/integrations/elevare/

export { ElevareClient } from './client.js';
export { getElevareConfig, resetElevareConfig } from './config.js';
export type { ElevareConfig } from './config.js';

export {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
  ElevareValidationError,
} from './errors.js';

export {
  searchAndStore,
  multiSearchAndStore,
  getStoredSearchResult,
} from './search.js';

export {
  extractCustomerData,
  registerCustomer,
  createRegisterCustomerTool,
  RegisterCustomerParams,
  ElevareCustomerValidationError,
  ELEVARE_CUSTOMER_REDIS_KEY,
  ELEVARE_CUSTOMER_CACHE_TTL,
} from './customers.js';

export type {
  ElevareCustomerPayload,
  ElevareCustomerResponse,
} from './customers.js';

export {
  createQuotation,
  regeneratePaymentLink,
  extendQuotationValidity,
  getQuotationStatus,
  getStoredQuotationState,
  deriveQuotationStatus,
  QuotationApiError,
  RequestExpiredError,
  InvalidOfferError,
  QuotationNotFoundError,
  QUOTATION_REDIS_KEYS,
} from './quotations.js';

export type {
  CreateQuotationParams,
  CreateQuotationResult,
  RegeneratePaymentLinkParams,
  RegeneratePaymentLinkResult,
  ExtendQuotationParams,
  ExtendQuotationResult,
  GetQuotationStatusResult,
  QuotationStatus,
  QuotationState,
} from './quotations.js';

export type {
  ElevareSearchParams,
  ElevareMultiSearchParams,
  ElevareSearchResponse,
  ElevareMultiSearchResponse,
  ElevareMultiSearchHotel,
  ElevareOffer,
  ElevarePhoto,
  ElevareErrorResponse,
  CircuitBreakerState,
  CircuitBreakerStatus,
  StoredSearchResult,
  StoredMultiSearchResult,
} from './types.js';

export {
  ELEVARE_REDIS_KEYS,
  ELEVARE_REDIS_TTL,
  CIRCUIT_BREAKER_CONFIG,
} from './types.js';
