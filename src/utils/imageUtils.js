import { BACKEND_BASE_URL } from '../services/api';

/**
 * Converts a relative image path to a full URL
 * @param {string} relativePath - Relative path like "/images/gallery/user123/image.jpg"
 * @returns {string} Full URL or empty string if path is invalid
 */
export const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // If already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Ensure path starts with / for proper URL construction
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  // Use BACKEND_BASE_URL from api.js which handles the base URL correctly
  const baseUrl = BACKEND_BASE_URL.replace('/api', ''); // Remove /api if present
  return `${baseUrl}${cleanPath}`;
};

/**
 * Gets profile picture URL with fallback
 */
export const getProfilePictureUrl = (profilePictureUrl) => {
  if (!profilePictureUrl) {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  return getImageUrl(profilePictureUrl);
};

