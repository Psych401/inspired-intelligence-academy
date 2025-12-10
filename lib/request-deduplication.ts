/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate API calls by caching in-flight requests.
 * If multiple components request the same data simultaneously,
 * only one request is made and all callers receive the same result.
 */

type RequestKey = string;
type RequestPromise<T> = Promise<T>;

// Cache of in-flight requests
const inFlightRequests = new Map<RequestKey, RequestPromise<any>>();

/**
 * Deduplicates requests by caching in-flight promises.
 * If a request with the same key is already in flight, returns the existing promise.
 * Otherwise, executes the request function and caches it.
 * 
 * @param key - Unique identifier for the request (e.g., 'profile:userId123')
 * @param requestFn - Function that returns a promise with the request
 * @returns Promise that resolves with the request result
 */
export async function deduplicateRequest<T>(
  key: RequestKey,
  requestFn: () => RequestPromise<T>
): Promise<T> {
  // Check if request is already in flight
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  // Create new request and cache it
  const request = requestFn()
    .then((result) => {
      // Remove from cache on success
      inFlightRequests.delete(key);
      return result;
    })
    .catch((error) => {
      // Remove from cache on error
      inFlightRequests.delete(key);
      throw error;
    });

  inFlightRequests.set(key, request);
  return request;
}

/**
 * Clears a specific request from cache (useful for invalidation)
 */
export function clearRequestCache(key: RequestKey): void {
  inFlightRequests.delete(key);
}

/**
 * Clears all cached requests (useful for cleanup)
 */
export function clearAllRequestCache(): void {
  inFlightRequests.clear();
}

