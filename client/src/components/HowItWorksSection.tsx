import { ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Search Your Medication",
      description: "Simply enter the name of your prescription medication in our search bar."
    },
    {
      number: 2,
      title: "Compare Alternatives",
      description: "View generic alternatives and compare prices from different pharmacies."
    },
    {
      number: 3,
      title: "Save Money",
      description: "Choose the most affordable option and save on your prescription costs."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">How MediCompare Works</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Our process is simple, secure, and designed to help you save on medications
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 h-full">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3 font-sans">{step.title}</h3>
                <p className="text-slate-700">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="text-slate-300" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
