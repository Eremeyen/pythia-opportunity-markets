import { Outlet } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import CategoryNav from "../components/CategoryNav";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-black">
        <div className="mx-auto max-w-screen-2x px-2 md:px-3 pt-2">
          <PageHeader />
          <CategoryNav />
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] pl-2 md:pl-4 pr-4 md:pr-6 pt-4">
        <Outlet />
      </main>
    </div>
  );
}
