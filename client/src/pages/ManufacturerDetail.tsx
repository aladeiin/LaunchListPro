import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManufacturerProfile from "@/components/ManufacturerProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building, 
  FileText, 
  Grid3X3, 
  Loader2, 
  MessageSquare, 
  Search, 
  Share, 
  Star 
} from "lucide-react";

// Mock manufacturer data for demonstration
const manufacturerData = {
  id: "1",
  name: "Aristo Pharmaceuticals",
  logo: "",
  description: "Aristo Pharmaceuticals is one of India's leading pharmaceutical companies, focusing on high-quality generic medications across multiple therapeutic categories. With decades of experience, Aristo has established itself as a trusted name in delivering affordable healthcare solutions throughout India.",
  established: "1966",
  headquarters: "Mumbai, Maharashtra, India",
  certifications: ["WHO-GMP Certified", "ISO 9001", "ISO 14001", "DCGI Approved"],
  website: "https://www.aristopharma.com",
  email: "info@aristopharma.com",
  phone: "+91-22-XXXXXXXX",
  manufacturingSites: [
    {
      location: "Daman, India",
      certifications: ["WHO-GMP Certified", "ISO 9001"],
      productCategories: ["Tablets", "Capsules", "Oral Liquids"]
    },
    {
      location: "Baddi, Himachal Pradesh, India",
      certifications: ["WHO-GMP Certified", "ISO 14001"],
      productCategories: ["Injectables", "Topical Preparations"]
    }
  ],
  qualityMetrics: {
    gmpCompliance: "Fully Compliant with Current Good Manufacturing Practices as per last CDSCO inspection",
    recallsLast5Years: 0,
    qualityRating: 4
  },
  products: [
    {
      id: "101",
      name: "Telekast (Montelukast)",
      generic: true,
      category: "Respiratory"
    },
    {
      id: "102",
      name: "Aristozyme",
      generic: false,
      category: "Digestive Enzymes"
    },
    {
      id: "103",
      name: "Telmikind (Telmisartan)",
      generic: true,
      category: "Cardiovascular"
    },
    {
      id: "104",
      name: "Aristo-D3",
      generic: true,
      category: "Vitamins & Supplements"
    }
  ],
  aboutGeneric: "Aristo Pharmaceuticals produces high-quality generic medications that meet all bioequivalence standards set by regulatory authorities. Their generic medicines are manufactured in the same facilities as their branded products, ensuring consistent quality and efficacy at affordable prices."
};

// Sample products for display
const productsList = [
  {
    id: "101",
    name: "Telekast 10mg",
    generic: true,
    genericName: "Montelukast",
    category: "Respiratory",
    price: 120.50,
    packSize: "10 tablets",
    availability: true
  },
  {
    id: "102",
    name: "Aristozyme Syrup",
    generic: false,
    genericName: "Digestive Enzymes Complex",
    category: "Digestive",
    price: 85.75,
    packSize: "200ml",
    availability: true
  },
  {
    id: "103",
    name: "Telmikind 40",
    generic: true,
    genericName: "Telmisartan",
    category: "Cardiovascular",
    price: 98.30,
    packSize: "10 tablets",
    availability: true
  },
  {
    id: "104",
    name: "Aristo-D3 60K",
    generic: true,
    genericName: "Cholecalciferol",
    category: "Vitamins & Supplements",
    price: 45.20,
    packSize: "4 capsules",
    availability: false
  },
  {
    id: "105",
    name: "Pantakind 40",
    generic: true,
    genericName: "Pantoprazole",
    category: "Gastrointestinal",
    price: 72.60,
    packSize: "10 tablets",
    availability: true
  },
  {
    id: "106",
    name: "Levokind 500",
    generic: true,
    genericName: "Levofloxacin",
    category: "Antibiotics",
    price: 165.40,
    packSize: "5 tablets",
    availability: true
  }
];

// Sample reviews for display
const reviewsList = [
  {
    id: "201",
    user: "Dr. Sunil Verma",
    isDoctor: true,
    rating: 5,
    date: "2023-12-15",
    title: "Consistent quality across their generics",
    content: "I've been prescribing Aristo's generic medications for over 5 years now. Their products consistently show good efficacy and minimal side effects. Particularly impressed with their cardiovascular and anti-diabetic range.",
    helpful: 24
  },
  {
    id: "202",
    user: "Manoj Kumar",
    isDoctor: false,
    rating: 4,
    date: "2023-11-20",
    title: "Good experience with their products",
    content: "I've been using Telmikind for my blood pressure for the last year. It works as effectively as the branded version I was using before but costs significantly less. Very satisfied with the quality.",
    helpful: 18
  },
  {
    id: "203",
    user: "Pharmacy Plus",
    isPharmacy: true,
    rating: 5,
    date: "2023-10-05",
    title: "Reliable supplier with good stock availability",
    content: "As a pharmacy owner, I've found Aristo to be a reliable supplier. Their generics are popular among customers due to good quality and affordability. They maintain consistent stock availability which helps us serve our customers better.",
    helpful: 32
  }
];

export default function ManufacturerDetailPage() {
  const { manufacturerId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // In a real app, this would fetch from API
  const { data: manufacturer, isLoading, error } = useQuery({
    queryKey: [`/api/manufacturers/${manufacturerId}`],
    queryFn: () => Promise.resolve({ manufacturer: manufacturerData }),
    enabled: !!manufacturerId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic would be implemented here
    console.log("Searching for:", searchQuery);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading manufacturer information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !manufacturer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading manufacturer details</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb & Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Button 
                variant="ghost" 
                className="flex items-center gap-1 mb-2"
                onClick={() => setLocation("/manufacturers")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Manufacturers
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                {manufacturer.manufacturer.name}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>

          {/* Manufacturer Profile */}
          <div className="mb-8">
            <ManufacturerProfile manufacturer={manufacturer.manufacturer} />
          </div>

          {/* Products & Reviews Tabs */}
          <div>
            <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full max-w-md mb-6">
                <TabsTrigger value="products" className="flex items-center gap-1">
                  <Grid3X3 className="h-4 w-4" />
                  <span>Products ({productsList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Reviews & Ratings ({reviewsList.length})</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="m-0">
                <div className="mb-6">
                  <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <Input 
                      placeholder={`Search ${manufacturer.manufacturer.name} products...`} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productsList.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-slate-500">{product.genericName}</p>
                          </div>
                          <Badge variant={product.generic ? "outline" : "secondary"} className={product.generic ? "bg-green-50 border-green-200" : ""}>
                            {product.generic ? "Generic" : "Brand"}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-sm text-slate-600">{product.category}</p>
                            <p className="text-sm text-slate-600">{product.packSize}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{product.price.toFixed(2)}</p>
                            <Badge variant={product.availability ? "outline" : "secondary"} className={product.availability ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                              {product.availability ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="w-full mt-4 text-primary"
                          onClick={() => setLocation(`/medicines/${product.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviewsList.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                                />
                              ))}
                            </div>
                            <p className="font-medium">{review.rating}/5</p>
                          </div>
                          <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{review.title}</h3>
                        <p className="text-sm text-slate-700 mb-3">{review.content}</p>
                        
                        <div className="flex justify-between items-center mt-4 pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">{review.user}</span>
                            {review.isDoctor && (
                              <Badge variant="secondary" className="text-xs">
                                Doctor
                              </Badge>
                            )}
                            {review.isPharmacy && (
                              <Badge variant="secondary" className="text-xs">
                                Pharmacy
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="m-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Regulatory Documents & Certifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">WHO-GMP Certificate</h4>
                              <p className="text-xs text-slate-500">Valid until: Dec 31, 2025</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">ISO 9001:2015 Certificate</h4>
                              <p className="text-xs text-slate-500">Valid until: Mar 15, 2024</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">Manufacturing License</h4>
                              <p className="text-xs text-slate-500">Valid until: Jul 10, 2026</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">Latest CDSCO Inspection Report</h4>
                              <p className="text-xs text-slate-500">Issued: Aug 22, 2023</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}