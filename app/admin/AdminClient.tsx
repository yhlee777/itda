'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminClient() {
  const [signups, setSignups] = useState<any[]>([]);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 체크
  const checkPassword = () => {
    if (password === '1234') {
      setIsAuthorized(true);
      loadData();
    } else {
      alert('비밀번호가 틀렸습니다');
    }
  };

  // 데이터 로드 함수
  const loadData = () => {
    setIsLoading(true);
    const data = localStorage.getItem('waitlistData');
    console.log('Loading data from localStorage:', data);
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log('Parsed data count:', parsedData.length);
        setSignups(parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
        setSignups([]);
      }
    } else {
      console.log('No data found in localStorage');
      setSignups([]);
    }
    setIsLoading(false);
  };

  // 페이지 로드시 & 인증 상태 변경시 데이터 로드
  useEffect(() => {
    if (isAuthorized) {
      loadData();
      
      const handleStorageChange = () => {
        loadData();
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isAuthorized]);

  // CSV 다운로드
  const downloadCSV = () => {
    if (signups.length === 0) {
      alert('다운로드할 데이터가 없습니다');
      return;
    }
    
    const headers = ['ID', '인스타그램', '이메일', '팔로워', '카테고리', '가입일시', '대기번호'];
    const rows = signups.map(s => [
      s.id || '',
      s.instagram || '',
      s.email || '',
      s.followers || '',
      s.category || '',
      s.createdAt ? new Date(s.createdAt).toLocaleString('ko-KR') : '',
      s.waitingNumber || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `waitlist_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 데이터 삭제
  const clearData = () => {
    if (confirm('정말 모든 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('waitlistData');
      setSignups([]);
      alert('데이터가 삭제되었습니다');
    }
  };

  // 새로고침
  const refreshData = () => {
    loadData();
  };

  // 로그인 화면
  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 w-96">
          <h1 className="text-2xl text-white mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="비밀번호 (1234)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
            className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 mb-4 outline-none focus:bg-white/20"
            autoFocus
          />
          <button
            onClick={checkPassword}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  // 카테고리별 통계 계산
  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    signups.forEach(s => {
      if (s.category && typeof s.category === 'string') {
        stats[s.category] = (stats[s.category] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  };
  
  const topCategory = getCategoryStats();

  // 오늘 가입자
  const todaySignups = signups.filter(s => {
    if (!s.createdAt) return false;
    return new Date(s.createdAt).toDateString() === new Date().toDateString();
  });

  // 평균 대기번호
  const avgWaitingNumber = signups.length > 0 
    ? Math.round(signups.reduce((acc, s) => acc + (s.waitingNumber || 0), 0) / signups.length)
    : 0;

  // 관리자 대시보드
  return (
    <main className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">대기리스트 관리</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? '로딩중...' : '🔄 새로고침'}
            </button>
            <Link href="/">
              <button className="px-4 py-2 text-white/60 hover:text-white transition">
                ← 메인으로
              </button>
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-white/60 text-sm mb-2">총 가입자</p>
            <p className="text-4xl text-white font-bold">{signups.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-white/60 text-sm mb-2">오늘 가입</p>
            <p className="text-4xl text-white font-bold">{todaySignups.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-white/60 text-sm mb-2">평균 대기번호</p>
            <p className="text-4xl text-white font-bold">{avgWaitingNumber}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-white/60 text-sm mb-2">인기 카테고리</p>
            <p className="text-4xl text-white font-bold">
              {topCategory ? topCategory[0] : '-'}
            </p>
            {topCategory && (
              <p className="text-sm text-white/40 mt-1">
                {topCategory[1]}명
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={downloadCSV}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={signups.length === 0}
          >
            📥 CSV 다운로드 ({signups.length}개)
          </button>
          <button
            onClick={clearData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={signups.length === 0}
          >
            🗑️ 데이터 초기화
          </button>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/10">
            <p className="text-white">
              {isLoading ? '데이터 로딩중...' : `총 ${signups.length}개의 데이터가 있습니다.`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-white/60 text-left">
                  <th className="p-4">#</th>
                  <th className="p-4">인스타그램</th>
                  <th className="p-4">이메일</th>
                  <th className="p-4">팔로워</th>
                  <th className="p-4">카테고리</th>
                  <th className="p-4">가입일시</th>
                  <th className="p-4">대기번호</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/40">
                      로딩중...
                    </td>
                  </tr>
                ) : signups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/40">
                      <div className="space-y-2">
                        <p className="text-lg">아직 가입자가 없습니다</p>
                        <p className="text-sm">Waitlist 페이지에서 등록하면 여기에 표시됩니다</p>
                        <Link href="/demo">
                          <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                            데모 페이지로 이동
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...signups].reverse().map((signup, i) => (
                    <tr key={signup.id || i} className="text-white border-t border-white/10 hover:bg-white/5 transition">
                      <td className="p-4">{signups.length - i}</td>
                      <td className="p-4">
                        <span className="text-purple-400">@{signup.instagram || '-'}</span>
                      </td>
                      <td className="p-4">{signup.email || '-'}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm">
                          {signup.followers || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                          {signup.category || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {signup.createdAt 
                          ? new Date(signup.createdAt).toLocaleString('ko-KR')
                          : '-'}
                      </td>
                      <td className="p-4">
                        <span className="text-orange-400 font-bold">
                          #{signup.waitingNumber || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 디버그 정보 */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <details className="cursor-pointer">
            <summary className="text-white/40 text-sm">Debug Info (클릭하여 확장)</summary>
            <div className="mt-2 space-y-1 text-white/30 text-xs">
              <p>localStorage key: 'waitlistData'</p>
              <p>Data count: {signups.length}</p>
              <p>Last refresh: {new Date().toLocaleTimeString('ko-KR')}</p>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}