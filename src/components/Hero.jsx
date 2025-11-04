import React from 'react';
import { Users, Shield, ArrowRight, Zap, Heart, TrendingUp } from 'lucide-react';

const Hero = ({ onResidentClick, onSecretaryClick }) => {
  return (
    <section className="pt-24 pb-20 px-4 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 bg-white rounded-full -top-20 -left-20 blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white rounded-full -bottom-20 -right-20 blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Transform Your Society <span className="text-yellow-300">Today</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto leading-relaxed">
          Complete transparency. Real-time updates. Total control. 
          <span className="font-semibold text-yellow-200"> Society management the way it should be.</span> 🌟
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div 
            onClick={onResidentClick}
            className="group bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-8 cursor-pointer hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500 group-hover:bg-blue-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Users size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm a Resident</h3>
              <p className="text-white/80 group-hover:text-purple-600 mb-4 text-center">
                Register complaints, pay bills, vote on polls, and stay connected with your community
              </p>
              <button className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all">
                Get Started
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div 
            onClick={onSecretaryClick}
            className="group bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-8 cursor-pointer hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-purple-500 group-hover:bg-purple-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Shield size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm a Secretary</h3>
              <p className="text-white/80 group-hover:text-purple-600 mb-4 text-center">
                Manage complaints, create announcements, verify bills, and conduct community polls
              </p>
              <button className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all">
                Admin Login
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;