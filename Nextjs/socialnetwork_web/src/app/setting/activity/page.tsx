export default function ActivityPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-grey/5 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-grey/10 text-center">
        <h1 className="text-3xl font-extrabold text-grey-hover capitalize mb-4">
          setting &gt; activity
        </h1>
        <p className="text-grey-hover mb-6">
          This page is currently under construction. Please check back later!
        </p>
        <a 
          href="/home" 
          className="inline-block bg-blue hover:bg-blue-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}
