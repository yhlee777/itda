'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdvertiserPage() {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  
  return (
    <main className="bg-white text-black min-h-screen">
      {/* Nav - 한글 중심 */}
      <nav className="fixed top-0 w-full z-50 p-6 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <div className="text-xl font-light tracking-wider">ITDA</div>
          </Link>
          <div className="flex gap-8 items-center">
            <Link href="#features" className="text-sm font-light hover:text-purple-600">
              주요 기능
            </Link>
            <Link href="#pricing" className="text-sm font-light hover:text-purple-600">
              가격 안내
            </Link>
            <Link href="#case-studies" className="text-sm font-light hover:text-purple-600">
              성공 사례
            </Link>
            <Link href="/register">
              <button className="text-sm font-medium bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all">
                무료로 시작하기
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - 한글 99% */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-purple-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-light mb-6 leading-tight">
            인플루언서 마케팅을<br/>
            <span className="text-purple-600 font-normal">가장 쉽고 확실하게</span>
          </h1>
          <p className="text-xl text-gray-700 font-light mb-12 leading-relaxed">
            복잡한 인플루언서 섭외는 그만.<br/>
            검증된 인플루언서와 24시간 내 매칭을 보장합니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all">
                지금 시작하기 (무료)
              </button>
            </Link>
            <Link href="#demo">
              <button className="px-8 py-4 border border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-all">
                데모 요청하기
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges - 한글 */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <span>이미 1,000개 기업이 신뢰합니다</span>
            <span className="text-gray-300">|</span>
            <span>월 평균 캠페인 5,000건</span>
            <span className="text-gray-300">|</span>
            <span>누적 거래액 500억원</span>
          </div>
        </div>
      </section>

      {/* Problems - 한글 100% */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            이런 문제로 고민하고 계신가요?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="text-3xl mb-4">😤</div>
              <h3 className="text-xl font-medium mb-3">섭외가 너무 어려워요</h3>
              <p className="text-gray-600 leading-relaxed">
                수십 명에게 연락해도 답장은 몇 명뿐. 
                일일이 연락하고 기다리는 시간이 너무 오래 걸립니다.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="text-3xl mb-4">🤔</div>
              <h3 className="text-xl font-medium mb-3">진짜 영향력을 모르겠어요</h3>
              <p className="text-gray-600 leading-relaxed">
                팔로워 수는 많은데 실제 구매 전환이 일어날지 의문. 
                가짜 팔로워인지 진짜인지 구분이 안 됩니다.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="text-3xl mb-4">💸</div>
              <h3 className="text-xl font-medium mb-3">에이전시 수수료가 부담돼요</h3>
              <p className="text-gray-600 leading-relaxed">
                에이전시 수수료 30-40%는 너무 비쌉니다. 
                직접 하자니 시간과 노력이 너무 많이 들어요.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution - 한글 중심 */}
      <section className="py-20 px-6 bg-purple-50" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-6">
            ITDA가 해결해드립니다
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            AI 기반 매칭 시스템으로 24시간 내 최적의 인플루언서를 찾아드립니다
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex gap-6"
            >
              <div className="text-purple-600 text-4xl flex-shrink-0">✨</div>
              <div>
                <h3 className="text-xl font-medium mb-3">자동 매칭 시스템</h3>
                <p className="text-gray-600 leading-relaxed">
                  캠페인을 등록하면 AI가 자동으로 최적의 인플루언서를 추천합니다. 
                  일일이 연락할 필요 없이 관심 있는 인플루언서가 직접 지원합니다.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex gap-6"
            >
              <div className="text-purple-600 text-4xl flex-shrink-0">🔍</div>
              <div>
                <h3 className="text-xl font-medium mb-3">팔로워 진위 검증</h3>
                <p className="text-gray-600 leading-relaxed">
                  독자 개발한 AI 알고리즘으로 가짜 팔로워를 94% 정확도로 걸러냅니다. 
                  실제 구매력 있는 팔로워만 보유한 인플루언서를 만나세요.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-6"
            >
              <div className="text-purple-600 text-4xl flex-shrink-0">📊</div>
              <div>
                <h3 className="text-xl font-medium mb-3">성과 예측 분석</h3>
                <p className="text-gray-600 leading-relaxed">
                  과거 캠페인 데이터를 기반으로 예상 도달률, 참여율, ROI를 
                  사전에 예측해드립니다. 확실한 성과를 미리 확인하세요.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-6"
            >
              <div className="text-purple-600 text-4xl flex-shrink-0">💳</div>
              <div>
                <h3 className="text-xl font-medium mb-3">투명한 가격 정책</h3>
                <p className="text-gray-600 leading-relaxed">
                  플랫폼 이용료 0원. 숨겨진 수수료 없이 인플루언서와 직접 거래하세요. 
                  안전한 에스크로 결제로 양측 모두를 보호합니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process - 한글 */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            간단한 4단계로 시작하세요
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: '캠페인 등록', desc: '목표와 예산을 입력하면 끝' },
              { step: 2, title: '인플루언서 지원', desc: '24시간 내 평균 50명 지원' },
              { step: 3, title: '선택 및 계약', desc: 'AI 추천을 참고해 선택' },
              { step: 4, title: '캠페인 진행', desc: '실시간 성과 모니터링' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-medium mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - 한글 */}
      <section className="py-20 px-6 bg-gray-50" id="pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            합리적인 가격으로 시작하세요
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: '스타터',
                price: '무료',
                desc: '작은 캠페인부터 시작',
                features: [
                  '월 3개 캠페인',
                  '기본 매칭 기능',
                  '이메일 지원'
                ]
              },
              {
                name: '그로스',
                price: '월 29만원',
                desc: '성장하는 브랜드를 위한',
                features: [
                  '무제한 캠페인',
                  'AI 추천 시스템',
                  '전담 매니저 지원',
                  '성과 분석 리포트'
                ],
                popular: true
              },
              {
                name: '엔터프라이즈',
                price: '맞춤 견적',
                desc: '대기업을 위한 솔루션',
                features: [
                  '모든 그로스 기능',
                  'API 연동',
                  '맞춤 개발',
                  '24시간 지원'
                ]
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="text-xs bg-white text-purple-600 px-3 py-1 rounded-full font-medium">
                    인기
                  </span>
                )}
                <h3 className="text-2xl font-medium mt-4 mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                  {plan.desc}
                </p>
                <div className="text-3xl font-light mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-full font-medium transition-all ${
                  plan.popular
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  시작하기
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies - 한글 */}
      <section className="py-20 px-6" id="case-studies">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            실제 성공 사례
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="text-purple-600 text-2xl mb-4">"</div>
              <p className="text-lg leading-relaxed mb-6">
                에이전시 대비 70% 비용 절감하면서도 
                더 좋은 성과를 얻었습니다. 24시간 만에 
                50명의 인플루언서가 지원했고, 그중 10명과 
                성공적인 캠페인을 진행했습니다.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium">김민수 마케팅팀장</div>
                  <div className="text-sm text-gray-600">A화장품 브랜드</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="text-purple-600 text-2xl mb-4">"</div>
              <p className="text-lg leading-relaxed mb-6">
                가짜 팔로워 필터링 기능이 정말 놀랍습니다. 
                이전에는 효과 없는 인플루언서에게 돈을 
                낭비했는데, 이제는 실제 구매력 있는 
                팔로워를 가진 인플루언서만 만납니다.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium">박지영 대표</div>
                  <div className="text-sm text-gray-600">B패션 스타트업</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA - 한글 */}
      <section className="py-20 px-6 bg-purple-600 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">
            지금 시작하고 차이를 경험하세요
          </h2>
          <p className="text-xl text-white/80 mb-12">
            복잡한 인플루언서 마케팅, ITDA와 함께라면 쉽습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition-all">
                무료로 시작하기
              </button>
            </Link>
            <button className="px-8 py-4 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all">
              상담 예약하기
            </button>
          </div>
          <p className="text-sm text-white/60 mt-8">
            신용카드 없이 무료로 시작 · 언제든 해지 가능
          </p>
        </motion.div>
      </section>

      {/* Footer - 한글 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-light mb-4">ITDA</div>
              <p className="text-sm text-gray-400">
                인플루언서 마케팅의<br/>
                새로운 기준
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">인플루언서 찾기</Link></li>
                <li><Link href="#" className="hover:text-white">캠페인 관리</Link></li>
                <li><Link href="#" className="hover:text-white">성과 분석</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">회사 소개</Link></li>
                <li><Link href="#" className="hover:text-white">채용</Link></li>
                <li><Link href="#" className="hover:text-white">블로그</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">지원</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">고객센터</Link></li>
                <li><Link href="#" className="hover:text-white">이용약관</Link></li>
                <li><Link href="#" className="hover:text-white">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 ITDA. All rights reserved. | 사업자등록번호: 123-45-67890
          </div>
        </div>
      </footer>
    </main>
  );
}