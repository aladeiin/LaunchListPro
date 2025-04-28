import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Factory, 
  FileText, 
  Globe, 
  Info, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  ThumbsUp 
} from "lucide-react";

interface ManufacturerProfileProps {
  manufacturer: {
    id: string;
    name: string;
    logo?: string;
    description: string;
    established: string;
    headquarters: string;
    certifications: string[];
    website: string;
    email: string;
    phone: string;
    manufacturingSites: Array<{
      location: string;
      certifications: string[];
      productCategories: string[];
    }>;
    qualityMetrics: {
      gmpCompliance: string;
      recallsLast5Years: number;
      qualityRating: number;
    };
    products: Array<{
      id: string;
      name: string;
      generic: boolean;
      category: string;
    }>;
    aboutGeneric: string;
  };
}

export default function ManufacturerProfile({ manufacturer }: ManufacturerProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-md shadow-sm border">
              {manufacturer.logo ? (
                <img 
                  src={manufacturer.logo} 
                  alt={`${manufacturer.name} logo`} 
                  className="h-12 w-12 object-contain" 
                />
              ) : (
                <Building className="h-12 w-12 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{manufacturer.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                <span>Established {manufacturer.established}</span>
              </CardDescription>
            </div>
          </div>
          <div className="hidden md:flex flex-wrap gap-1">
            {manufacturer.certifications.slice(0, 2).map((cert, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                {cert}
              </Badge>
            ))}
            {manufacturer.certifications.length > 2 && (
              <Badge variant="outline">+{manufacturer.certifications.length - 2} more</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b grid grid-cols-4">
            <TabsTrigger value="overview" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <Info className="h-4 w-4" />
                <span className="text-xs">Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="facilities" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <Factory className="h-4 w-4" />
                <span className="text-xs">Facilities</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="quality" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Quality</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Products</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="overview" className="m-0">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About {manufacturer.name}</h3>
                  <p className="text-sm text-slate-700">{manufacturer.description}</p>
                </div>
                
                {manufacturer.aboutGeneric && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <h3 className="font-semibold text-blue-800 mb-1">About their Generic Medications</h3>
                    <p className="text-sm text-blue-700">{manufacturer.aboutGeneric}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Headquarters</h4>
                      <p className="text-sm text-slate-600">{manufacturer.headquarters}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Contact Email</h4>
                      <a href={`mailto:${manufacturer.email}`} className="text-sm text-primary">
                        {manufacturer.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Phone</h4>
                      <p className="text-sm text-slate-600">{manufacturer.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Certifications & Compliance</h3>
                  <div className="flex flex-wrap gap-2">
                    {manufacturer.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <Button variant="outline" className="flex items-center gap-1" asChild>
                    <a href={manufacturer.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                  
                  <Button variant="ghost" className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    Report Issue
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="facilities" className="m-0">
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">Manufacturing Facilities</h3>
                <div className="space-y-4">
                  {manufacturer.manufacturingSites.map((site, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Factory className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{site.location}</h4>
                            <p className="text-xs text-slate-500 mt-1">Product Categories:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {site.productCategories.map((category, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <h5 className="text-xs text-slate-500 mb-1">Certifications:</h5>
                        <div className="flex flex-wrap gap-1">
                          {site.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 border-green-200 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="m-0">
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">Quality & Compliance Information</h3>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">GMP Compliance Status</h4>
                  <p className="text-sm text-green-700">{manufacturer.qualityMetrics.gmpCompliance}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium mb-1">Product Recalls (Last 5 Years)</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-slate-700">
                        {manufacturer.qualityMetrics.recallsLast5Years}
                      </p>
                      <Badge 
                        variant={manufacturer.qualityMetrics.recallsLast5Years === 0 ? "outline" : "secondary"}
                        className={manufacturer.qualityMetrics.recallsLast5Years === 0 ? "bg-green-50 border-green-200" : ""}
                      >
                        {manufacturer.qualityMetrics.recallsLast5Years === 0 
                          ? "No Recalls" 
                          : `${manufacturer.qualityMetrics.recallsLast5Years} Recalls`}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium mb-1">Quality Rating</h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            i < manufacturer.qualityMetrics.qualityRating 
                              ? "bg-green-500" 
                              : "bg-slate-200"
                          }`}
                        >
                          {i < manufacturer.qualityMetrics.qualityRating && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                      ))}
                      <span className="ml-2 font-medium">
                        {manufacturer.qualityMetrics.qualityRating}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700">
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Quality ratings are based on regulatory compliance history, manufacturing 
                      standards adherence, and product quality consistency as reported by 
                      regulatory authorities.
                    </span>
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="m-0">
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">Popular Products by {manufacturer.name}</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {manufacturer.products.map((product, index) => (
                    <div key={index} className="border rounded-md p-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={product.generic ? "outline" : "secondary"} className={product.generic ? "bg-green-50 border-green-200" : ""}>
                            {product.generic ? "Generic" : "Brand"}
                          </Badge>
                          <span className="text-xs text-slate-500">{product.category}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary"
                        onClick={() => {/* View product details */}}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  View All Products by {manufacturer.name}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}