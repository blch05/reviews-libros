/**
 * Utilidades para manejo seguro de cookies del lado del cliente
 */

interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export class CookieUtils {
  /**
   * Establece una cookie en el navegador
   */
  static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === 'undefined') return;

    const {
      days = 7,
      path = '/',
      secure = window.location.protocol === 'https:',
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=${path}`;
    
    if (secure) {
      cookieString += '; secure';
    }
    
    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Obtiene el valor de una cookie
   */
  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Elimina una cookie
   */
  static deleteCookie(name: string, path: string = '/'): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  }

  /**
   * Verifica si las cookies están habilitadas
   */
  static areCookiesEnabled(): boolean {
    if (typeof window === 'undefined') return false;

    const testCookie = 'test_cookie';
    this.setCookie(testCookie, 'test', { days: 1 });
    const enabled = this.getCookie(testCookie) === 'test';
    if (enabled) {
      this.deleteCookie(testCookie);
    }
    return enabled;
  }

  /**
   * Obtiene todas las cookies como objeto
   */
  static getAllCookies(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}

/**
 * Hook para manejar cookies de autenticación
 */
export const useAuthCookies = () => {
  const AUTH_TOKEN_KEY = 'auth_token';
  const AUTH_USER_KEY = 'auth_user';

  const setAuthCookies = (token: string, user: any) => {
    // Guardar token por 7 días
    CookieUtils.setCookie(AUTH_TOKEN_KEY, token, { 
      days: 7, 
      secure: true, 
      sameSite: 'lax' 
    });
    
    // Guardar información básica del usuario por 7 días
    CookieUtils.setCookie(AUTH_USER_KEY, JSON.stringify(user), { 
      days: 7, 
      secure: true, 
      sameSite: 'lax' 
    });
  };

  const getAuthToken = (): string | null => {
    return CookieUtils.getCookie(AUTH_TOKEN_KEY);
  };

  const getAuthUser = (): any | null => {
    const userData = CookieUtils.getCookie(AUTH_USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  };

  const clearAuthCookies = () => {
    CookieUtils.deleteCookie(AUTH_TOKEN_KEY);
    CookieUtils.deleteCookie(AUTH_USER_KEY);
  };

  const hasValidAuthCookies = (): boolean => {
    const token = getAuthToken();
    const user = getAuthUser();
    return !!(token && user);
  };

  return {
    setAuthCookies,
    getAuthToken,
    getAuthUser,
    clearAuthCookies,
    hasValidAuthCookies
  };
};