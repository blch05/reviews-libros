import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  console.log('🔧 Debug endpoint called');
  
  try {
    // Check environment variables
    const envStatus = {
      MONGODB_URI: {
        exists: !!process.env.MONGODB_URI,
        length: process.env.MONGODB_URI?.length || 0,
        preview: process.env.MONGODB_URI ? 
          `${process.env.MONGODB_URI.substring(0, 20)}...` : 
          'Not set'
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    };

    console.log('🔍 Environment status:', envStatus);

    // Test database connection
    let dbStatus = {
      connected: false,
      error: null as string | null,
      connectionString: 'Unknown'
    };

    try {
      console.log('🔄 Testing database connection...');
      const db = await connectToDatabase();
      dbStatus.connected = true;
      dbStatus.connectionString = db.connection.readyState === 1 ? 'Connected' : 'Disconnected';
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      dbStatus.error = dbError instanceof Error ? dbError.message : 'Unknown database error';
    }

    // Check request details
    const requestInfo = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      origin: request.headers.get('origin')
    };

    console.log('📡 Request info:', requestInfo);

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: dbStatus,
      request: requestInfo,
      status: 'Debug endpoint working'
    };

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('💥 Debug endpoint error:', error);
    
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}