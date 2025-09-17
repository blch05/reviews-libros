import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthDto } from '@/modules/auth/auth.dto';

export async function POST(request: NextRequest) {
  console.log('🔥 Login endpoint called');
  
  try {
    const body = await request.json();
    console.log('📝 Login data received:', { 
      email: body.email, 
      hasPassword: !!body.password 
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
      email: user.email 
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
      error
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
