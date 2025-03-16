import { Pill, WalletCards, Bot } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Pill className="text-2xl text-primary" size={28} />,
      title: "Find Alternatives",
      description: "Discover equivalent medications that contain the same active ingredients but cost less."
    },
    {
      icon: <WalletCards className="text-2xl text-cyan-500" size={28} />,
      title: "Compare Prices",
      description: "See prices from different pharmacies to find the most affordable option for your prescriptions."
    },
    {
      icon: <Bot className="text-2xl text-green-500" size={28} />,
      title: "AI Assistant",
      description: "Get personalized medication information and answers to your questions through our AI chatbot."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">How MediCompare Helps You</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Our platform makes finding medication alternatives and comparing prices easy, putting the power back in your hands.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className={`bg-${index === 0 ? 'primary' : index === 1 ? 'cyan-500' : 'green-500'}/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-sans">{feature.title}</h3>
              <p className="text-slate-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
