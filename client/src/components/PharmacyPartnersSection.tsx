import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, Coins, Store, Users } from "lucide-react";

export default function PharmacyPartnersSection() {
  const [, setLocation] = useLocation();

  const goToMerchantSignup = () => {
    setLocation('/merchant-signup');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-white border-t border-b border-green-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">For Pharmacy Owners</h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto">
            Join our network of trusted pharmacies and grow your business with PharmAssist
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <Store className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expanded Reach</h3>
            <p className="text-slate-600">Connect with thousands of customers looking for medications in your area</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <Coins className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Increased Revenue</h3>
            <p className="text-slate-600">Boost your sales with our platform's digital presence and marketing</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <Building2 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
            <p className="text-slate-600">Simplify stock management with our easy-to-use digital tools</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customer Insights</h3>
            <p className="text-slate-600">Gain valuable data about customer preferences and medication trends</p>
          </div>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={goToMerchantSignup}
          >
            Register Your Pharmacy Now
          </Button>
          <p className="mt-4 text-slate-600 text-sm">
            Simple registration process, no technical knowledge required
          </p>
        </div>
      </div>
    </section>
  );
}