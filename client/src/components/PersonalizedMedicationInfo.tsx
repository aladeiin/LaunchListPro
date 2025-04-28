import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, ChevronRight, HeartPulse, Clock, Pill, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface MedicationDetailProps {
  medicineName: string;
}

interface MedicationInfo {
  name: string;
  genericName: string;
  activeIngredient: string;
  alternatives: any[];
  description: string;
  sideEffects: string[];
  interactions: string[];
  dosage: string;
  usage: string;
  price: number;
}

export default function PersonalizedMedicationInfo({ medicineName }: MedicationDetailProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("usage");

  const { data, isLoading, error } = useQuery<{ medicationInfo: MedicationInfo }>({
    queryKey: [`/api/medication-info/${medicineName}`],
    enabled: Boolean(medicineName),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p>Loading personalized information...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">Could not load medication information</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  const { medicationInfo } = data;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Medication Information</CardTitle>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary"
            onClick={() => setLocation(`/medicines/${encodeURIComponent(medicineName)}`)}
          >
            Full Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <CardDescription>
          Tailored information about {medicineName} and its generic alternatives
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="usage" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b grid grid-cols-4">
            <TabsTrigger value="usage" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <HeartPulse className="h-4 w-4" />
                <span className="text-xs">Usage</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="side-effects" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Side Effects</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="dosage" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Dosage</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="alternatives" className="rounded-none">
              <div className="flex flex-col items-center gap-1">
                <Pill className="h-4 w-4" />
                <span className="text-xs">Alternatives</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[300px]">
            <TabsContent value="usage" className="p-4 m-0">
              <h3 className="font-semibold mb-2">What is {medicineName} used for?</h3>
              <p className="text-sm text-slate-700">{medicationInfo.usage}</p>
              <h3 className="font-semibold mt-4 mb-2">How it Works</h3>
              <p className="text-sm text-slate-700">{medicationInfo.description}</p>
            </TabsContent>
            
            <TabsContent value="side-effects" className="p-4 m-0">
              <h3 className="font-semibold mb-3">Possible Side Effects</h3>
              <ul className="space-y-2">
                {medicationInfo.sideEffects.map((effect, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-primary">•</span> {effect}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <p className="text-xs text-yellow-800">
                  Contact your doctor immediately if you experience severe side effects or allergic reactions.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="dosage" className="p-4 m-0">
              <h3 className="font-semibold mb-2">Recommended Dosage</h3>
              <p className="text-sm text-slate-700">{medicationInfo.dosage}</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-xs text-blue-800">
                  Always follow your doctor's instructions. The dosage information provided is general and may not apply to your specific condition.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="alternatives" className="p-4 m-0">
              <h3 className="font-semibold mb-3">Generic Alternatives</h3>
              {medicationInfo.alternatives.length > 0 ? (
                <div className="space-y-3">
                  {medicationInfo.alternatives.slice(0, 5).map((alt, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium text-sm">{alt.name}</p>
                        <p className="text-xs text-slate-500">By {alt.manufacturer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">₹{alt.price.toFixed(2)}</p>
                        {alt.price < medicationInfo.price && (
                          <p className="text-xs text-green-600">
                            Save ₹{(medicationInfo.price - alt.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {medicationInfo.alternatives.length > 5 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => {
                        setLocation(`/medicines/${encodeURIComponent(medicineName)}/alternatives`);
                      }}
                    >
                      View All Alternatives
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No alternatives found for this medication.</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}