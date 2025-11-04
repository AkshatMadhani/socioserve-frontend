import React, { useState } from "react";
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🏢</span>
            <span className="text-white text-2xl font-bold">SocioServe</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-white hover:text-purple-200 transition duration-300 font-medium"
            >
              Features
            </a>
            <a 
              href="#roles" 
              className="text-white hover:text-purple-200 transition duration-300 font-medium"
            >
              How it Works
            </a>
            
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-white hover:bg-purple-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#roles"
              className="block px-3 py-2 text-white hover:bg-purple-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 text-white hover:bg-purple-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;