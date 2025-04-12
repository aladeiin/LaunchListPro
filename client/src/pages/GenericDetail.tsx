import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Pill,
  Info,
  AlertCircle,
  FileText,
  Truck
} from 'lucide-react';

// Define the interface for Aristo products
interface AristoProduct {
  id: number;
  name: string;
  composition: string;
  category: string;
  image: string;
  price: number;
  dosage: string;
  packSize: string;
  manufacturer: string;
}

// Aristo catalogue data
const aristoProducts: AristoProduct[] = [
  {
    id: 1,
    name: "Telmikind",
    composition: "Telmisartan 40mg",
    category: "Cardiovascular",
    image: "/images/aristo/telmikind.svg",
    price: 112.50,
    dosage: "40mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 2,
    name: "Telmikind-H",
    composition: "Telmisartan 40mg + Hydrochlorothiazide 12.5mg",
    category: "Cardiovascular",
    image: "/images/aristo/telmikind-h.svg",
    price: 138.75,
    dosage: "40mg/12.5mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 3,
    name: "Glimestar-M",
    composition: "Glimepiride 1mg + Metformin 500mg",
    category: "Anti-Diabetic",
    image: "/images/aristo/glimestar-m.svg",
    price: 98.50,
    dosage: "1mg/500mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 4,
    name: "Clopilet",
    composition: "Clopidogrel 75mg",
    category: "Cardiovascular",
    image: "/images/aristo/clopilet.svg",
    price: 142.00,
    dosage: "75mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 5,
    name: "Orofer",
    composition: "Iron (as Ferric Hydroxide Polymaltose Complex) 100mg",
    category: "Haematinics",
    image: "/images/aristo/orofer.svg",
    price: 89.25,
    dosage: "100mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 6,
    name: "Arip MT",
    composition: "Aripiprazole 10mg",
    category: "CNS",
    image: "/images/aristo/arip-mt.svg",
    price: 210.50,
    dosage: "10mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 7,
    name: "Aristozyme",
    composition: "Digestive Enzymes",
    category: "Gastroenterology",
    image: "/images/aristo/aristozyme.svg",
    price: 65.80,
    dosage: "Standard",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 8,
    name: "Doxolin",
    composition: "Doxofylline 400mg",
    category: "Respiratory",
    image: "/images/aristo/doxolin.svg",
    price: 127.50,
    dosage: "400mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 9,
    name: "Calcirol",
    composition: "Vitamin D3 60,000 IU",
    category: "Vitamins & Supplements",
    image: "/images/aristo/calcirol.svg",
    price: 35.80,
    dosage: "60,000 IU",
    packSize: "4 capsules",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 10,
    name: "Pantocid",
    composition: "Pantoprazole 40mg",
    category: "Gastroenterology",
    image: "/images/aristo/pantocid.svg",
    price: 78.50,
    dosage: "40mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 11,
    name: "Atocor",
    composition: "Atorvastatin 10mg",
    category: "Cardiovascular",
    image: "/images/aristo/atocor.svg",
    price: 95.75,
    dosage: "10mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  },
  {
    id: 12,
    name: "Metapure",
    composition: "Metoprolol 50mg",
    category: "Cardiovascular",
    image: "/images/aristo/metapure.svg",
    price: 56.25,
    dosage: "50mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  }
];

// Additional medicine information that would come from a database in a real app
const medicineInfo = {
  description: "This is a high-quality generic medicine from Aristo Pharmaceuticals, one of India's leading pharmaceutical companies. The product is manufactured in compliance with GMP (Good Manufacturing Practice) standards.",
  uses: "Used for the treatment of various conditions as prescribed by a qualified healthcare professional. Please consult your doctor for specific usage guidance.",
  sideEffects: "Common side effects may include nausea, headache, and dizziness. Please consult the package insert or your healthcare provider for complete information about side effects.",
  precautions: "Take this medicine as prescribed by your doctor. Do not exceed the recommended dose. Store in a cool, dry place away from direct sunlight. Keep out of reach of children.",
  availability: ["Apollo Pharmacy", "MedPlus", "NetMeds", "PharmEasy"],
  deliveryInfo: "Usually delivered within 24-48 hours. Free delivery on orders above ₹500. Standard delivery charge ₹40."
};

export default function GenericDetail() {
  const [, params] = useRoute('/generic/:id');
  const [product, setProduct] = useState<AristoProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id);
      const foundProduct = aristoProducts.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params?.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6 w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Card>
          <CardContent className="p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Medicine Not Found</h1>
            <p className="mb-6 text-gray-600">
              The generic medicine you're looking for could not be found. It may have been removed or the URL might be incorrect.
            </p>
            <Link href="/generics">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/generics">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generics
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Image */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="bg-gray-100 rounded-md p-4 flex items-center justify-center h-72">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <Badge variant="outline">{product.category}</Badge>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  In Stock
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
              <CardDescription>{product.composition}</CardDescription>
              <div className="mt-2">
                <Badge variant="secondary" className="mr-2">Generic</Badge>
                <Badge variant="outline">{product.manufacturer}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Dosage</p>
                  <p className="font-medium">{product.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pack Size</p>
                  <p className="font-medium">{product.packSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-xl text-primary">₹{product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Savings</p>
                  <p className="font-medium text-green-600">Up to 30% vs branded</p>
                </div>
              </div>

              <Tabs defaultValue="description">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="information">Information</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div className="flex items-start">
                    <Info className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <p>{medicineInfo.description}</p>
                  </div>
                  <div className="flex items-start">
                    <Pill className="text-green-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Uses</p>
                      <p>{medicineInfo.uses}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="information" className="space-y-4">
                  <div className="flex items-start">
                    <AlertCircle className="text-amber-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Side Effects</p>
                      <p>{medicineInfo.sideEffects}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ShieldCheck className="text-green-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Precautions</p>
                      <p>{medicineInfo.precautions}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Available At</p>
                      <ul className="list-disc list-inside">
                        {medicineInfo.availability.map((place, index) => (
                          <li key={index}>{place}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Truck className="text-green-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Delivery Information</p>
                      <p>{medicineInfo.deliveryInfo}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button className="w-full sm:w-auto">Buy Now</Button>
              <Button variant="outline" className="w-full sm:w-auto">Add to Cart</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}