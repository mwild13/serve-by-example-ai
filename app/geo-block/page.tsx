import Link from 'next/link';

export default function GeoBlockPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="max-w-md text-center">
        {/* Logo placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SBE</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Expanding to Australia First
        </h1>

        {/* Message */}
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          Serve By Example is currently available to hospitality professionals in Australia. We&apos;re building our platform with the Australian market first and will announce availability in other regions soon.
        </p>

        {/* Optional CTA */}
        <p className="text-slate-400 text-sm mb-8">
          Thank you for your interest. We look forward to serving the hospitality community globally.
        </p>

        {/* Footer links */}
        <div className="flex gap-4 justify-center text-sm">
          <Link
            href="/privacy"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-500">•</span>
          <Link
            href="/terms"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
