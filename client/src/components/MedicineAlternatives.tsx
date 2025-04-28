import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownIcon, Pill, AlertCircle, Database, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicineAlternativesProps {
  medicineName: string;
  limit?: number;
  showExternalData?: boolean;
}

interface AlternativesResponse {
  requestedMedicine: Medicine;
  alternatives: (Medicine & {
    priceDifference: number;
    percentageSavings: number;
  })[];
  count: number;
}

interface ExternalAlternativesResponse {
  source: string;
  originalMedicineName: string;
  alternatives: any[];
}

const MedicineAlternatives: React.FC<MedicineAlternativesProps> = ({ 
  medicineName,
  limit = 5,
  showExternalData = true
}) => {
  const [dataSource, setDataSource] = useState<'internal' | 'external'>('internal');
  
  // Internal database query
  const { data, isLoading, error } = useQuery<AlternativesResponse>({
    queryKey: ['/api/alternatives', medicineName],
    queryFn: async () => {
      const res = await fetch(`/api/alternatives/${encodeURIComponent(medicineName)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch alternatives');
      }
      return res.json();
    },
    enabled: !!medicineName
  });
  
  // External data query (1mg)
  const { 
    data: externalData, 
    isLoading: isLoadingExternal, 
    error: externalError 
  } = useQuery<ExternalAlternativesResponse>({
    queryKey: ['/api/external-data/alternatives', medicineName],
    queryFn: async () => {
      const res = await fetch(`/api/external-data/alternatives/${encodeURIComponent(medicineName)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch external alternatives');
      }
      return res.json();
    },
    enabled: !!medicineName && showExternalData
  });

  if (isLoading && isLoadingExternal) {
    return <AlternativesSkeleton />;
  }

  if (error && externalError && !showExternalData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load alternative medicines. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const hasInternalData = data && data.alternatives && data.alternatives.length > 0;
  const hasExternalData = externalData && externalData.alternatives && externalData.alternatives.length > 0;
  
  // Return early if both data sources have no data
  if (!hasInternalData && !hasExternalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Alternative Medicines</CardTitle>
          <CardDescription>No alternatives found for this medicine</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't find any alternatives with the same active ingredient 
            {data?.requestedMedicine?.activeIngredient && `(${data.requestedMedicine.activeIngredient})`}.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the requested medicine details and their alternatives
  const internalMedicine = hasInternalData ? data.requestedMedicine : null;
  const internalAlternatives = hasInternalData ? data.alternatives.slice(0, limit) : [];
  const internalCount = hasInternalData ? data.count : 0;
  
  // External data
  const externalAlternatives = hasExternalData ? externalData.alternatives.slice(0, limit) : [];
  const externalCount = hasExternalData ? externalData.alternatives.length : 0;
  
  // Calculate total alternatives count
  const hasMultipleDataSources = hasInternalData && hasExternalData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Alternative Medicines</CardTitle>
            <CardDescription>
              {hasMultipleDataSources ? (
                <>Found alternatives from multiple sources</>
              ) : hasInternalData && internalMedicine ? (
                <>Found {internalCount} alternatives with the same active ingredient: {" "}
                  <span className="font-medium">{internalMedicine.activeIngredient}</span>
                </>
              ) : (
                <>Found {externalCount} alternatives from external sources</>
              )}
            </CardDescription>
          </div>
          {internalMedicine && (
            <Badge variant="outline" className="ml-2">
              {internalMedicine.isGeneric ? 'Generic' : 'Brand'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Original medicine info */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            You searched for: <span className="font-medium">{medicineName}</span>
            {internalMedicine && (
              <> - ₹{internalMedicine.price?.toFixed(2) || "N/A"}</>
            )}
          </p>
        </div>
        
        {/* Data source tabs */}
        {hasMultipleDataSources && (
          <Tabs defaultValue="internal" className="mb-4" onValueChange={(value) => setDataSource(value as 'internal' | 'external')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="internal" className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                <span>Database</span>
              </TabsTrigger>
              <TabsTrigger value="external" className="flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>External</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="internal">
              {hasInternalData ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internalAlternatives.map((alt) => (
                      <TableRow key={alt.id}>
                        <TableCell>
                          <Link to={`/medicines/${alt.id}`} className="hover:underline text-primary font-medium">
                            {alt.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{alt.dosage}</div>
                        </TableCell>
                        <TableCell className="text-sm">{alt.manufacturer}</TableCell>
                        <TableCell className="font-medium">₹{alt.price?.toFixed(2) || "N/A"}</TableCell>
                        <TableCell>
                          {alt.percentageSavings > 0 ? (
                            <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Save {alt.percentageSavings.toFixed(0)}%
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No savings</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No alternatives found in our database.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="external">
              {isLoadingExternal ? (
                <div className="text-center py-4">
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              ) : hasExternalData ? (
                <div>
                  <div className="text-xs text-muted-foreground mb-3 flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Data source: {externalData.source}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {externalAlternatives.map((alt, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="text-primary font-medium">
                              {alt.name}
                            </span>
                            <div className="text-xs text-muted-foreground">{alt.dosage}</div>
                          </TableCell>
                          <TableCell className="text-sm">{alt.manufacturer}</TableCell>
                          <TableCell className="font-medium">₹{alt.price?.toFixed(2) || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No external alternatives found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Single data source display */}
        {!hasMultipleDataSources && (
          <>
            {hasInternalData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalAlternatives.map((alt) => (
                    <TableRow key={alt.id}>
                      <TableCell>
                        <Link to={`/medicines/${alt.id}`} className="hover:underline text-primary font-medium">
                          {alt.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{alt.dosage}</div>
                      </TableCell>
                      <TableCell className="text-sm">{alt.manufacturer}</TableCell>
                      <TableCell className="font-medium">₹{alt.price?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>
                        {alt.percentageSavings > 0 ? (
                          <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Save {alt.percentageSavings.toFixed(0)}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No savings</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {hasExternalData && !hasInternalData && (
              <div>
                <div className="text-xs text-muted-foreground mb-3 flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Data source: {externalData.source}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {externalAlternatives.map((alt, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <span className="text-primary font-medium">
                            {alt.name}
                          </span>
                          <div className="text-xs text-muted-foreground">{alt.dosage}</div>
                        </TableCell>
                        <TableCell className="text-sm">{alt.manufacturer}</TableCell>
                        <TableCell className="font-medium">₹{alt.price?.toFixed(2) || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Footer with view all button */}
      {((hasInternalData && internalCount > limit) || 
         (hasExternalData && externalCount > limit)) && (
        <CardFooter className="flex justify-center">
          {dataSource === 'internal' && internalCount > limit ? (
            <Button variant="outline" className="w-full">
              View All Alternatives ({internalCount})
            </Button>
          ) : dataSource === 'external' && externalCount > limit ? (
            <Button variant="outline" className="w-full">
              View All External Alternatives ({externalCount})
            </Button>
          ) : (
            <Button variant="outline" className="w-full">
              View All Alternatives
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

const AlternativesSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default MedicineAlternatives;