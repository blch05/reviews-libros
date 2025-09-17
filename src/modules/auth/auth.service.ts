import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongoose';
import User from './User.model';
import { AuthUser, LoginRequest, RegisterRequest, TokenPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  // Connect to database
  private static async connectDB() {
    console.log('🔌 AuthService.connectDB called');
    try {
      await connectDB();
      console.log('✅ Mongoose connected successfully');
    } catch (error) {
      console.error('💥 Mongoose connection failed:', error);
      throw error;
    }
  }

  // Generate JWT token
  static generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        userId: user._id, 
        email: user.email 
      },
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN 
      } as jwt.SignOptions
    );
  }

  // Verify JWT token
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<{ user: AuthUser; token: string }> {
    console.log('🔄 AuthService.register called for:', userData.email);
    
    try {
      console.log('🔌 Connecting to database...');
      await this.connectDB();
      console.log('✅ Database connected');

      // Check if user already exists
      console.log('🔍 Checking if user exists...');
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log('❌ User already exists');
        throw new Error('User already exists with this email');
      }
      console.log('✅ User does not exist, proceeding...');

      // Create new user
      console.log('📝 Creating new user...');
      const user = new User({
        email: userData.email,
        name: userData.name,
        password: userData.password
      });

      console.log('💾 Saving user to database...');
      await user.save();
      console.log('✅ User saved with ID:', user._id);

      // Convert to AuthUser (without password)
      const authUser: AuthUser = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name
      };

      // Generate token
      console.log('🎫 Generating JWT token...');
      const token = this.generateToken(authUser);
      console.log('✅ JWT token generated');

      return { user: authUser, token };

    } catch (error) {
      console.error('💥 AuthService.register error:', error);
      throw error;
    }
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<{ user: AuthUser; token: string }> {
    console.log('🔄 AuthService.login called for:', credentials.email);
    
    try {
      console.log('🔌 Connecting to database...');
      await this.connectDB();
      console.log('✅ Database connected');

      // Find user by email
      console.log('🔍 Looking for user by email...');
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        console.log('❌ User not found');
        throw new Error('Invalid email or password');
      }
      console.log('✅ User found:', { id: user._id, email: user.email });

      // Check password
      console.log('🔐 Validating password...');
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        console.log('❌ Password invalid');
        throw new Error('Invalid email or password');
      }
      console.log('✅ Password valid');

      // Convert to AuthUser (without password)
      const authUser: AuthUser = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name
      };

      // Generate token
      console.log('🎫 Generating JWT token...');
      const token = this.generateToken(authUser);
      console.log('✅ JWT token generated');

      return { user: authUser, token };

    } catch (error) {
      console.error('💥 AuthService.login error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    console.log('🔍 getUserById called with ID:', userId);
    
    try {
      await this.connectDB();
      console.log('✅ Database connected for getUserById');

      console.log('🔍 Finding user by ID:', userId);
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found in database');
        return null;
      }

      console.log('✅ User found:', { id: user._id, email: user.email, name: user.name });
      return {
        _id: user._id.toString(),
        email: user.email,
        name: user.name
      };
    } catch (error) {
      console.error('💥 Error in getUserById:', error);
      return null;
    }
  }

  // Validate user session
  static async validateSession(token: string): Promise<AuthUser | null> {
    console.log('🧪 validateSession called with token:', token.substring(0, 20) + '...');
    
    // Handle mock tokens for testing
    if (token.startsWith('mock-token-')) {
      console.log('🧪 Mock token detected, returning mock user');
      return {
        _id: '1',
        email: 'test@example.com',
        name: 'Test User'
      } as AuthUser;
    }

    console.log('🔐 Not a mock token, proceeding with JWT validation');
    const payload = this.verifyToken(token);
    console.log('🔐 JWT verification result:', payload ? 'Valid' : 'Invalid');
    
    if (!payload) {
      console.log('❌ JWT payload is null, session invalid');
      return null;
    }

    console.log('🔐 JWT payload:', { userId: payload.userId, exp: payload.exp });
    
    const user = await this.getUserById(payload.userId);
    console.log('👤 getUserById result:', user ? `Found user: ${user.name}` : 'User not found');
    
    return user;
  }

  // Update user profile
  static async updateUserProfile(userId: string, updateData: { name?: string; email?: string }): Promise<AuthUser> {
    console.log('🔄 AuthService.updateUserProfile called for:', userId);
    
    try {
      console.log('🔌 Connecting to database...');
      await this.connectDB();
      console.log('✅ Database connected');

      // Find and update user
      console.log('🔍 Finding and updating user...');
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: {
            ...(updateData.name && { name: updateData.name }),
            ...(updateData.email && { email: updateData.email }),
            updatedAt: new Date()
          }
        },
        { 
          new: true, // Return updated document
          runValidators: true // Run model validations
        }
      ).select('-password');

      if (!user) {
        console.log('❌ User not found');
        throw new Error('Usuario no encontrado');
      }

      console.log('✅ User updated successfully:', { id: user._id, name: user.name, email: user.email });

      // Convert to AuthUser
      const authUser: AuthUser = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name
      };

      return authUser;

    } catch (error) {
      console.error('💥 AuthService.updateUserProfile error:', error);
      throw error;
    }
  }
}
