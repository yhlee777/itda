import { NextResponse } from 'next/server';

const API_KEY = process.env.JSONBIN_API_KEY!;
const BIN_ID = process.env.JSONBIN_BIN_ID!;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 기존 데이터 가져오기
    const getResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        headers: {
          'X-Access-Key': API_KEY
        }
      }
    );
    
    const binData = await getResponse.json();
    const existingData = binData.record || [];
    
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
    
    // 다시 저장
    await fetch(
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
    
    return NextResponse.json({ 
      success: true, 
      waitingNumber 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        headers: {
          'X-Access-Key': API_KEY
        }
      }
    );
    
    const data = await response.json();
    const waitlist = data.record || [];
    
    // 최신순 정렬
    waitlist.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(waitlist);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}