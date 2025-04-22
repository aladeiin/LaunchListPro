import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medicine } from '@shared/schema';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownIcon, Pill, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MedicineAlternativesProps {
  medicineName: string;
  limit?: number;
}

interface AlternativesResponse {
  requestedMedicine: Medicine;
  alternatives: (Medicine & {
    priceDifference: number;
    percentageSavings: number;
  })[];
  count: number;
}

const MedicineAlternatives: React.FC<MedicineAlternativesProps> = ({ 
  medicineName,
  limit = 5
}) => {
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

  if (isLoading) {
    return <AlternativesSkeleton />;
  }

  if (error) {
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

  if (!data || !data.alternatives || data.alternatives.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Alternative Medicines</CardTitle>
          <CardDescription>No alternatives found for this medicine</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't find any alternatives with the same active ingredient ({data?.requestedMedicine?.activeIngredient}).
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the requested medicine details
  const { requestedMedicine, alternatives, count } = data;
  
  // Limit the number of alternatives to display
  const displayedAlternatives = alternatives.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Alternative Medicines</CardTitle>
            <CardDescription>
              Found {count} alternatives with the same active ingredient: {" "}
              <span className="font-medium">{requestedMedicine.activeIngredient}</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {requestedMedicine.isGeneric ? 'Generic' : 'Brand'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            You searched for: <span className="font-medium">{requestedMedicine.name}</span>
            {" "} - ₹{requestedMedicine.price?.toFixed(2) || "N/A"}
          </p>
        </div>
        
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
            {displayedAlternatives.map((alt) => (
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
      </CardContent>
      {count > limit && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" className="w-full">
            View All Alternatives ({count})
          </Button>
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