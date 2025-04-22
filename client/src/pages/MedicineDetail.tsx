import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertTriangle, Info, PlusCircle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Medicine } from '@shared/schema';
import MedicineAlternatives from '@/components/MedicineAlternatives';

// Define the API response types
interface MedicineResponse extends Medicine {}

interface AlternativesResponse {
  data: (Medicine & { savingsPercentage: number })[];
  originalMedicine: {
    id: number;
    name: string;
    price: number;
    activeIngredient: string;
    manufacturer: string;
    isGeneric: boolean;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface MedicationInfoResponse {
  description: string;
  alternatives: string[];
  sideEffects: string[];
  interactions: string[];
  guidelines: string;
}

const MedicineDetail = () => {
  const [match, params] = useRoute('/medicine/:name');
  const { toast } = useToast();
  const medicineName = params?.name || '';
  const decodedName = decodeURIComponent(medicineName);
  
  // Fetch medicine details
  const { data: medicine, isLoading: isLoadingMedicine, error: medicineError } = useQuery<MedicineResponse>({
    queryKey: ['/api/medicines/name', decodedName],
    enabled: !!decodedName,
  });
  
  // Fetch medicine alternatives
  const { data: alternativesData, isLoading: isLoadingAlternatives } = useQuery<AlternativesResponse>({
    queryKey: ['/api/medicines', decodedName, 'alternatives'],
    enabled: !!medicine,
  });
  
  // Fetch medication info (side effects, interactions, etc.)
  const { data: medicationInfo, isLoading: isLoadingMedicationInfo } = useQuery<MedicationInfoResponse>({
    queryKey: ['/api/medication-info', decodedName],
    enabled: !!medicine,
  });
  
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Price alert handler
  const handleSetPriceAlert = () => {
    if (medicine?.price) {
      toast({
        title: "Price Alert Set",
        description: `We'll notify you when ${medicine?.name} drops below ${formatPrice(medicine.price * 0.9)}`,
        variant: "default",
      });
    }
  };

  // Handle error states
  if (medicineError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Medicine</h2>
          <p className="text-red-600">Unable to load medicine details. Please try again later.</p>
          <Link href="/inventory">
            <a className="mt-4 inline-block text-green-600 hover:underline">
              Return to Inventory
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-6">
        <Link href="/"><a className="text-gray-500 hover:text-green-600">Home</a></Link>
        <span className="mx-2">›</span>
        <Link href="/inventory"><a className="text-gray-500 hover:text-green-600">Medicines</a></Link>
        <span className="mx-2">›</span>
        <span className="text-green-700 font-medium">{decodedName}</span>
      </div>
      
      {isLoadingMedicine ? (
        <MedicineDetailSkeleton />
      ) : medicine ? (
        <>
          {/* Main Product Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Image Column */}
            <div className="md:col-span-1">
              <Card className="border overflow-hidden">
                <div className="aspect-square bg-white flex items-center justify-center p-4 border-b">
                  {medicine.imageUrl ? (
                    <img 
                      src={medicine.imageUrl} 
                      alt={medicine.name} 
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-center text-sm text-gray-500">
                    {medicine.dosage} • {medicine.isGeneric ? 'Generic Medicine' : 'Branded Medicine'}
                  </p>
                </div>
              </Card>
            </div>
            
            {/* Product Info Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-1">{medicine.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="text-gray-600">By <span className="font-medium">{medicine.manufacturer}</span></p>
                  <Badge className={medicine.isGeneric ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {medicine.isGeneric ? "Generic" : "Branded"}
                  </Badge>
                  <Badge className={medicine.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {medicine.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">Generic Name: <span className="font-medium">{medicine.genericName}</span></p>
                
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
                  <div>
                    <span className="text-3xl font-bold text-green-700">{formatPrice(medicine.price)}</span>
                    {!medicine.isGeneric && (
                      <div className="text-sm text-gray-500 mt-1">
                        Generic alternatives available from {alternativesData?.data?.[0]?.price ? 
                          formatPrice(alternativesData.data[0].price) : "lower prices"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700" disabled={!medicine.inStock}>
                      {medicine.inStock ? "Buy Now" : "Out of Stock"}
                    </Button>
                    <Button variant="outline" className="border-green-600 text-green-600" onClick={handleSetPriceAlert}>
                      Set Price Alert
                    </Button>
                  </div>
                </div>
                
                {/* Availability */}
                {medicine.availableAt && medicine.availableAt.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available At:</h3>
                    <div className="flex flex-wrap gap-2">
                      {medicine.availableAt.map((pharmacy, index) => (
                        <Badge key={index} variant="outline" className="border-green-200 bg-green-50">
                          <Check className="mr-1 h-3 w-3 text-green-500" /> {pharmacy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Active Ingredient */}
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold mb-1">Active Ingredient</h3>
                  <p className="text-gray-700">{medicine.activeIngredient}</p>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">About {medicine.name}</h3>
                  <p className="text-gray-700">{medicine.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Section */}
          <Tabs defaultValue="details" className="mt-8">
            <TabsList className="w-full border-b">
              <TabsTrigger value="details" className="text-base">Details</TabsTrigger>
              <TabsTrigger value="alternatives" className="text-base">Alternatives</TabsTrigger>
              <TabsTrigger value="side-effects" className="text-base">Side Effects</TabsTrigger>
              <TabsTrigger value="dosage" className="text-base">Dosage & Precautions</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-700">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Active Ingredient</TableCell>
                          <TableCell>{medicine.activeIngredient}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Dosage</TableCell>
                          <TableCell>{medicine.dosage}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Manufacturer</TableCell>
                          <TableCell>{medicine.manufacturer}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Medicine Type</TableCell>
                          <TableCell>{medicine.isGeneric ? 'Generic' : 'Branded'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Stock Status</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center ${medicine.inStock ? 'text-green-700' : 'text-red-500'}`}>
                              {medicine.inStock ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  In Stock
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Out of Stock
                                </>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700">Stock Count</TableCell>
                          <TableCell>{medicine.stockCount} units</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-700">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{medicine.description}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="py-4">
              {medicine && (
                <MedicineAlternatives medicineName={medicine.name} limit={10} />
              )}
            </TabsContent>
            
            {/* Side Effects Tab */}
            <TabsContent value="side-effects" className="py-4">
              {isLoadingMedicationInfo ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : medicationInfo?.sideEffects?.length ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-700 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                        Side Effects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {medicationInfo.sideEffects.map((effect: string, index: number) => (
                          <li key={index} className="text-gray-700">{effect}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {medicationInfo.interactions?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-green-700 flex items-center">
                          <Info className="h-5 w-5 mr-2 text-blue-500" />
                          Drug Interactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                          {medicationInfo.interactions.map((interaction: string, index: number) => (
                            <li key={index} className="text-gray-700">{interaction}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No side effect information available for this medicine.</p>
                </div>
              )}
            </TabsContent>
            
            {/* Dosage Tab */}
            <TabsContent value="dosage" className="py-4">
              {isLoadingMedicationInfo ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : medicationInfo?.guidelines ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-700 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-green-500" />
                        Usage Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-700 prose max-w-none">
                        {medicationInfo.guidelines.split('\n').map((para: string, index: number) => (
                          <p key={index}>{para}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="precautions">
                      <AccordionTrigger className="text-green-700 font-medium">
                        Precautions & Warnings
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-amber-50 rounded-md text-amber-800">
                          <p className="font-medium mb-2">Always follow your doctor's instructions.</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Do not exceed the prescribed dosage.</li>
                            <li>Inform your doctor about any other medications you are taking.</li>
                            <li>Store in a cool, dry place away from direct sunlight.</li>
                            <li>Keep out of reach of children.</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="special-populations">
                      <AccordionTrigger className="text-green-700 font-medium">
                        Use in Special Populations
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">Pregnancy:</h4>
                            <p className="text-gray-700">Consult your doctor before use if you are pregnant or planning to become pregnant.</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Breastfeeding:</h4>
                            <p className="text-gray-700">Consult your doctor before use if you are breastfeeding.</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Pediatric Use:</h4>
                            <p className="text-gray-700">Safety and efficacy in children may not be established. Follow pediatrician's advice.</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Elderly:</h4>
                            <p className="text-gray-700">Elderly patients may require dosage adjustments or special monitoring.</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No dosage information available for this medicine.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Medicine not found.</p>
          <Link href="/inventory">
            <a className="mt-4 inline-block text-green-600 hover:underline">
              Return to Inventory
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

// Skeleton loader for medicine detail page
function MedicineDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <div className="md:col-span-1">
        <div className="border rounded-lg overflow-hidden">
          <div className="aspect-square bg-gray-100 animate-pulse"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 space-y-6 animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex gap-2 mb-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-28"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-lg mb-4">
            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
          
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetail;