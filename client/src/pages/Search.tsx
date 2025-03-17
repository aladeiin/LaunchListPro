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
import { Search as SearchIcon, ChevronLeft, Store, Pill, Filter, Info, Home, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Search() {
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Medicine Search</h1>
              <p className="text-muted-foreground">Find medications and compare alternatives</p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Link href="/">
                <Button variant="outline" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="text-slate-500" size={18} />
                </div>
                <Input 
                  type="text" 
                  placeholder="Search for a medicine..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={toggleMobileFilters}
                className="md:hidden"
              >
                <Filter size={18} />
              </Button>
            </form>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Filters</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium text-sm mb-2">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setPriceRange(value)}
                    />
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>₹0</span>
                      <span>₹{priceRange[0]}</span>
                      <span>₹1000+</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-sm mb-2">Manufacturer</h3>
                  <div className="space-y-2">
                    {manufacturers.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <Checkbox 
                          id={`manufacturer-${item.id}`}
                          checked={selectedManufacturers.includes(item.id)}
                          onCheckedChange={() => toggleManufacturer(item.id)}
                        />
                        <Label 
                          htmlFor={`manufacturer-${item.id}`}
                          className="ml-2 text-sm"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-sm mb-2">Medicine Type</h3>
                  <div className="space-y-2">
                    {medicineTypes.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <Checkbox 
                          id={`type-${item.id}`}
                          checked={selectedTypes.includes(item.id)}
                          onCheckedChange={() => toggleType(item.id)}
                        />
                        <Label
                          htmlFor={`type-${item.id}`}
                          className="ml-2 text-sm"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
            
            {/* Filters - Mobile */}
            {showMobileFilters && (
              <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                <div className="bg-white p-4 rounded-t-lg w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleMobileFilters}
                    >
                      Close
                    </Button>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-sm mb-2">Price Range</h3>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        max={1000}
                        step={10}
                        onValueChange={(value) => setPriceRange(value)}
                      />
                      <div className="flex justify-between mt-1 text-xs text-slate-500">
                        <span>₹0</span>
                        <span>₹{priceRange[0]}</span>
                        <span>₹1000+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-sm mb-2">Manufacturer</h3>
                    <div className="space-y-2">
                      {manufacturers.map((item) => (
                        <div key={item.id} className="flex items-center">
                          <Checkbox 
                            id={`mobile-manufacturer-${item.id}`}
                            checked={selectedManufacturers.includes(item.id)}
                            onCheckedChange={() => toggleManufacturer(item.id)}
                          />
                          <Label 
                            htmlFor={`mobile-manufacturer-${item.id}`}
                            className="ml-2 text-sm"
                          >
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-sm mb-2">Medicine Type</h3>
                    <div className="space-y-2">
                      {medicineTypes.map((item) => (
                        <div key={item.id} className="flex items-center">
                          <Checkbox 
                            id={`mobile-type-${item.id}`}
                            checked={selectedTypes.includes(item.id)}
                            onCheckedChange={() => toggleType(item.id)}
                          />
                          <Label
                            htmlFor={`mobile-type-${item.id}`}
                            className="ml-2 text-sm"
                          >
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="flex-1">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Searching for medicines...</p>
                </div>
              ) : isError ? (
                <div className="p-8 text-center bg-red-50 rounded-lg">
                  <p className="text-red-600">Error searching for medicines. Please try again.</p>
                </div>
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
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Search Results</h2>
                        <p className="text-sm text-slate-500">
                          Found {searchResults.medicines.length} medicines for "{searchTerm}"
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {searchResults.medicines.map((medicine: any) => (
                          <MedicineCard 
                            key={medicine.id} 
                            medicine={medicine}
                            onClick={() => setSelectedMedicine(medicine.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : searchTerm ? (
                <div className="p-8 text-center bg-slate-100 rounded-lg">
                  <Store className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Medicines Found</h3>
                  <p className="text-slate-600">
                    We couldn't find any medicines matching "{searchTerm}". Try a different search term.
                  </p>
                </div>
              ) : (
                <div className="text-center p-12 bg-slate-100 rounded-lg">
                  <Pill className="h-16 w-16 text-primary/60 mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold mb-2">Find Your Medication</h2>
                  <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Search for medications by name or active ingredient to find affordable alternatives and compare prices
                  </p>
                  <p className="text-sm text-slate-500">
                    Try searching for medicines like "Paracetamol", "Lisinopril", or "Simvastatin"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}