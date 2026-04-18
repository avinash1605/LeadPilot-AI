import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090B] px-6 text-center">
      <div className="mesh-blob one left-10 top-10 h-80 w-80 bg-indigo-600/10" />
      <div className="mesh-blob two right-20 top-20 h-72 w-72 bg-purple-500/10" />
      <div className="mesh-blob three bottom-20 left-20 h-96 w-96 bg-blue-500/10" />
      <div className="mesh-blob four bottom-10 right-10 h-72 w-72 bg-indigo-400/10" />
      <div className="relative z-10">
        <p className="text-6xl font-bold text-zinc-800">404</p>
        <p className="mt-2 text-xl text-zinc-400">Page not found</p>
        <p className="mt-2 text-sm text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
