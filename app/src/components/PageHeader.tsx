import logo from "../assets/black_pythia_logo.png";
import AnimatedTitle from "./AnimatedTitle";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";

export default function PageHeader() {
  // THINK WE ARE SUPPOSED TO CHECK FOR !ready IN ALL UI COMPONENTS
  const { ready, authenticated, logout, login } = usePrivy();

  return (
    <header className="flex items-center justify-between py-3">
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
        <h1 className="text-black text-2xl md:text-4xl lg:text-4xl font-extrabold tracking-tight">
          <AnimatedTitle
            full="Pythia's Opportunity Markets"
            short="Pythia"
            oncePerSession={import.meta.env.PROD}
          />
        </h1>
      </Link>
      {ready && (authenticated ? (
        <button
          type="button"
          className="px-10 py-3 rounded-2xl bg-white text-black text-xl font-extrabold border-4 border-black shadow-sm hover:bg-neutral-100 transition-colors"
          onClick={logout}
        >
          Logout
        </button>
      ) : (
        <button
          type="button"
          className="px-10 py-3 rounded-2xl bg-white text-black text-xl font-extrabold border-4 border-black shadow-sm hover:bg-neutral-100 transition-colors"
          onClick={login}
        >
          Authenticate
        </button>
      ))}
    </header>
  );
}
