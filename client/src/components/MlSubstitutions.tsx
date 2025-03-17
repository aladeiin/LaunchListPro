import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, BrainCircuit, InfoIcon, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/medicine-data';

export interface SubstitutionRecommendation {
  medicine: Medicine;
  similarityScore: number;
  reasonsForSubstitution: string[];
  warningsOrCautions: string[];
  dosageAdjustment?: string;
  savingsPercentage?: number;
}

interface MlSubstitutionsProps {
  medicineName: string;
  originalMedicine: Medicine;
}

export default function MlSubstitutions({ 
  medicineName, 
  originalMedicine 
}: MlSubstitutionsProps) {
  const [selectedSubstitute, setSelectedSubstitute] = useState<Medicine | null>(null);
  const [analysisTab, setAnalysisTab] = useState('similarities');

  // Fetch ML-powered substitution recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/ml-substitution', medicineName],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/ml-substitution/${encodeURIComponent(medicineName)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch ML substitution recommendations');
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching ML substitution recommendations:', error);
        return { recommendations: [] };
      }
    },
    initialData: { recommendations: [] }
  });

  // Fetch detailed analysis between original medicine and selected substitute
  const { data: analysisData, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['/api/ml-substitution/analyze', medicineName, selectedSubstitute?.name],
    queryFn: async () => {
      try {
        if (!selectedSubstitute) {
          return null;
        }
        
        const res = await fetch(
          `/api/ml-substitution/analyze/${encodeURIComponent(medicineName)}/${encodeURIComponent(selectedSubstitute.name)}`
        );
        
        if (!res.ok) {
          throw new Error('Failed to fetch substitution analysis');
        }
        
        return res.json();
      } catch (error) {
        console.error('Error fetching substitution analysis:', error);
        return null;
      }
    },
    enabled: !!selectedSubstitute,
    initialData: null
  });

  // Format similarity score as percentage
  const formatSimilarityScore = (score: number) => {
    return `${(score * 100).toFixed(0)}%`;
  };

  // Get color class based on similarity score
  const getSimilarityColorClass = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center">
            <BrainCircuit className="mr-2 h-6 w-6 text-primary" />
            AI-Powered Substitution Recommendations
          </h3>
          <p className="text-muted-foreground">
            Our ML model analyzed the medicine profile to find the most suitable alternatives
          </p>
        </div>
      </div>

      {isLoadingRecommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="pt-6">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendationsData.recommendations.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 flex flex-col items-center text-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Suitable Alternatives Found</h3>
            <p className="text-muted-foreground mb-4">
              Our AI model couldn't find appropriate substitutions for this medicine.
              This may be because it has a unique formulation or specific properties.
            </p>
            <Badge variant="outline" className="px-3 py-1">
              Always consult a healthcare professional for medical advice
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendationsData.recommendations.map((recommendation: SubstitutionRecommendation, index: number) => (
              <Card 
                key={index} 
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  selectedSubstitute?.name === recommendation.medicine.name ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold">{recommendation.medicine.name}</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.medicine.genericName}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getSimilarityColorClass(recommendation.similarityScore)}`}
                    >
                      {formatSimilarityScore(recommendation.similarityScore)} Match
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm space-y-1 mt-2">
                      {recommendation.reasonsForSubstitution.slice(0, 2).map((reason, i) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xl text-primary">₹{formatPrice(recommendation.medicine.price)}</p>
                      {recommendation.savingsPercentage && recommendation.savingsPercentage > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Save {recommendation.savingsPercentage}%
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={() => setSelectedSubstitute(recommendation.medicine)}
                      variant={selectedSubstitute?.name === recommendation.medicine.name ? "default" : "outline"}
                    >
                      {selectedSubstitute?.name === recommendation.medicine.name ? 'Selected' : 'Compare'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedSubstitute && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <InfoIcon className="h-5 w-5 mr-2 text-primary" />
                  Detailed Comparison: {originalMedicine.name} vs {selectedSubstitute.name}
                </CardTitle>
                <CardDescription>
                  AI-generated analysis of similarities, differences, and substitution guidance
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingAnalysis ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : !analysisData ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                    <p>Analysis data unavailable. Please try again.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <Badge 
                        variant="outline" 
                        className={`${getSimilarityColorClass(analysisData.efficacyScore)} px-3 py-1.5 text-base`}
                      >
                        Efficacy Score: {formatSimilarityScore(analysisData.efficacyScore)}
                      </Badge>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2">
                              <InfoIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Efficacy score represents the therapeutic equivalence between the original medicine and substitute.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <Tabs className="mt-4" onValueChange={setAnalysisTab} value={analysisTab}>
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="similarities">Analysis</TabsTrigger>
                        <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
                        <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="similarities" className="mt-4 space-y-4">
                        <div className="prose max-w-none dark:prose-invert">
                          <p>{analysisData.detailedAnalysis}</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="side-effects" className="mt-4">
                        <div className="space-y-2">
                          <div className="flex items-start mb-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                            <h4 className="font-medium">Potential Differences in Side Effects</h4>
                          </div>
                          <ul className="space-y-2 pl-7 list-disc">
                            {analysisData.potentialSideEffects.map((effect: string, i: number) => (
                              <li key={i}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="usage" className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Recommended Usage</h4>
                          <p className="text-muted-foreground">{analysisData.recommendedUsage}</p>
                        </div>
                        
                        {analysisData.additionalNotes && (
                          <div>
                            <h4 className="font-medium mb-2">Additional Notes</h4>
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p>{analysisData.additionalNotes}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 text-sm mt-4">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                            <p>
                              This information is provided as a general guide only. Always consult with a healthcare
                              professional before changing medications or dosages.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <div className="text-center bg-muted/30 p-4 rounded-lg mt-8">
        <p className="text-sm text-muted-foreground">
          Our AI-powered medicine substitution model uses advanced algorithms to analyze medicine compositions,
          efficacy, and patient outcomes data to provide personalized recommendations.
          All suggestions should be reviewed by a healthcare professional.
        </p>
      </div>
    </div>
  );
}