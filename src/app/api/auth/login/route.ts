import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthDto } from '@/modules/auth/auth.dto';

export async function POST(request: NextRequest) {
  console.log('🔥 Login endpoint called');
  
  try {
    // Verificar variables de entorno
    console.log('📊 Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      mongoUriLength: process.env.MONGODB_URI?.length || 0,
      nodeEnv: process.env.NODE_ENV
    });
    
    const body = await request.json();
    console.log('📝 Login data received:', { 
      email: body.email, 
      hasPassword: !!body.password,
      passwordLength: body.password?.length || 0,
      bodyKeys: Object.keys(body)
    });
    
    // Validate input
    console.log('🔍 Starting validation...');
    const validation = AuthDto.validateLogin(body);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Login user
    console.log('🔄 Attempting to login user...');
    const { user, token } = await AuthService.login(validation.data!);
    
    console.log('✅ Login successful:', { 
      id: user._id, 
      email: user.email,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user,
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    console.log('✅ Response created with cookie');
    return response;

  } catch (error) {
    console.error('💥 Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      error: error
    });
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 401 }
    );
  }
}
