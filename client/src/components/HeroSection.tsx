import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle } from "lucide-react";

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/dashboard?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary/10 to-cyan-500/10 pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-sans leading-tight mb-6">
              Find Affordable <span className="text-primary">Medicine Alternatives</span> in Seconds
            </h1>
            <p className="text-lg text-slate-700 mb-8">
              MediCompare helps you find more affordable alternatives to your prescriptions and compare prices from different pharmacies — all in one place.
            </p>
            <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-slate-500" size={20} />
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Search for a medicine (e.g., Lipitor, Advil, Insulin...)" 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="md:w-auto">
                  Search
                </Button>
              </form>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={20} />
                <span className="text-slate-700">Save up to 80% on prescriptions</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={20} />
                <span className="text-slate-700">100% free to use</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80" 
              alt="Doctor examining medicine information on a tablet" 
              className="rounded-xl shadow-xl w-full h-auto object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white p-5 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center mb-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <p className="ml-3 font-medium text-slate-900">Trusted by 10,000+ Patients</p>
              </div>
              <div className="flex">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center -ml-0">JD</div>
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center -ml-2">SM</div>
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center -ml-2">KL</div>
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center -ml-2">+7k</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
