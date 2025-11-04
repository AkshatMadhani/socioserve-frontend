import React from 'react';

const RolesSection = ({ onResidentClick, onSecretaryClick }) => {
  const residentFeatures = ["Register and track complaints", "View announcements", "Check payments", "Monitor complaint status", "Pay bills online", "Access personal dashboard"];
  const secretaryFeatures = ["View & resolve complaints", "Create announcements", "Monitor statistics", "Manage resident accounts", "Track payments", "Admin dashboard access"];
  return (
    <section id="roles" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">Designed for Every Role</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div onClick={onResidentClick} className="bg-gradient-to-br from-blue-500 to-blue-700 p-10 rounded-3xl text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition duration-300 shadow-xl hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">👥</span>
                <h3 className="text-3xl font-bold">For Residents</h3>
              </div>
              <ul className="space-y-4">
                {residentFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-2xl mr-3 flex-shrink-0">✓</span>
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <span className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-bold">
                  Click to Access
                </span>
              </div>
            </div>
          </div>

          <div onClick={onSecretaryClick} className="bg-gradient-to-br from-purple-500 to-purple-700 p-10 rounded-3xl text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition duration-300 shadow-xl hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🛡️</span>
                <h3 className="text-3xl font-bold">For Secretary</h3>
              </div>
              <ul className="space-y-4">
                {secretaryFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-2xl mr-3 flex-shrink-0">✓</span>
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <span className="inline-block bg-white text-purple-600 px-6 py-2 rounded-full font-bold">
                  Click to Login
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RolesSection;
