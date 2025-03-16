import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { getQueryFn } from '../lib/queryClient';
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
import MedicineDetail from './MedicineDetail';
import { Search, ArrowRight, Filter } from 'lucide-react';

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price_asc');

  // State to manage when to trigger the search
  const [searchTerm, setSearchTerm] = useState('');

  // Query for searching medicines
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/medicines/search', searchTerm],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: searchTerm.length > 2, // Only run query if search term is longer than 2 chars
    select: (data) => {
      // The search endpoint returns an array of medicines
      if (data && Array.isArray(data)) {
        return data;
      }
      return [];
    }
  });

  const handleSearch = () => {
    if (query.trim().length > 2) {
      setSearchTerm(query.trim());
      setSelectedMedicine(null); // Reset selected medicine when performing new search
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const sortedResults = React.useMemo(() => {
    if (!searchResults || !Array.isArray(searchResults)) return [];

    return [...searchResults].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [searchResults, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Find the Best Medicine at the Best Price
        </h2>
        <p className="text-muted-foreground mt-2">
          Search for medicines by name or active ingredient and compare prices
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
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
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? 'Searching...'
                  : sortedResults.length === 0
                  ? 'No results found'
                  : `Found ${sortedResults.length} results for "${searchTerm}"`}
              </p>
              {sortedResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
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
                <Card key={medicine.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col h-full">
                      {medicine.imageUrl && (
                        <div className="relative h-40 bg-muted">
                          <div
                            className="absolute inset-0 bg-center bg-cover"
                            style={{
                              backgroundImage: `url(${medicine.imageUrl})`,
                            }}
                          />
                          {medicine.isGeneric && (
                            <Badge className="absolute top-2 right-2">Generic</Badge>
                          )}
                        </div>
                      )}

                      <div className="p-4 flex-1">
                        <h3 className="font-semibold line-clamp-1">{medicine.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {medicine.manufacturer}
                        </p>
                        <p className="text-sm line-clamp-2 mb-3">{medicine.description}</p>

                        <div className="flex justify-between items-center mt-auto">
                          <span className="font-bold text-lg">
                            ₹{formatPrice(medicine.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setSelectedMedicine(medicine.name)}
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

          {searchTerm && !isLoading && sortedResults.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No medicines found</h3>
              <p className="text-muted-foreground">
                Try searching with a different term or check the spelling
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}