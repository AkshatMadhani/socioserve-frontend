import React from "react";

const Features = () => {
  const features = [
    {
      icon: "📝",
      title: "Smart Complaints",
      description: "Register issues instantly and track their status in real-time. Get notified when your complaint is resolved.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📢",
      title: "Instant Updates",
      description: "Never miss important announcements. Stay informed about meetings, events, and society updates.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📊",
      title: "Visual Analytics",
      description: "Beautiful dashboards with real-time insights. Track payments, complaints, and community engagement.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "💳",
      title: "Easy Payments",
      description: "Upload payment proof with a click. No more waiting in queues or manual paperwork.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "🗳️",
      title: "Community Polls",
      description: "Voice your opinion! Vote on society decisions and see results in real-time with beautiful charts.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: "👥",
      title: "Better Together",
      description: "Foster community spirit with transparent operations and inclusive decision-making.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Everything You Need, All in One Place
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful features designed to make society management effortless and enjoyable
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 text-3xl transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                  <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

         </div>
    </section>
  );
};

export default Features;