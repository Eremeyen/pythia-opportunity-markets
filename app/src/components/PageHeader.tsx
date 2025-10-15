export default function PageHeader() {
  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-xl md:text-2xl font-semibold">
        Pythia's Opportunity Markets
      </h1>
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
      >
        Log in
      </button>
    </header>
  );
}


