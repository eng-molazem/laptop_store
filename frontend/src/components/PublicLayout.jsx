import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomFloatingNav from './BottomFloatingNav';
import WhatsAppFloatButton from './WhatsAppFloatButton';
import CompareBar from './CompareBar';

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <WhatsAppFloatButton />
      <BottomFloatingNav />
    </div>
  );
}
