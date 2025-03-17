import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { formatPrice } from '../lib/medicine-data';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import MedicineDetail from './MedicineDetail';
import { Search, ArrowRight, Filter, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [priceRange, setPriceRange] = useState<[number]>([1000]);
  const [showGeneric, setShowGeneric] = useState<boolean | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);

  // State to manage when to trigger the search
  const [searchTerm, setSearchTerm] = useState('');

  // Query for searching medicines with pagination
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/medicines/search', searchTerm, currentPage, pageSize, sortBy, priceRange[0], showGeneric, inStockOnly, selectedManufacturers],
    queryFn: () => {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      params.append('sort', sortBy);
      
      if (priceRange[0] < 1000) {
        params.append('maxPrice', priceRange[0].toString());
      }
      
      if (showGeneric !== null) {
        params.append('isGeneric', showGeneric.toString());
      }
      
      if (inStockOnly) {
        params.append('inStock', 'true');
      }
      
      if (selectedManufacturers.length > 0) {
        selectedManufacturers.forEach(m => params.append('manufacturer', m));
      }
      
      // Use apiRequest with custom URL including query parameters
      return apiRequest(`/api/medicines/search?${params.toString()}`, {
        method: 'GET'
      });
    },
    enabled: searchTerm.length > 2, // Only run query if search term is longer than 2 chars
  });

  // Get the data from the paginated response
  const searchResults = searchData?.data || [];
  const pagination = searchData?.pagination || { 
    total: 0, 
    page: 1, 
    limit: pageSize, 
    totalPages: 0, 
    hasNextPage: false, 
    hasPrevPage: false 
  };
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, showGeneric, inStockOnly, selectedManufacturers]);

  const handleSearch = () => {
    if (query.trim().length > 2) {
      setSearchTerm(query.trim());
      setSelectedMedicine(null); // Reset selected medicine when performing new search
      setCurrentPage(1); // Reset to page 1 for new search
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const renderPaginationItems = () => {
    const pages = [];
    const maxPageButtons = 5;
    
    // Always include first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if necessary
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(pagination.totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === pagination.totalPages) continue;
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if necessary
    if (currentPage < pagination.totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add last page if there's more than one page
    if (pagination.totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(pagination.totalPages)}
            isActive={currentPage === pagination.totalPages}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };
  
  // Extract unique manufacturers from search results for filtering
  const availableManufacturers = React.useMemo(() => {
    if (!searchResults || !Array.isArray(searchResults)) return [];
    
    const manufacturers = new Set<string>();
    searchResults.forEach((medicine: Medicine) => {
      if (medicine.manufacturer) {
        manufacturers.add(medicine.manufacturer);
      }
    });
    
    return Array.from(manufacturers).sort();
  }, [searchResults]);
  
  // Toggle manufacturer selection
  const toggleManufacturer = (manufacturer: string) => {
    setSelectedManufacturers(prev => 
      prev.includes(manufacturer)
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setPriceRange([1000]);
    setShowGeneric(null);
    setInStockOnly(false);
    setSelectedManufacturers([]);
  };

  // Sort the results based on the selected criteria
  const sortedResults = React.useMemo(() => {
    return searchResults;
  }, [searchResults]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Find the Best Medicine at the Best Price
        </h2>
        <p className="text-muted-foreground mt-2">
          Search by medicine name, active ingredient, or manufacturer and find affordable alternatives
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for medicines (e.g., Amoxicillin, Paracetamol)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="shrink-0">Search</Button>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="shrink-0 flex items-center"
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Options</h4>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Price Range</h5>
                  <div className="px-1">
                    <Slider
                      value={priceRange}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setPriceRange(value as [number])}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹{priceRange[0]}</span>
                      <span>₹1000+</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Availability</h5>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <Label htmlFor="in-stock">In Stock Only</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Medicine Type</h5>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="generic" 
                        checked={showGeneric === true}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShowGeneric(true);
                          } else if (showGeneric === true) {
                            setShowGeneric(null);
                          }
                        }}
                      />
                      <Label htmlFor="generic">Generic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="branded" 
                        checked={showGeneric === false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShowGeneric(false);
                          } else if (showGeneric === false) {
                            setShowGeneric(null);
                          }
                        }}
                      />
                      <Label htmlFor="branded">Branded</Label>
                    </div>
                  </div>
                </div>
                
                {availableManufacturers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Manufacturers</h5>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                      {availableManufacturers.map(manufacturer => (
                        <div key={manufacturer} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`manufacturer-${manufacturer}`}
                            checked={selectedManufacturers.includes(manufacturer)}
                            onCheckedChange={() => toggleManufacturer(manufacturer)}
                          />
                          <Label 
                            htmlFor={`manufacturer-${manufacturer}`}
                            className="text-sm truncate"
                          >
                            {manufacturer}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedMedicine ? (
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => setSelectedMedicine(null)}
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to results
          </Button>
          <MedicineDetail medicineName={selectedMedicine} />
        </div>
      ) : (
        <>
          {searchTerm && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? 'Searching...'
                  : pagination.total === 0
                  ? 'No results found'
                  : `Found ${pagination.total} results for "${searchTerm}"`}
              </p>
              
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Name: Z to A</SelectItem>
                      <SelectItem value="relevance">Relevance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Search results
              sortedResults.map((medicine: Medicine) => (
                <Card key={medicine.id} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col h-full">
                      <div className={`p-4 flex-1 ${medicine.isGeneric ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold line-clamp-1 text-lg">{medicine.name}</h3>
                          {medicine.isGeneric ? (
                            <Badge variant="success" className="ml-2">Generic</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2">Branded</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                          {medicine.manufacturer}
                        </p>
                        
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Active:</span> {medicine.activeIngredient}
                        </p>
                        
                        <p className="text-sm line-clamp-2 mb-3 mt-2">{medicine.description}</p>
                        
                        <div className="flex items-center mb-2">
                          {medicine.inStock ? (
                            <Badge variant="outline" className="flex items-center bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              In Stock
                              {medicine.stockCount !== undefined && (
                                <span className="ml-1">({medicine.stockCount})</span>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Out of Stock
                            </Badge>
                          )}
                          
                          {medicine.similarityScore && medicine.similarityScore > 0.75 && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                              {Math.round(medicine.similarityScore * 100)}% Match
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-auto pt-2 border-t">
                          <span className="font-bold text-lg text-primary">
                            ₹{formatPrice(medicine.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setSelectedMedicine(medicine.name)}
                            className="transition-all"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={pagination.hasPrevPage ? "cursor-pointer" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={pagination.hasNextPage ? "cursor-pointer" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {searchTerm && !isLoading && pagination.total === 0 && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg mt-4">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No medicines found</h3>
              <p className="text-muted-foreground">
                Try searching with a different term, check the spelling, or use fewer filters
              </p>
              {(showGeneric !== null || inStockOnly || selectedManufacturers.length > 0 || priceRange[0] < 1000) && (
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}