export function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin"
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}