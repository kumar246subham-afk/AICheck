import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MouseFollowLight from '../components/MouseFollowLight';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col justify-between relative selection:bg-cyber-blue selection:text-midnight-950">
      <MouseFollowLight />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
