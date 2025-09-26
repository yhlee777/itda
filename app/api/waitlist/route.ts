import { NextResponse } from 'next/server';

// 새 Master Key로 변경!
const API_KEY = '$2a$10$hTuLbmbZgz8yvl9vap7D.uFaHHByN1k1luT3KtAH8hzXx.HUuhk9C';
const BIN_ID = '68d62ebc43b1c97be9508078';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Public BIN - 읽기는 Key 없이
    const getResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
    );
    
    let existingData = [];
    if (getResponse.ok) {
      const responseData = await getResponse.json();
      existingData = responseData.record || [];
    }
    
    // 대기번호 생성
    const waitingNumber = existingData.length + 300;
    
    const entry = {
      ...data,
      id: Date.now().toString(),
      waitingNumber,
      createdAt: new Date().toISOString()
    };
    
    existingData.push(entry);
    
    // 저장 - Master Key 사용!
    const putResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY  // Master Key!
        },
        body: JSON.stringify(existingData)
      }
    );
    
    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      console.error('저장 실패:', errorText);
      throw new Error('저장 실패');
    }
    
    return NextResponse.json({ 
      success: true, 
      waitingNumber 
    });
  } catch (error: any) {
    console.error('에러:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Public BIN - Key 없이 읽기
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
    );
    
    if (!response.ok) {
      return NextResponse.json([]);
    }
    
    const data = await response.json();
    const waitlist = data.record || [];
    
    // 최신순 정렬
    waitlist.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(waitlist);
  } catch (error) {
    console.error('GET 에러:', error);
    return NextResponse.json([]);
  }
}