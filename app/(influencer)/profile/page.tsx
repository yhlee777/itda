'use client';

export default function ProfilePage() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            K
          </div>
          <h2 className="text-2xl font-bold text-gray-900">김인플루언서</h2>
          <p className="text-gray-500">@kiminfluencer</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">15.2K</div>
            <div className="text-sm text-gray-500">팔로워</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-500">캠페인</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.9</div>
            <div className="text-sm text-gray-500">평점</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button className="w-full p-4 bg-white border rounded-xl text-left hover:bg-gray-50">
            <span className="font-medium">정산 관리</span>
            <span className="float-right text-gray-400">›</span>
          </button>
          <button className="w-full p-4 bg-white border rounded-xl text-left hover:bg-gray-50">
            <span className="font-medium">설정</span>
            <span className="float-right text-gray-400">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
