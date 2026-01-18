'use client';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">Welcome to Parasync</h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <a
            href="/auth"
            onClick={(e) => {
              e.preventDefault();
              const protocol = window.location.protocol;
              const hostname = window.location.hostname;
              const port = window.location.port;
              
              let url;
              if (hostname === 'localhost' || hostname === '127.0.0.1') {
                url = `${protocol}//biz.localhost${port ? `:${port}` : ''}/auth`;
              } else {
                const parts = hostname.split('.');
                const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
                url = `${protocol}//biz.${rootDomain}/auth`;
              }
              window.location.href = url;
            }}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            For Businesses
          </a>
          
          <a
            href="/auth"
            onClick={(e) => {
              e.preventDefault();
              const protocol = window.location.protocol;
              const hostname = window.location.hostname;
              const port = window.location.port;
              
              let url;
              if (hostname === 'localhost' || hostname === '127.0.0.1') {
                url = `${protocol}//app.localhost${port ? `:${port}` : ''}/auth`;
              } else {
                const parts = hostname.split('.');
                const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
                url = `${protocol}//app.${rootDomain}/auth`;
              }
              window.location.href = url;
            }}
            className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
          >
            Login/Signup
          </a>
        </div>
      </div>
    </div>
  );
}