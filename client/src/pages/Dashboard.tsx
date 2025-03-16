import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicineCard from "@/components/MedicineCard";
import AlternativeCard from "@/components/AlternativeCard";
import ChatInterface from "@/components/ChatInterface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, ChevronLeft, Store, Pill, Filter, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([100]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Parse search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);
  
  // Fetch medicine data
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['/api/medicines/search', searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to search medicines');
      return res.json();
    },
    enabled: searchTerm.length > 0
  });
  
  // Fetch alternatives if we have a selected medicine
  const [selectedMedicine, setSelectedMedicine] = useState<number | null>(null);
  const { data: alternativesData, isLoading: isLoadingAlternatives } = useQuery({
    queryKey: ['/api/medicines', selectedMedicine, 'alternatives'],
    queryFn: async () => {
      if (!selectedMedicine) return null;
      const medicine = searchResults.medicines.find((m: any) => m.id === selectedMedicine);
      if (!medicine) return null;
      
      const res = await fetch(`/api/medicines/${medicine.name}/alternatives`);
      if (!res.ok) throw new Error('Failed to fetch alternatives');
      return res.json();
    },
    enabled: !!selectedMedicine && !!searchResults?.medicines
  });
  
  const manufacturers = [
    { id: "pfizer", label: "Pfizer" },
    { id: "johnson", label: "Johnson & Johnson" },
    { id: "bayer", label: "Bayer" },
    { id: "various", label: "Various/Generic" }
  ];
  
  const medicineTypes = [
    { id: "generic", label: "Generic" },
    { id: "brand", label: "Brand Name" }
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSelectedMedicine(null); // Reset selected medicine when searching
    } else {
      toast({
        title: "Search Error",
        description: "Please enter a medication name to search",
        variant: "destructive"
      });
    }
  };
  
  const toggleManufacturer = (id: string) => {
    setSelectedManufacturers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };
  
  const toggleType = (id: string) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };
  
  const applyFilters = () => {
    // In a real app, this would filter the results based on selected criteria
    toast({
      title: "Filters Applied",
      description: "Your filter preferences have been applied"
    });
    setShowMobileFilters(false);
  };
  
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  // If we have alternatives data, compute savings percentages
  const alternativesWithSavings = alternativesData?.alternatives?.map((alt: any) => {
    const originalPrice = alternativesData.original.price;
    const savingsPercentage = Math.round(((originalPrice - alt.price) / originalPrice) * 100);
    return { ...alt, savingsPercentage };
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center mb-4">
              <ChevronLeft className="mr-1" size={16} /> Back
            </Button>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-slate-500" size={18} />
                </div>
                <Input 
                  type="text" 
                  placeholder="Search for a medicine..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="md:hidden" 
                onClick={toggleMobileFilters}
              >
                <Filter size={18} />
              </Button>
            </form>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar - desktop */}
            <Card className="hidden md:block w-64 h-fit bg-white">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-4 font-sans">Filters</h3>
                
                <div className="mb-6">
                  <Label className="block text-slate-700 font-medium mb-2">Price Range</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      defaultValue={[100]} 
                      max={200} 
                      step={1} 
                      className="w-full"
                      onValueChange={setPriceRange}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>₹0</span>
                    <span>₹{priceRange[0]}+</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="block text-slate-700 font-medium mb-2">Manufacturer</Label>
                  <div className="space-y-2">
                    {manufacturers.map((manufacturer) => (
                      <div key={manufacturer.id} className="flex items-center">
                        <Checkbox 
                          id={`desktop-${manufacturer.id}`} 
                          checked={selectedManufacturers.includes(manufacturer.id)}
                          onCheckedChange={() => toggleManufacturer(manufacturer.id)}
                        />
                        <Label htmlFor={`desktop-${manufacturer.id}`} className="ml-2 text-slate-700">{manufacturer.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="block text-slate-700 font-medium mb-2">Medicine Type</Label>
                  <div className="space-y-2">
                    {medicineTypes.map((type) => (
                      <div key={type.id} className="flex items-center">
                        <Checkbox 
                          id={`desktop-${type.id}`} 
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={() => toggleType(type.id)}
                        />
                        <Label htmlFor={`desktop-${type.id}`} className="ml-2 text-slate-700">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
            
            {/* Mobile filters - shown when toggled */}
            {showMobileFilters && (
              <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
                <div className="absolute right-0 top-0 h-full w-80 bg-white p-5 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={toggleMobileFilters}>
                      <ChevronLeft size={18} />
                    </Button>
                  </div>
                  
                  <div className="mb-6">
                    <Label className="block text-slate-700 font-medium mb-2">Price Range</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        defaultValue={[100]} 
                        max={200} 
                        step={1} 
                        className="w-full"
                        onValueChange={setPriceRange}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 mt-1">
                      <span>₹0</span>
                      <span>₹{priceRange[0]}+</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label className="block text-slate-700 font-medium mb-2">Manufacturer</Label>
                    <div className="space-y-2">
                      {manufacturers.map((manufacturer) => (
                        <div key={manufacturer.id} className="flex items-center">
                          <Checkbox 
                            id={`mobile-${manufacturer.id}`} 
                            checked={selectedManufacturers.includes(manufacturer.id)}
                            onCheckedChange={() => toggleManufacturer(manufacturer.id)}
                          />
                          <Label htmlFor={`mobile-${manufacturer.id}`} className="ml-2 text-slate-700">{manufacturer.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label className="block text-slate-700 font-medium mb-2">Medicine Type</Label>
                    <div className="space-y-2">
                      {medicineTypes.map((type) => (
                        <div key={type.id} className="flex items-center">
                          <Checkbox 
                            id={`mobile-${type.id}`} 
                            checked={selectedTypes.includes(type.id)}
                            onCheckedChange={() => toggleType(type.id)}
                          />
                          <Label htmlFor={`mobile-${type.id}`} className="ml-2 text-slate-700">{type.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                </div>
              </div>
            )}
            
            {/* Main content */}
            <div className="flex-1">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Searching for medicines...</span>
                  </CardContent>
                </Card>
              ) : isError ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Info className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium mb-1">Error Searching Medicines</h3>
                    <p>We couldn't complete your search. Please try again.</p>
                  </CardContent>
                </Card>
              ) : searchResults?.medicines?.length > 0 ? (
                <div>
                  {selectedMedicine ? (
                    <>
                      <div className="mb-4">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedMedicine(null)}
                          className="flex items-center mb-2"
                        >
                          <ChevronLeft size={16} className="mr-1" /> Back to search results
                        </Button>
                        <h2 className="text-xl font-semibold">Alternatives & Price Comparison</h2>
                      </div>
                      
                      {/* Original Medicine */}
                      {alternativesData && (
                        <>
                          <MedicineCard medicine={alternativesData.original} />
                          
                          {/* Alternatives */}
                          <div className="mb-5">
                            <h3 className="font-medium text-lg mb-4">Alternatives to {alternativesData.original.name}</h3>
                            
                            {isLoadingAlternatives ? (
                              <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>Finding alternatives...</p>
                              </div>
                            ) : alternativesWithSavings?.length > 0 ? (
                              <div className="space-y-4">
                                {alternativesWithSavings.map((alt: any) => (
                                  <AlternativeCard 
                                    key={alt.id} 
                                    alternative={alt} 
                                    originalMedicine={alternativesData.original} 
                                  />
                                ))}
                              </div>
                            ) : (
                              <Card>
                                <CardContent className="p-6 text-center">
                                  <Info className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                  <h3 className="text-lg font-medium mb-1">No Alternatives Found</h3>
                                  <p>We couldn't find any alternatives for this medication.</p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                          
                          {/* Chat interface for more questions */}
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Have Questions About This Medication?</h3>
                            <ChatInterface />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold">Search Results for "{searchTerm}"</h2>
                        <p className="text-slate-500">Found {searchResults.medicines.length} medicines</p>
                      </div>
                      
                      <div className="space-y-4">
                        {searchResults.medicines.map((medicine: any) => (
                          <Card 
                            key={medicine.id} 
                            className="hover:border-primary hover:shadow-md cursor-pointer transition"
                            onClick={() => setSelectedMedicine(medicine.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium">{medicine.name}</h4>
                                    <div className="ml-2 text-xs inline-flex items-center font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-800">
                                      {medicine.isGeneric ? "Generic" : "Brand Name"}
                                    </div>
                                  </div>
                                  <p className="text-slate-600 text-sm">{medicine.dosage}</p>
                                  <div className="flex items-center mt-2">
                                    <Pill className="h-4 w-4 text-slate-400 mr-1" />
                                    <span className="text-sm">{medicine.activeIngredient}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">₹{medicine.price.toFixed(2)}</div>
                                  <div className="flex items-center text-xs text-slate-500 justify-end mt-1">
                                    <Store className="h-3 w-3 mr-1" />
                                    <span>{medicine.availableAt.length} pharmacies</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : searchTerm ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Info className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium mb-1">No Medicines Found</h3>
                    <p>We couldn't find any medicines matching "{searchTerm}". Try another search term.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Search for a Medication</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Enter a medication name in the search box above to find alternatives and compare prices.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
