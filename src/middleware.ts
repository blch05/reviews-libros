import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas protegidas
  const protectedPaths = ['/api/reviews', '/api/votes', '/api/favorites'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Verificar token en headers primero
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Si no hay token en headers, verificar cookies
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
      
      // Si encontramos token en cookies, agregarlo a los headers para las APIs
      if (token) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('authorization', `Bearer ${token}`);
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/reviews/:path*', '/api/votes/:path*', '/api/favorites/:path*']
};