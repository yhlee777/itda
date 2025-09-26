import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('./HomePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )
});

export default function Page() {
  return <HomePage />;
}