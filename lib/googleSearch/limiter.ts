import pLimit from 'p-limit'

// Limit concurrent Google CSE calls to prevent rate limiting
export const limit = pLimit(5) 