import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Since this is a stateless API, we simply return a success message
    // In a real session-based auth system, this would clear server-side sessions
    // or invalidate tokens, but for stateless JWT-based systems, 
    // the client handles token removal
    
    return NextResponse.json({ 
      message: 'Logout successful',
      success: true 
    }, { status: 200 });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}