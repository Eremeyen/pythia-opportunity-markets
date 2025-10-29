export default function ResolveDialog({
  title,
  onResolve,
  onClose,
}: {
  title: string;
  onResolve: (result: "YES" | "NO") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border-4 border-black p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#0b1f3a]">Resolve market</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0b1f3a] opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white"
          >
            ×
          </button>
        </div>
        <p className="mt-2 text-sm text-[#0b1f3a] opacity-80">{title}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onResolve("YES")}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold border-4 border-black hover:opacity-90"
          >
            Resolve YES
          </button>
          <button
            type="button"
            onClick={() => onResolve("NO")}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-extrabold border-4 border-black hover:opacity-90"
          >
            Resolve NO
          </button>
        </div>
      </div>
    </div>
  );
}


