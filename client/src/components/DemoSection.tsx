import { useState } from "react";
import MedicineCard from "./MedicineCard";
import AlternativeCard from "./AlternativeCard";
import ChatInterface from "./ChatInterface";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function DemoSection() {
  const [priceRange, setPriceRange] = useState([75]);
  
  const manufacturers = [
    { id: "manufacturer1", label: "Pfizer", checked: false },
    { id: "manufacturer2", label: "Johnson & Johnson", checked: false },
    { id: "manufacturer3", label: "Bayer", checked: false }
  ];

  const medicineTypes = [
    { id: "type1", label: "Generic", checked: false },
    { id: "type2", label: "Brand Name", checked: false }
  ];

  const originalMedicine = {
    id: 1,
    name: "Lipitor",
    genericName: "Atorvastatin",
    description: "Lipitor is a statin medication used to treat high cholesterol and to lower the risk of stroke, heart attack, and other heart complications.",
    manufacturer: "Pfizer",
    isGeneric: false,
    price: 165.99,
    dosage: "10mg, 30 tablets",
    activeIngredient: "Atorvastatin Calcium",
    imageUrl: "",
    availableAt: ["CVS", "Walgreens", "Rite Aid"]
  };

  const alternatives = [
    {
      id: 2,
      name: "Atorvastatin Calcium",
      genericName: "Atorvastatin",
      description: "Generic version of Lipitor used to treat high cholesterol and to lower the risk of stroke, heart attack, and other heart complications.",
      manufacturer: "Various",
      isGeneric: true,
      price: 14.99,
      dosage: "10mg, 30 tablets",
      activeIngredient: "Atorvastatin Calcium",
      imageUrl: "",
      availableAt: ["Walgreens", "CVS", "Walmart Pharmacy"],
      savingsPercentage: 91
    },
    {
      id: 3,
      name: "Crestor",
      genericName: "Rosuvastatin",
      description: "Crestor is a statin medication used to treat high cholesterol and prevent cardiovascular disease.",
      manufacturer: "AstraZeneca",
      isGeneric: false,
      price: 112.99,
      dosage: "5mg, 30 tablets",
      activeIngredient: "Rosuvastatin Calcium",
      imageUrl: "",
      availableAt: ["CVS", "Rite Aid"],
      savingsPercentage: 32
    }
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-sans mb-4">See How It Works</h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Experience MediCompare's intuitive interface and powerful features in action
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar (filters) */}
            <div className="w-full md:w-64 bg-slate-50 p-5 border-r border-slate-100">
              <h3 className="text-lg font-semibold mb-4 font-sans">Filters</h3>
              
              <div className="mb-6">
                <Label className="block text-slate-700 font-medium mb-2">Price Range</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    defaultValue={[75]} 
                    max={100} 
                    step={1} 
                    className="w-full"
                    onValueChange={setPriceRange}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-1">
                  <span>₹0</span>
                  <span>₹100+</span>
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="block text-slate-700 font-medium mb-2">Manufacturer</Label>
                <div className="space-y-2">
                  {manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className="flex items-center">
                      <Checkbox id={manufacturer.id} />
                      <Label htmlFor={manufacturer.id} className="ml-2 text-slate-700">{manufacturer.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="block text-slate-700 font-medium mb-2">Medicine Type</Label>
                <div className="space-y-2">
                  {medicineTypes.map((type) => (
                    <div key={type.id} className="flex items-center">
                      <Checkbox id={type.id} />
                      <Label htmlFor={type.id} className="ml-2 text-slate-700">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition">Apply Filters</button>
            </div>
            
            {/* Main content area (search results) */}
            <div className="flex-1 p-6">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h3 className="text-xl font-semibold">Search Results for "Lipitor"</h3>
                <p className="text-slate-500 mt-1">Showing alternatives and price comparisons</p>
              </div>
              
              {/* Original medicine */}
              <MedicineCard medicine={originalMedicine} />
              
              <div className="mb-5">
                <h4 className="font-medium text-lg mb-4">Alternatives to Lipitor</h4>
                
                {/* Alternative medicines */}
                <div className="space-y-4">
                  {alternatives.map((alternative) => (
                    <AlternativeCard key={alternative.id} alternative={alternative} originalMedicine={originalMedicine} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Interface Preview */}
        <ChatInterface />
      </div>
    </section>
  );
}
