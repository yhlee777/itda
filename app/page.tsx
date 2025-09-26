// app/page.tsx
'use client';
const HomePage = require('./HomePage').default;  // CommonJS로 시도

export default function Page() {
  return <HomePage />;
}