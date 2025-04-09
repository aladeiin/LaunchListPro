import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { Link } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MedicineCard from '@/components/MedicineCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Info as InfoIcon, 
  Filter as FilterIcon,
  SlidersHorizontal,
  Pill,
  RefreshCcw
} from 'lucide-react';

interface MedicinesResponse {
  data: Medicine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function Products() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch medicines
  const { data: medicinesData, isLoading, error } = useQuery<MedicinesResponse>({
    queryKey: ['/api/medicines', { page: currentPage, limit: 24 }],
  });

  // Filter and sort medicines
  const getFilteredMedicines = () => {
    if (!medicinesData || !medicinesData.data) return [];

    let filtered = [...medicinesData.data];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        med => 
          med.name.toLowerCase().includes(query) || 
          med.genericName.toLowerCase().includes(query) || 
          med.manufacturer.toLowerCase().includes(query)
      );
    }

    // Filter by medicine type based on the active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(med => 
        activeTab === 'generic' ? med.isGeneric : 
        activeTab === 'branded' ? !med.isGeneric : true
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      med => med.price >= priceRange[0] && med.price <= priceRange[1]
    );

    // Sort medicines
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredMedicines = getFilteredMedicines();
  
  // Get generic medicines count
  const genericMedicinesCount = medicinesData?.data.filter(med => med.isGeneric).length || 0;
  
  // Get branded medicines count
  const brandedMedicinesCount = medicinesData?.data.filter(med => !med.isGeneric).length || 0;
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 5000]);
    setSortOption('name-asc');
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Pill className="h-10 w-10 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No medicines found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <Button variant="outline" onClick={resetFilters}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Reset Filters
      </Button>
    </div>
  );

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => (
        <Card key={i} className="h-96">
          <CardContent className="p-4">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Medicine Products</h1>
      
      <div className="flex items-center p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
        <InfoIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Displaying authentic medicinal data from the comprehensive Indian medicine dataset. 
          All prices are in Indian Rupees (₹).
        </p>
      </div>
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar - Hidden on mobile unless toggled */}
        <div className={`md:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-green-700">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-green-200 focus:border-green-500"
              />
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Medicine Type Count */}
            <div className="border-t pt-6 space-y-3">
              <h3 className="text-sm font-medium">Medicine Types</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm">Generic Medicines</span>
                <Badge variant="secondary">{genericMedicinesCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Branded Medicines</span>
                <Badge variant="secondary">{brandedMedicinesCount}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Medicines Display Area */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="w-full border-b">
              <TabsTrigger value="all" className="flex-1">
                All Medicines 
                {medicinesData?.data && (
                  <Badge variant="secondary" className="ml-2">{medicinesData.data.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="generic" className="flex-1">
                Generic Medicines
                <Badge variant="secondary" className="ml-2">{genericMedicinesCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="branded" className="flex-1">
                Branded Medicines
                <Badge variant="secondary" className="ml-2">{brandedMedicinesCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>All Medicines</CardTitle>
                  <CardDescription>
                    Browse our complete collection of generic and branded medications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    renderSkeletons()
                  ) : error ? (
                    <p className="text-red-500">Error loading medicines.</p>
                  ) : filteredMedicines.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMedicines.map((medicine) => (
                        <MedicineCard key={medicine.id} medicine={medicine} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="generic" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>Generic Medicines</CardTitle>
                  <CardDescription>
                    Affordable alternatives with the same active ingredients as branded medications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    renderSkeletons()
                  ) : error ? (
                    <p className="text-red-500">Error loading medicines.</p>
                  ) : filteredMedicines.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMedicines.map((medicine) => (
                        <MedicineCard key={medicine.id} medicine={medicine} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="branded" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>Branded Medicines</CardTitle>
                  <CardDescription>
                    Original formulations from leading pharmaceutical manufacturers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    renderSkeletons()
                  ) : error ? (
                    <p className="text-red-500">Error loading medicines.</p>
                  ) : filteredMedicines.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMedicines.map((medicine) => (
                        <MedicineCard key={medicine.id} medicine={medicine} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}