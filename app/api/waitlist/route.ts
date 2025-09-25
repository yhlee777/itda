import { NextResponse } from 'next/server';

// Google Sheets나 Supabase에 저장
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 여기에 실제 저장 로직
    // 1. Supabase
    // 2. Google Sheets API
    // 3. 또는 그냥 로컬 JSON 파일
    
    console.log('New waitlist signup:', body);
    
    // Fake 응답
    return NextResponse.json({ 
      success: true,
      position: Math.floor(Math.random() * 200) + 300 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}