import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 데이터 파일 경로
const dataPath = path.join(process.cwd(), 'data', 'waitlist.json');

// 디렉토리 생성
if (!fs.existsSync(path.dirname(dataPath))) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}

// 초기 파일 생성
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 기존 데이터 읽기
    const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
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
    
    // 파일에 저장
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
    
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
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    // 최신순 정렬
    data.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}