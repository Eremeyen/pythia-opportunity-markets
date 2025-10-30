import { useState } from "react";

export type CreateMarketInput = {
  title: string;
  description?: string;
  liquidity: number;
  resolutionDateMs: number;
  resolutionCriteria: string;
  isPrivate: boolean;
};

export default function SponsorMarketForm({
  onCreate,
  onClose,
}: {
  onCreate: (input: CreateMarketInput) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liquidity, setLiquidity] = useState<number>(100);
  const [resolutionDate, setResolutionDate] = useState<string>("");
  const [criteria, setCriteria] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !resolutionDate || !criteria || !liquidity) return;
    onCreate({
      title,
      description: description || undefined,
      liquidity: Number(liquidity),
      resolutionDateMs: new Date(resolutionDate).getTime(),
      resolutionCriteria: criteria,
      isPrivate,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:backdrop-blur flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border-4 border-black p-4 md:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">Create Market</h3>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black hover:bg-neutral-100"
          >
            Close
          </button>
        </div>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-bold mb-1">Market name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-black"
              placeholder="e.g. Will we fund Orchard AI by Q3?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-black min-h-[80px]"
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
            <label className="block text-sm font-bold mb-1">Liquidity (SOL)</label>
              <input
                type="number"
                min={1}
                step={0.1}
                value={liquidity}
                onChange={(e) => setLiquidity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 border-black"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">Resolution date</label>
              <input
                type="date"
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-black"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Resolution criteria</label>
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-black min-h-[100px]"
              placeholder="Define clear criteria for YES/NO"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="private" type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            <label htmlFor="private" className="text-sm">Private (hide prices publicly)</label>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-black text-white font-extrabold border-4 border-black hover:opacity-90"
            >
              Create market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


