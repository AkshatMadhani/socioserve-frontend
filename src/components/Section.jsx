import React from 'react';
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const Section = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Society Management?
        </h2>
        <p className="text-xl mb-10 text-purple-100">
          Join hundreds of societies already using SocioServe to streamline operations and enhance resident satisfaction.
        </p>
        <button className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transition duration-300 transform hover:scale-105 shadow-xl inline-flex items-center"onClick={scrollToTop}>
          Get Started Today
          <span className="ml-2">→</span>
        </button>
      </div>
    </section>
  );
};

export default Section;
