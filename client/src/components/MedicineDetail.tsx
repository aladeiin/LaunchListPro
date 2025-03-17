import React, { useState } from 'react';
import { Medicine } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { calculateSavings, formatPrice, getMockPharmacyPrices } from '../lib/medicine-data';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Store, 
  TrendingDown, 
  ShieldCheck,
  AlertCircle,
  Building,
  Pill,
  CornerDownRight,
  Info
} from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import AlternativeCard from './AlternativeCard';
import ChatInterface from './ChatInterface';
import MlSubstitutions from './MlSubstitutions';

interface MedicineDetailProps {
  medicineName: string;
}

export default function MedicineDetail({ medicineName }: MedicineDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [currentAlternativesPage, setCurrentAlternativesPage] = useState(1);
  const alternativesPerPage = 3;
  const { toast } = useToast();

  // Fetch medicine details
  const { data: medicine, isLoading: isLoadingMedicine } = useQuery({
    queryKey: ['/api/medicines/name', medicineName],
    queryFn: () => {
      return apiRequest(`/api/medicines/name/${encodeURIComponent(medicineName)}`, {
        method: 'GET'
      });
    },
    enabled: !!medicineName,
  });

  // Fetch medicine alternatives with pagination
  const { data: alternativesData, isLoading: isLoadingAlternatives } = useQuery({
    queryKey: ['/api/medicines', medicineName, 'alternatives', currentAlternativesPage, alternativesPerPage],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', currentAlternativesPage.toString());
      params.append('limit', alternativesPerPage.toString());
      
      return apiRequest(`/api/medicines/${encodeURIComponent(medicineName)}/alternatives?${params.toString()}`, {
        method: 'GET'
      });
    },
    enabled: !!medicineName,
  });
  
  // Fetch medication info from OpenAI
  const { data: medicationInfo, isLoading: isLoadingMedicationInfo } = useQuery({
    queryKey: ['/api/medication-info', medicineName],
    queryFn: () => {
      return apiRequest(`/api/medication-info/${encodeURIComponent(medicineName)}`, {
        method: 'GET'
      });
    },
    enabled: !!medicineName && activeTab === 'info',
    retry: 1, // Only retry once if there's an error
  });

  // Get AI recommendations for this medicine
  const getAIRecommendation = () => {
    if (!medicine) return;
    
    toast({
      title: "Ask AI Pharmacist about this medicine",
      description: "Ask about dosage, side effects, interactions, or alternatives",
      action: (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            Chat Now
          </Button>
        </div>
      ),
    });
  };
  
  // Handle alternatives pagination
  const alternatives = alternativesData?.data || [];
  const alternativesPagination = alternativesData?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };
  
  const originalMedicine = alternativesData?.originalMedicine || medicine;

  // Calculate savings for alternatives if the API hasn't already done so
  const alternativesWithSavings = alternatives.map((alt: Medicine) => {
    if ('savingsPercentage' in alt && alt.savingsPercentage !== undefined) return alt;
    return {
      ...alt,
      savingsPercentage: calculateSavings(originalMedicine?.price || 0, alt.price),
    };
  });
  
  // Generate mock pharmacy data
  const pharmacyPrices = medicine ? getMockPharmacyPrices(medicine) : [];
  const priceComparisonData = pharmacyPrices.map(({ pharmacy, price }) => ({
    name: pharmacy,
    price: parseFloat(formatPrice(price)),
  }));
  
  // Prepare data for medication info section
  const sideEffects = medicationInfo?.sideEffects || [];
  const interactions = medicationInfo?.interactions || [];
  const guidelines = medicationInfo?.guidelines || "";
  
  if (isLoadingMedicine) {
    return <MedicineDetailSkeleton />;
  }

  if (!medicine) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Medicine not found</h3>
            <p className="text-muted-foreground">
              We couldn't find details for {medicineName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full overflow-hidden border border-border/50 shadow-md">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center">
                <CardTitle className="text-2xl font-bold">{medicine.name}</CardTitle>
                {medicine.isGeneric ? (
                  <Badge variant="success" className="ml-2">Generic</Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">Branded</Badge>
                )}
              </div>
              <CardDescription className="text-md mt-1">
                {medicine.genericName}
              </CardDescription>
              <div className="flex items-center mt-2">
                <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{medicine.manufacturer}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                ₹{formatPrice(medicine.price)}
              </span>
              <div className="flex justify-end mt-1 space-x-2">
                {medicine.inStock ? (
                  <Badge variant="outline" className="flex items-center bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    In Stock
                    {medicine.stockCount > 0 && <span className="ml-1">({medicine.stockCount})</span>}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Out of Stock
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2"
                onClick={getAIRecommendation}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Ask AI Pharmacist
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
              <TabsTrigger value="prices">Compare Prices</TabsTrigger>
              <TabsTrigger value="info">Medical Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{medicine.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Pill className="h-4 w-4 mr-2 text-primary" />
                    Composition
                  </h4>
                  <p className="text-sm">{medicine.activeIngredient}</p>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Dosage Form
                  </h4>
                  <p className="text-sm">{medicine.dosage || "Information not available"}</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="manufacturer-info">
                  <AccordionTrigger>Manufacturer Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p><span className="font-medium">Company:</span> {medicine.manufacturer}</p>
                      {medicine.isGeneric ? (
                        <p><span className="font-medium">Type:</span> Generic Manufacturer</p>
                      ) : (
                        <p><span className="font-medium">Type:</span> Branded Pharmaceutical Company</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="storage">
                  <AccordionTrigger>Storage Information</AccordionTrigger>
                  <AccordionContent>
                    <p>Store this medication at room temperature away from light and moisture. Keep all medications away from children and pets.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="alternatives" className="space-y-6">
              {isLoadingAlternatives ? (
                <div className="space-y-4">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-36 w-full" />
                </div>
              ) : alternativesWithSavings.length > 0 ? (
                <>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-green-600" />
                      Available Alternatives
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      These alternatives contain the same active ingredients as {medicine.name}. 
                      The estimated savings shown below are calculated based on price difference.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {alternativesWithSavings.map((alternative: Medicine & { savingsPercentage: number }) => (
                      <AlternativeCard
                        key={alternative.id}
                        alternative={alternative}
                        originalMedicine={originalMedicine}
                      />
                    ))}
                  </div>

                  {/* Pagination for alternatives */}
                  {alternativesPagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentAlternativesPage(p => Math.max(1, p - 1))}
                            className={alternativesPagination.hasPrevPage ? "cursor-pointer" : "pointer-events-none opacity-50"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: alternativesPagination.totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentAlternativesPage(i + 1)}
                              isActive={currentAlternativesPage === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentAlternativesPage(p => Math.min(alternativesPagination.totalPages, p + 1))}
                            className={alternativesPagination.hasNextPage ? "cursor-pointer" : "pointer-events-none opacity-50"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No alternatives found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    We couldn't find any alternatives with the same active ingredient as {medicine.name}
                  </p>
                  <Button onClick={() => setActiveTab('prices')} className="mt-4">
                    Compare Prices
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-suggestions" className="space-y-6">
              {/* ML Substitution Recommendations */}
              <MlSubstitutions medicineName={medicineName} originalMedicine={medicine} />
            </TabsContent>

            <TabsContent value="prices">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Store className="h-4 w-4 mr-2 text-primary" />
                    Price Comparison
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare {medicine.name} prices across different pharmacies in your area
                  </p>
                  
                  {pharmacyPrices.length > 0 ? (
                    <>
                      <div className="mb-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={priceComparisonData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              formatter={(value) => [`₹${value}`, 'Price']}
                              labelFormatter={(value) => `Pharmacy: ${value}`}
                            />
                            <Bar dataKey="price" fill="var(--primary)" name="Price (₹)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pharmacy</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Availability</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pharmacyPrices.map(({ pharmacy, price }, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{pharmacy}</TableCell>
                              <TableCell>₹{formatPrice(price)}</TableCell>
                              <TableCell>
                                {index % 3 === 0 ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Limited Stock</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline">Visit Store</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium">No pharmacy data available</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any pharmacy price information for this medicine
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                    Price Guarantee
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    PharmAssist scans prices from major pharmacies to help you find the best deals. 
                    Prices shown are indicative and may vary slightly at the time of purchase.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="space-y-6">
              {isLoadingMedicationInfo ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-40 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-8 w-40 mt-6 mb-2" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : medicationInfo ? (
                <>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-medium mb-2">Medical Description</h3>
                    <p className="text-muted-foreground">{medicationInfo.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">Side Effects</h4>
                      {sideEffects.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {sideEffects.map((effect: string, index: number) => (
                            <li key={index} className="text-sm">{effect}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Information not available</p>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">Drug Interactions</h4>
                      {interactions.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {interactions.map((interaction: string, index: number) => (
                            <li key={index} className="text-sm">{interaction}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Information not available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Usage Guidelines</h4>
                    <p className="text-sm whitespace-pre-wrap">{guidelines}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <h4 className="font-medium mb-2 flex items-center text-yellow-800 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Medical Disclaimer
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      This information is for educational purposes only and is not a substitute for 
                      professional medical advice. Always consult with a healthcare professional 
                      before making decisions about your medication.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Medical information unavailable</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    We couldn't retrieve detailed medical information for this medication at the moment.
                  </p>
                  <div className="mt-4">
                    <Button onClick={() => setActiveTab('details')}>
                      View Basic Details
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between p-6 bg-muted/10 gap-3">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
            Print Information
          </Button>
          <Button className="w-full sm:w-auto" onClick={getAIRecommendation}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask AI About This Medicine
          </Button>
        </CardFooter>
      </Card>
      
      {/* AI Pharmacist Chat Interface */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Chat with AI Pharmacist</h2>
          <Badge className="ml-2 bg-green-50 text-green-700 border-green-200">
            <Pill className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}

function MedicineDetailSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-6 w-24 ml-auto" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </CardFooter>
    </Card>
  );
}