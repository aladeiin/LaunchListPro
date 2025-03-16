import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const [, setLocation] = useLocation();

  const scrollToWaitlist = () => {
    document.getElementById('join-waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-cyan-500/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-6">Ready to Start Saving on Medications?</h2>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8">
          Join thousands of others who are taking control of their medication costs
        </p>
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg"
          onClick={scrollToWaitlist}
        >
          Join the Waitlist Now
        </Button>
        <p className="mt-6 text-slate-600">
          We're launching soon. Be the first to know!
        </p>
      </div>
    </section>
  );
}
