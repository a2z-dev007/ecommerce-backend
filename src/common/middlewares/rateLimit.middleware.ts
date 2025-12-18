import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIGS, MESSAGES } from '../constants';
import { ResponseUtils } from '../utils';

export const generalRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIGS.GENERAL.windowMs,
  max: RATE_LIMIT_CONFIGS.GENERAL.max,
  message: ResponseUtils.error(MESSAGES.TOO_MANY_REQUESTS),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIGS.AUTH.windowMs,
  max: RATE_LIMIT_CONFIGS.AUTH.max,
  message: ResponseUtils.error(MESSAGES.TOO_MANY_REQUESTS),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

export const strictRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIGS.STRICT.windowMs,
  max: RATE_LIMIT_CONFIGS.STRICT.max,
  message: ResponseUtils.error(MESSAGES.TOO_MANY_REQUESTS),
  standardHeaders: true,
  legacyHeaders: false,
});