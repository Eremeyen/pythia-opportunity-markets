import { Outlet } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import CategoryNav from "../components/CategoryNav";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-black">
        <div className="mx-auto max-w-screen-2xl px-3 md:px-6 pt-2">
          <PageHeader />
          <CategoryNav />
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-3 md:px-20 pt-4 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
