import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-3xl">🏢</span>
          <span className="text-2xl font-bold">SocioServe</span>
        </div>
        <p className="text-gray-400 mb-4">
          Smart Society Management Platform
        </p>
        <p className="text-gray-500 text-sm">
          © 2025 SocioServe. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
