import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { AuthService } from '@/modules/auth/auth.service';

export async function GET(request: NextRequest) {
  try {
    const userOrResponse = await AuthMiddleware.requireAuth(request);
    
    // If it's a NextResponse, it means authentication failed
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    // Authentication successful, return user data
    return NextResponse.json(
      {
        success: true,
        message: 'User authenticated',
        user: userOrResponse
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get user profile',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userOrResponse = await AuthMiddleware.requireAuth(request);
    
    // If it's a NextResponse, it means authentication failed
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    // Parse request body
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nombre y email son obligatorios',
        },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await AuthService.updateUserProfile(userOrResponse._id, {
      name: name.trim(),
      email: email.trim()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Perfil actualizado correctamente',
        user: updatedUser
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        {
          success: false,
          message: 'El email ya está en uso por otro usuario',
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar el perfil',
      },
      { status: 500 }
    );
  }
}
