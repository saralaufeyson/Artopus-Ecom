import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ThemeToggle from './ThemeToggle';
import '../global.css';

function MainLayout() {
  return (
    <div className="main-layout">
      <ThemeToggle />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
