import logo from "../assets/black_pythia_logo.png";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";

export default function PageHeader() {
  // THINK WE ARE SUPPOSED TO CHECK FOR !ready IN ALL UI COMPONENTS
  const { ready, authenticated, logout, login } = usePrivy();

  return (
    <header className="relative flex items-center justify-between py-3">
      <Link
        to="/"
        className="flex items-center gap-6 md:gap-8 no-underline hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white rounded-lg"
        aria-label="Go to home"
      >
        <div className="h-8 w-10 md:h-16 md:w-16 overflow-visible">
          <img
            src={logo}
            alt="Pythia logo"
            className="h-full w-full object-contain select-none origin-left scale-125 md:scale-150"
          />
        </div>
      </Link>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
        <h1 className="text-black text-3xl md:text-5xl lg:text-5xl font-semibold tracking-tight text-center">
          Pythia Markets
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/for-sponsors"
          className="text-sm italic text-[#0b1f3a] opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white"
          aria-label="Learn about sponsoring"
        >
          for sponsors
        </Link>
        {/* LINK TO PROFILE PAGE */}
        <Link
          to="/profile"
          aria-label="Profile"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-black bg-white flex items-center justify-center hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 md:w-7 md:h-7 text-black"
            aria-hidden
          >
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M4 20c1.5-3.5 5-6 8-6s6.5 2.5 8 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        <button
          type="button"
          className="px-10 py-3 rounded-2xl bg-white text-black text-xl font-extrabold border-4 border-black shadow-sm hover:bg-neutral-100 transition-colors"
          onClick={() => {
            if (!ready) {
              // @TODO: ADD TOAST
              console.warn("Privy not ready; ignoring auth click.");
              return;
            }
            if (authenticated) {
              logout();
            } else {
              login();
            }
          }}
          aria-disabled={!ready}
        >
          {authenticated ? "Logout" : "Authenticate"}
        </button>
      </div>
    </header>
  );
}
