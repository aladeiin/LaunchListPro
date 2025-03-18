import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ThumbsUp, 
  ThumbsDown,
  Pill,
  ListChecks,
  FlaskConical,
  BadgePercent,
  AlertTriangle 
} from "lucide-react";

// Types for wizard steps
enum WizardStep {
  SYMPTOM_SELECTION = 0,
  SYMPTOM_DETAILS = 1,
  CONDITION_RESULTS = 2,
  MEDICINE_RECOMMENDATIONS = 3
}

// Symptom interface
interface Symptom {
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  timeOfDay?: string;
  triggeredBy?: string;
  relievedBy?: string;
}

// Condition interface
interface Condition {
  name: string;
  confidence: number;
  description: string;
  commonTreatments: string[];
}

// Medicine recommendation interface
interface MedicineRecommendation {
  medicine: {
    id: number;
    name: string;
    genericName: string;
    manufacturer: string;
    price: number;
    isGeneric: boolean;
    activeIngredient: string;
    dosage: string;
    description: string;
    imageUrl?: string;
  };
  conditionTreated: string;
  confidenceScore: number;
  dosageRecommendation?: string;
  warnings: string[];
  sideEffects: string[];
}

// Category interface
interface SymptomCategory {
  name: string;
  symptoms: string[];
}

// Form schema for symptom details
const symptomFormSchema = z.object({
  description: z.string().min(3, "Please describe your symptom"),
  severity: z.enum(["mild", "moderate", "severe"], {
    required_error: "Please select symptom severity",
  }),
  duration: z.string().min(1, "Please provide duration"),
  timeOfDay: z.string().optional(),
  triggeredBy: z.string().optional(),
  relievedBy: z.string().optional(),
});

type SymptomFormValues = z.infer<typeof symptomFormSchema>;

export default function SymptomWizard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(WizardStep.SYMPTOM_SELECTION);
  const [selectedSymptomType, setSelectedSymptomType] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [recommendations, setRecommendations] = useState<MedicineRecommendation[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Form setup for symptom details
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      description: "",
      severity: "moderate",
      duration: "",
      timeOfDay: "",
      triggeredBy: "",
      relievedBy: "",
    },
  });
  
  // Define type for categories response
  interface CategoriesResponse {
    categories: SymptomCategory[];
  }

  // Fetch symptom categories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery<CategoriesResponse>({
    queryKey: ["/api/symptom-wizard/categories"],
    retry: 1
  });
  
  // Define response types
  interface AnalyzeResponse {
    conditions: Condition[];
  }

  interface RecommendationsResponse {
    recommendations: MedicineRecommendation[];
  }

  // Analyze symptoms mutation
  const analyzeMutation = useMutation<AnalyzeResponse, Error, { symptoms: Symptom[] }>({
    mutationFn: async (data: { symptoms: Symptom[] }) => {
      return apiRequest<AnalyzeResponse>("/api/symptom-wizard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setConditions(data.conditions);
      setCurrentStep(WizardStep.CONDITION_RESULTS);
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        variant: "destructive",
      });
    },
  });
  
  // Get recommendations mutation
  const recommendationsMutation = useMutation<RecommendationsResponse, Error, { conditions: Condition[] }>({
    mutationFn: async (data: { conditions: Condition[] }) => {
      return apiRequest<RecommendationsResponse>("/api/symptom-wizard/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setCurrentStep(WizardStep.MEDICINE_RECOMMENDATIONS);
    },
    onError: (error) => {
      toast({
        title: "Failed to get recommendations",
        description: error instanceof Error ? error.message : "Could not fetch medicine recommendations",
        variant: "destructive",
      });
    },
  });
  
  // Reset form when going back to symptom selection
  useEffect(() => {
    if (currentStep === WizardStep.SYMPTOM_SELECTION) {
      setSelectedSymptomType(null);
      form.reset({
        description: "",
        severity: "moderate",
        duration: "",
        timeOfDay: "",
        triggeredBy: "",
        relievedBy: "",
      });
    }
  }, [currentStep, form]);
  
  // Handle adding a symptom
  const handleAddSymptom = (values: SymptomFormValues) => {
    const newSymptom: Symptom = {
      ...values,
    };
    
    setSymptoms([...symptoms, newSymptom]);
    toast({
      title: "Symptom added",
      description: `"${values.description}" has been added to your list.`,
    });
    
    // Reset form for next symptom
    form.reset({
      description: "",
      severity: "moderate",
      duration: "",
      timeOfDay: "",
      triggeredBy: "",
      relievedBy: "",
    });
    
    // Go back to symptom selection
    setCurrentStep(WizardStep.SYMPTOM_SELECTION);
    setSelectedSymptomType(null);
  };
  
  // Handle symptom selection
  const handleSymptomSelect = (symptom: string) => {
    form.setValue("description", symptom);
    setSelectedSymptomType(symptom);
    setCurrentStep(WizardStep.SYMPTOM_DETAILS);
  };
  
  // Handle analyzing symptoms
  const handleAnalyzeSymptoms = () => {
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms added",
        description: "Please add at least one symptom before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    analyzeMutation.mutate({ symptoms });
  };
  
  // Handle getting recommendations
  const handleGetRecommendations = () => {
    recommendationsMutation.mutate({ conditions });
  };
  
  // Handle removing a symptom
  const handleRemoveSymptom = (index: number) => {
    const updatedSymptoms = [...symptoms];
    updatedSymptoms.splice(index, 1);
    setSymptoms(updatedSymptoms);
    
    toast({
      title: "Symptom removed",
      description: "The symptom has been removed from your list.",
    });
  };
  
  // Reset wizard
  const resetWizard = () => {
    setCurrentStep(WizardStep.SYMPTOM_SELECTION);
    setSymptoms([]);
    setConditions([]);
    setRecommendations([]);
    setSelectedSymptomType(null);
    form.reset();
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.round(((currentStep + 1) / 4) * 100);
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.SYMPTOM_SELECTION:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select or Describe Your Symptoms</h3>
              {symptoms.length > 0 && (
                <Button 
                  onClick={handleAnalyzeSymptoms}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? "Analyzing..." : "Analyze Symptoms"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            
            {symptoms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Your symptoms:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="py-1 px-3">
                      {symptom.description} 
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({symptom.severity}, {symptom.duration})
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-2"
                        onClick={() => handleRemoveSymptom(index)}
                      >
                        ✕
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            )}
            
            {!categoriesLoading && categoriesData && categoriesData.categories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoriesData.categories.map((category: SymptomCategory) => (
                  <Card key={category.name} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 py-2">
                      <CardTitle className="text-md">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 gap-2">
                        {category.symptoms.map((symptom) => (
                          <Button
                            key={symptom}
                            variant="outline"
                            className="justify-start text-left h-auto py-2"
                            onClick={() => handleSymptomSelect(symptom)}
                          >
                            {symptom}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-[120px] mb-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-8 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {categoriesError && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                  <p className="text-sm text-destructive">
                    Error loading symptom categories. Please try again later.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Can't find your symptom? Describe it manually:
              </p>
              <div className="flex gap-2 mt-2">
                <Input 
                  placeholder="Enter your symptom..."
                  value={form.watch("description")}
                  onChange={(e) => form.setValue("description", e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (form.getValues("description").length > 2) {
                      setCurrentStep(WizardStep.SYMPTOM_DETAILS);
                    } else {
                      toast({
                        title: "Symptom description required",
                        description: "Please enter a symptom description (at least 3 characters).",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
        
      case WizardStep.SYMPTOM_DETAILS:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(WizardStep.SYMPTOM_SELECTION)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <h3 className="text-lg font-medium ml-2">
                Provide details about: {form.getValues("description")}
              </h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddSymptom)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mild" id="mild" />
                            <Label htmlFor="mild">Mild - Noticeable but not interfering with daily activities</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="moderate" id="moderate" />
                            <Label htmlFor="moderate">Moderate - Causes some discomfort or interference</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="severe" id="severe" />
                            <Label htmlFor="severe">Severe - Significantly impacts daily activities</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 2 days, 1 week, several hours" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        How long have you been experiencing this symptom?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Day (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., morning, evening, after meals" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Is the symptom worse at particular times?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="triggeredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triggered By (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., certain foods, activities, stress" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Does anything seem to trigger or worsen this symptom?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relievedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relieved By (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., rest, certain positions, home remedies" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Does anything help relieve this symptom?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="submit">
                    Add Symptom <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
        
      case WizardStep.CONDITION_RESULTS:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(WizardStep.SYMPTOM_SELECTION)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Symptoms
              </Button>
              
              <Button
                onClick={handleGetRecommendations}
                disabled={recommendationsMutation.isPending}
              >
                {recommendationsMutation.isPending ? "Getting Recommendations..." : "Get Medicine Recommendations"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Potential Conditions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your symptoms, these conditions may be relevant. This is not a medical diagnosis.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {conditions.length > 0 ? (
                conditions.map((condition, index) => (
                  <Card key={index} className={condition.confidence > 70 ? "border-primary/50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">{condition.name}</CardTitle>
                        <Badge variant={condition.confidence > 70 ? "default" : "outline"}>
                          {condition.confidence}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm mb-3">{condition.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <h4 className="text-xs font-medium mr-2">Common treatments:</h4>
                        {condition.commonTreatments.map((treatment, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {treatment}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No conditions identified.</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col mt-6 gap-3">
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Health Notice</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      This information is for reference only and does not constitute medical advice. 
                      For serious or persistent symptoms, please consult a healthcare professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case WizardStep.MEDICINE_RECOMMENDATIONS:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(WizardStep.CONDITION_RESULTS)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Conditions
              </Button>
              
              <Button
                variant="outline"
                onClick={resetWizard}
              >
                Start New Consultation
              </Button>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Recommended Medications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These medications may help with your symptoms. Always read labels and follow dosage instructions.
            </p>
            
            <Tabs defaultValue="overview" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Medicine Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((recommendation, index) => (
                      <Card key={index} className={index === 0 ? "border-primary/50" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-md">{recommendation.medicine.name}</CardTitle>
                              <CardDescription>
                                {recommendation.medicine.genericName || recommendation.medicine.activeIngredient}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{recommendation.medicine.price}</p>
                              <Badge variant={recommendation.medicine.isGeneric ? "outline" : "secondary"} className="mt-1">
                                {recommendation.medicine.isGeneric ? "Generic" : "Branded"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between text-sm mb-2">
                            <span>For: {recommendation.conditionTreated}</span>
                            <span>{recommendation.confidenceScore}% match</span>
                          </div>
                          <p className="text-sm line-clamp-2 mb-2">
                            {recommendation.dosageRecommendation}
                          </p>
                          {recommendation.warnings.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> 
                                {recommendation.warnings[0]}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <div className="text-xs text-muted-foreground">
                            Manufactured by {recommendation.medicine.manufacturer}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground">No recommendations available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <div className="space-y-6">
                  {recommendations.length > 0 ? (
                    recommendations.map((recommendation, index) => (
                      <Card key={index} className={index === 0 ? "border-primary/50" : ""}>
                        <CardHeader>
                          <CardTitle className="text-md flex items-center">
                            <Pill className="h-5 w-5 mr-2" />
                            {recommendation.medicine.name}
                          </CardTitle>
                          <CardDescription>
                            {recommendation.medicine.isGeneric 
                              ? `Generic medication containing ${recommendation.medicine.activeIngredient}`
                              : `Branded medication by ${recommendation.medicine.manufacturer}`
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium flex items-center mb-1">
                              <ListChecks className="h-4 w-4 mr-2" />
                              Recommended Dosage
                            </h4>
                            <p className="text-sm pl-6">{recommendation.dosageRecommendation}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium flex items-center mb-1">
                              <BadgePercent className="h-4 w-4 mr-2" />
                              Pricing
                            </h4>
                            <p className="text-sm pl-6">
                              ₹{recommendation.medicine.price} for {recommendation.medicine.dosage || 'standard dosage'}
                            </p>
                          </div>
                          
                          {recommendation.warnings.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium flex items-center mb-1 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Warnings & Precautions
                              </h4>
                              <ul className="text-sm pl-6 space-y-1">
                                {recommendation.warnings.map((warning, i) => (
                                  <li key={i} className="list-disc ml-4">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {recommendation.sideEffects.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium flex items-center mb-1">
                                <FlaskConical className="h-4 w-4 mr-2" />
                                Possible Side Effects
                              </h4>
                              <ul className="text-sm pl-6 space-y-1">
                                {recommendation.sideEffects.map((effect, i) => (
                                  <li key={i} className="list-disc ml-4">{effect}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">For treating</h4>
                            <Badge className="mr-2">{recommendation.conditionTreated}</Badge>
                            <Badge variant="outline">{recommendation.confidenceScore}% match</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No detailed recommendations available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col mt-6 gap-3">
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Medical Disclaimer</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      The recommendations provided are for informational purposes only and not a substitute for professional medical advice. 
                      Always consult with a healthcare professional before starting any medication.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">About Price Comparisons</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prices shown are estimated retail prices in Indian Rupees (₹). Actual prices may vary by location and pharmacy.
                      Generic alternatives may offer significant cost savings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-xl">Symptom-to-Medicine Matchmaker</CardTitle>
          <CardDescription>
            Find appropriate over-the-counter medications based on your symptoms
          </CardDescription>
          <Progress value={progressPercentage} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}