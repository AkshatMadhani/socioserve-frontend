import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Features from '../components/Features';
import RolesSection from '../components/Roles';
import Section from '../components/Section';
import Auth from '../components/Auth';

export default function Homepage() {
  const [authModal, setAuthModal] = useState({ isOpen: false, userType: '' });

  const openResidentAuth = () => setAuthModal({ isOpen: true, userType: 'Resident' });
  const openSecretaryAuth = () => setAuthModal({ isOpen: true, userType: 'Secretary' });
  const closeAuthModal = () => setAuthModal({ isOpen: false, userType: '' });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero onResidentClick={openResidentAuth} onSecretaryClick={openSecretaryAuth} />
      <Features />
      <RolesSection onResidentClick={openResidentAuth} onSecretaryClick={openSecretaryAuth} />
      <Section />
      <Footer />
      <Auth isOpen={authModal.isOpen} onClose={closeAuthModal} userType={authModal.userType} />
    </div>
  );
}
