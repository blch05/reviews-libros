import { NextRequest, NextResponse } from 'next/server';

// Mock database for testing without MongoDB
const mockUsers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Register attempt with data:', body);
    
    // Basic validation
    const { email, password, name } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: ['All fields are required: email, password, name']
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: ['Password must be at least 6 characters long']
        },
        { status: 400 }
      );
    }

    // Simple email validation for testing
    if (!email.includes('@') || email.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: ['Please enter a valid email address']
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 409 }
      );
    }

    // Create mock user
    const newUser = {
      _id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Generate mock token
    const token = `mock-token-${Date.now()}`;

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully (MOCK MODE)',
        user: newUser,
        token
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    console.log('Mock registration successful for:', email);
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
