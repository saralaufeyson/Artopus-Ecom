import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ThemeToggle from './ThemeToggle';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ThemeToggle />
      <Navbar />
      <main className="flex-1 pt-16 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
