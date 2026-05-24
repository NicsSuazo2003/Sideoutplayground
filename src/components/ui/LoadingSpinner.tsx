export function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-white/10 border-t-[#7CFC00] animate-spin"
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#7CFC00] animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}
