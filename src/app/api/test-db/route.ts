import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import User from '../../../modules/auth/User.model';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test connection
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    const userCount = await User.countDocuments();
    console.log('👥 User count:', userCount);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        connected: true,
        userCount,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
