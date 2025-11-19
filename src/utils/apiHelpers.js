/**
 * Utility functions untuk mapping data antara frontend (camelCase) dan backend (snake_case)
 */

/**
 * Convert snake_case ke camelCase
 * @param {string} str - String dalam snake_case
 * @returns {string} - String dalam camelCase
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase ke snake_case
 * @param {string} str - String dalam camelCase
 * @returns {string} - String dalam snake_case
 */
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert object keys dari snake_case ke camelCase
 * @param {Object} obj - Object dengan keys snake_case
 * @returns {Object} - Object dengan keys camelCase
 */
export function keysToCamel(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    acc[camelKey] = keysToCamel(obj[key]);
    return acc;
  }, {});
}

/**
 * Convert object keys dari camelCase ke snake_case
 * @param {Object} obj - Object dengan keys camelCase
 * @returns {Object} - Object dengan keys snake_case
 */
export function keysToSnake(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    acc[snakeKey] = keysToSnake(obj[key]);
    return acc;
  }, {});
}

/**
 * Map backend response (snake_case) ke frontend format
 * @param {Object} data - Data dari backend
 * @returns {Object} - Data untuk frontend
 */
export function mapBackendResponse(data) {
  if (!data) return data;

  // Convert keys to camelCase
  const camelData = keysToCamel(data);

  // Keep original data for reference
  if (typeof camelData === "object" && !Array.isArray(camelData)) {
    camelData._original = data;
  }

  return camelData;
}

/**
 * Map frontend data ke backend format (snake_case)
 * @param {Object} data - Data dari frontend
 * @returns {Object} - Data untuk backend
 */
export function mapBackendRequest(data) {
  if (!data) return data;

  // Remove internal properties
  const cleaned = { ...data };
  delete cleaned._original;

  // Convert keys to snake_case
  return keysToSnake(cleaned);
}

/**
 * Handle API errors dan logout jika token expired
 * @param {Response} response - Fetch response
 * @param {Function} logoutCallback - Function untuk logout
 * @returns {Promise} - Promise dengan error handling
 */
export async function handleApiResponse(response, logoutCallback = null) {
  if (response.status === 401) {
    // Token expired atau invalid
    if (logoutCallback && typeof logoutCallback === "function") {
      logoutCallback();
    } else {
      // Clear localStorage
      localStorage.removeItem("currentUser");
      // Redirect to login
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `HTTP Error ${response.status}`);
  }

  return data;
}

/**
 * Get authorization header dengan token
 * @returns {Object} - Authorization header
 */
export function getAuthHeader() {
  try {
    const current = JSON.parse(localStorage.getItem("currentUser") || "null");
    const token = current?.token || current?.authToken || null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Get current user token
 * @returns {string|null} - JWT token
 */
export function getCurrentToken() {
  try {
    const current = JSON.parse(localStorage.getItem("currentUser") || "null");
    return current?.token || current?.authToken || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has valid token
 */
export function isAuthenticated() {
  return !!getCurrentToken();
}

/**
 * Check if user is admin
 * @returns {boolean} - True if user has admin role
 */
export function isAdmin() {
  try {
    const current = JSON.parse(localStorage.getItem("currentUser") || "null");
    return current?.role === "admin";
  } catch {
    return false;
  }
}
