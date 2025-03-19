import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Medicine } from '@shared/schema';

// Define the API response types
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

const Inventory = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineType, setMedicineType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch medicines
  const { data: medicinesData, isLoading, error } = useQuery({
    queryKey: ['/api/medicines', { page: currentPage, limit: 12 }],
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

    // Filter by medicine type
    if (medicineType !== 'all') {
      filtered = filtered.filter(med => 
        medicineType === 'generic' ? med.isGeneric : 
        medicineType === 'branded' ? !med.isGeneric : true
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      med => med.price >= priceRange[0] && med.price <= priceRange[1]
    );

    // Sort the results
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

  const filteredMedicines = medicinesData ? getFilteredMedicines() : [];
  const totalPages = medicinesData?.pagination?.totalPages || 1;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Price formatter
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Medicine Inventory</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Filters</h2>
          
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
            
            {/* Medicine Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Medicine Type</label>
              <Select value={medicineType} onValueChange={setMedicineType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                  <SelectItem value="branded">Branded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </label>
              <Slider
                defaultValue={[0, 5000]}
                max={5000}
                step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
            </div>
            
            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full">
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
            
            {/* Apply Filters Button */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setCurrentPage(1)} // Reset to first page when filters change
            >
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Medicine Listing */}
        <div className="md:col-span-3">
          {/* Sort & Total Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {filteredMedicines.length} medicines found
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <Card key={i} className="border rounded-lg animate-pulse h-64">
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-500">Error loading medicines. Please try again.</p>
            </div>
          ) : (
            <>
              {filteredMedicines.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No medicines found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMedicines.map((medicine: Medicine) => (
                    <Link key={medicine.id} href={`/medicine/${medicine.name}`}>
                      <a className="block h-full">
                        <Card className="border h-full hover:shadow-md transition-shadow duration-200 cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-green-700 line-clamp-2">
                              {medicine.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
                          </CardHeader>
                          <CardContent className="space-y-3 pb-2">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">Generic Name:</p>
                              <p className="text-sm font-medium">{medicine.genericName}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">Dosage:</p>
                              <p className="text-sm font-medium">{medicine.dosage}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={medicine.isGeneric ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                {medicine.isGeneric ? "Generic" : "Branded"}
                              </Badge>
                              <Badge className={medicine.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {medicine.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                            <p className="text-sm line-clamp-2 text-gray-600 mt-1">
                              {medicine.description.slice(0, 100)}...
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-green-700">
                                {formatPrice(medicine.price)}
                              </span>
                              {!medicine.isGeneric && (
                                <span className="text-xs text-gray-500">
                                  Generic available at lower price
                                </span>
                              )}
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                            className={pageNum === currentPage ? "bg-green-600" : ""}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;