import { NextRequest, NextResponse } from 'next/server';

// Mock database for testing without MongoDB
const mockUsers = [
  {
    _id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123' // In real app this would be hashed
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Login attempt with data:', body);
    
    // Basic validation
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: ['Email and password are required']
        },
        { status: 400 }
      );
    }

    // Find user (mock)
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    // Generate mock token
    const token = `mock-token-${Date.now()}`;

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful (MOCK MODE)',
        user: userWithoutPassword,
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

    console.log('Mock login successful for:', email);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
