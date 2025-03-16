import React from "react";
import SearchSection from "./SearchSection";
import ChatInterface from "./ChatInterface";

export default function DemoSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">See How It Works</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Experience PharmAssist's intuitive interface and powerful features in action
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          {/* Updated to use the real search functionality */}
          <SearchSection />
        </div>
        
        {/* Chat Interface Preview */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-sans mb-4">Ask Our AI Pharmacist</h2>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto">
              Get personalized advice about medications, potential drug interactions, and more
            </p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </section>
  );
}
