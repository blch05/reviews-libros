import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthUser } from '@/types';

// Extend NextRequest to include user
declare module 'next/server' {
  interface NextRequest {
    user?: AuthUser;
  }
}

export class AuthMiddleware {
  // Extract token from request
  static extractToken(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return token;
    }

    // Try cookie as fallback
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    return cookieToken || null;
  }

  // Middleware to require authentication
  static async requireAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
    const token = this.extractToken(request);

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access denied. No token provided.' 
        },
        { status: 401 }
      );
    }

    try {
      const user = await AuthService.validateSession(token);
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid or expired token.' 
          },
          { status: 401 }
        );
      }

      return user;
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token validation failed.' 
        },
        { status: 401 }
      );
    }
  }

  // Optional authentication (for routes that work with or without auth)
  static async optionalAuth(request: NextRequest): Promise<AuthUser | null> {
    const token = this.extractToken(request);

    if (!token) {
      return null;
    }

    try {
      const user = await AuthService.validateSession(token);
      return user;
    } catch (error) {
      console.error('optionalAuth error:', error);
      return null;
    }
  }
}

// Helper function for easier imports
export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const result = await AuthMiddleware.optionalAuth(request);
    return result;
  } catch (error) {
    console.error('verifyToken error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
  return AuthMiddleware.requireAuth(request);
}
