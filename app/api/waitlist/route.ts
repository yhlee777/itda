import { NextResponse } from 'next/server';

// 새 Public BIN ID로 변경
const API_KEY = '$2a$10$DwuPZ/WzVA5oA4w1t9mG7uPPzHCjY/cg34y78RvqQKxqirGNnTh2u';
const BIN_ID = '68d62ebc43b1c97be9508078';  // ← 새 Public BIN!

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Public BIN 읽기 (API Key 없어도 됨)
    const getResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
    );
    
    let existingData = [];
    if (getResponse.ok) {
      const responseText = await getResponse.text();
      try {
        const responseData = JSON.parse(responseText);
        existingData = Array.isArray(responseData) ? responseData : [];
      } catch {
        existingData = [];
      }
    }
    
    // 대기번호 생성
    const waitingNumber = existingData.length + 300;
    
    const entry = {
      ...data,
      id: Date.now().toString(),
      waitingNumber,
      createdAt: new Date().toISOString()
    };
    
    // 데이터 추가
    existingData.push(entry);
    
    // 저장은 API Key 필요
    const putResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': API_KEY
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
    // Public BIN - API Key 없이 읽기
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
    );
    
    if (!response.ok) {
      return NextResponse.json([]);
    }
    
    const text = await response.text();
    let waitlist = [];
    
    try {
      const data = JSON.parse(text);
      waitlist = Array.isArray(data) ? data : [];
    } catch {
      waitlist = [];
    }
    
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