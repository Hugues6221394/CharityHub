import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Simple JWT decoder (base64url decode)
 */
const decodeJWT = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        // Decode the payload (second part)
        const payload = parts[1];
        // Replace URL-safe base64 characters
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
        const decoded = atob(padded);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

/**
 * Hook to check user permissions from JWT token claims
 * Returns permission checking functions and user's permissions list
 */
export const usePermissions = () => {
    const { user } = useAuth();

    const permissions = useMemo(() => {
        if (!user) return [];

        try {
            const token = localStorage.getItem('token');
            if (!token) return [];

            const decoded = decodeJWT(token);
            if (!decoded) return [];

            // Extract permission claims from JWT
            // ASP.NET Core Identity stores claims with their Type as the key
            // Permission claims have Type="permission" and Value=<permission string>
            // When multiple claims share the same type, JWT may store them as an array
            const permissionClaims = [];
            
            // Check for 'permission' key (standard claim type)
            if (decoded['permission']) {
                const perms = decoded['permission'];
                if (Array.isArray(perms)) {
                    permissionClaims.push(...perms);
                } else if (typeof perms === 'string') {
                    permissionClaims.push(perms);
                }
            }
            
            // Check for full claim type URI format
            const claimUri = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/permission';
            if (decoded[claimUri]) {
                const perms = decoded[claimUri];
                if (Array.isArray(perms)) {
                    permissionClaims.push(...perms);
                } else if (typeof perms === 'string') {
                    permissionClaims.push(perms);
                }
            }
            
            // ASP.NET Core JWT may also store claims in a nested structure
            // Check for 'claims' array or iterate all keys looking for permission values
            if (decoded['claims'] && Array.isArray(decoded['claims'])) {
                decoded['claims'].forEach(claim => {
                    if (claim.type === 'permission' && claim.value) {
                        permissionClaims.push(claim.value);
                    }
                });
            }
            
            // Also check all keys that might contain permission values
            // Some JWT libraries flatten claims differently
            Object.keys(decoded).forEach(key => {
                if (key.toLowerCase().includes('permission')) {
                    const value = decoded[key];
                    if (Array.isArray(value)) {
                        permissionClaims.push(...value);
                    } else if (typeof value === 'string' && value.startsWith('permissions.') || value.startsWith('users.') || value.startsWith('students.') || value.startsWith('donations.') || value.startsWith('progress.') || value.startsWith('reports.') || value.startsWith('messages.') || value.startsWith('notifications.')) {
                        permissionClaims.push(value);
                    }
                }
            });
            
            return [...new Set(permissionClaims)]; // Remove duplicates
        } catch (error) {
            console.error('Error extracting permissions:', error);
            return [];
        }
    }, [user]);

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(perm => permissions.includes(perm));
    };

    const hasAllPermissions = (permissionList) => {
        return permissionList.every(perm => permissions.includes(perm));
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};

