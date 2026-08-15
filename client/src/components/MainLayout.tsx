import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 bg-background-light dark:bg-background-dark">
      <Navbar />
      <main className="flex-1 pt-16 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
