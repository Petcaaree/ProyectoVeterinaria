import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import NavBar from '../../components/navBar/NavBar';
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
