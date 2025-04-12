import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Info as InfoIcon, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

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
    image: "/images/aristo/telmikind.jpg",
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
    image: "/images/aristo/telmikind-h.jpg",
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
    image: "/images/aristo/glimestar-m.jpg",
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
    image: "/images/aristo/clopilet.jpg",
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
    image: "/images/aristo/orofer.jpg",
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
    image: "/images/aristo/arip-mt.jpg",
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
    image: "/images/aristo/aristozyme.jpg",
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
    image: "/images/aristo/doxolin.jpg",
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
    image: "/images/aristo/calcirol.jpg",
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
    image: "/images/aristo/pantocid.jpg",
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
    image: "/images/aristo/atocor.jpg",
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
    image: "/images/aristo/metapure.jpg",
    price: 56.25,
    dosage: "50mg",
    packSize: "10 tablets",
    manufacturer: "Aristo Pharmaceuticals"
  }
];

// Categories from the Aristo catalogue
const categories = [
  "All",
  "Cardiovascular",
  "Anti-Diabetic",
  "Gastroenterology",
  "Respiratory",
  "CNS",
  "Haematinics",
  "Vitamins & Supplements"
];

export default function Generics() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter products based on search query and active category
  const filteredProducts = aristoProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.composition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Product card component
  const ProductCard = ({ product }: { product: AristoProduct }) => (
    <Card className="overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">
      <CardContent className="flex-1 p-5 pt-6">
        {/* Image with badge overlay */}
        <div className="relative mb-4 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center h-48">
          <svg 
            className="absolute w-full h-full text-gray-200" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1" 
              d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V8.625H19M9 13H15M9 17H12"
            />
          </svg>
          <Badge 
            className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 hover:bg-green-200"
          >
            Aristo
          </Badge>
          <div className="text-center font-medium text-lg z-10">{product.name}</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {product.composition}
          </p>
          
          <div className="text-sm">
            <span className="font-medium">Dosage:</span> {product.dosage}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Pack Size:</span> {product.packSize}
          </div>
          
          <div className="flex items-center">
            <Badge className="flex items-center bg-green-100 text-green-800 hover:bg-green-200">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              In Stock
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0 px-5 pb-5 mt-auto">
        <div>
          <p className="font-bold text-xl text-primary">₹{product.price.toFixed(2)}</p>
        </div>
        <Link href={`/generic/${product.id}`}>
          <Button size="sm">
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Aristo Generic Medicines</h1>
      
      <div className="flex items-center p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
        <InfoIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Authentic generic medicine data from Aristo Pharmaceuticals catalogue. 
          All prices are in Indian Rupees (₹).
        </p>
      </div>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search generics by name or composition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xl"
        />
      </div>
      
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="bg-muted/50 w-full flex overflow-x-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="flex-shrink-0">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>
                  {category === 'All' ? 'All Aristo Generic Medicines' : `${category} Medicines`}
                </CardTitle>
                <CardDescription>
                  {category === 'All' 
                    ? 'Affordable generic medicines from Aristo Pharmaceuticals.' 
                    : `Aristo's range of generic ${category.toLowerCase()} medications.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No generics found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your search or select a different category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}