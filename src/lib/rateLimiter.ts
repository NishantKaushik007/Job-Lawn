// src/lib/rateLimiter.ts
type RateLimitRecord = {
    count: number;
    lastRequest: number;
  };
  
  const requests: Record<string, RateLimitRecord> = {};
  const WINDOW_SIZE = 60 * 1000; // 60 seconds window
  const MAX_REQUESTS = 30; // Maximum 30 requests per window
  
  export function rateLimit(ip: string): boolean {
    const currentTime = Date.now();
    const record = requests[ip];
  
    if (record) {
      // If the window has passed, reset the record.
      if (currentTime - record.lastRequest > WINDOW_SIZE) {
        requests[ip] = { count: 1, lastRequest: currentTime };
        return true;
      }
  
      // Otherwise, increment the count.
      record.count++;
      if (record.count > MAX_REQUESTS) {
        return false;
      }
      record.lastRequest = currentTime;
      return true;
    } else {
      // First request from this IP.
      requests[ip] = { count: 1, lastRequest: currentTime };
      return true;
    }
  }
  