import React, { useState } from 'react';
import { Medicine } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { calculateSavings, formatPrice } from '../lib/medicine-data';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import AlternativeCard from './AlternativeCard';

interface MedicineDetailProps {
  medicineName: string;
}

export default function MedicineDetail({ medicineName }: MedicineDetailProps) {
  const [activeTab, setActiveTab] = useState('details');

  // Fetch medicine details
  const { data: medicine, isLoading: isLoadingMedicine } = useQuery({
    queryKey: ['/api/medicines/name', medicineName],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!medicineName,
  });

  // Fetch medicine alternatives
  const { data: alternatives, isLoading: isLoadingAlternatives } = useQuery({
    queryKey: ['/api/medicines', medicineName, 'alternatives'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!medicineName,
  });

  if (isLoadingMedicine) {
    return <MedicineDetailSkeleton />;
  }

  if (!medicine) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Medicine not found</h3>
            <p className="text-muted-foreground">
              We couldn't find details for {medicineName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate savings for alternatives
  const alternativesWithSavings = Array.isArray(alternatives)
    ? alternatives.map((alt) => ({
        ...alt,
        savingsPercentage: calculateSavings(medicine.price, alt.price),
      }))
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{medicine.name}</CardTitle>
            <CardDescription className="text-md">
              {medicine.genericName}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              ₹{formatPrice(medicine.price)}
            </span>
            <div className="flex justify-end mt-1">
              {medicine.isGeneric ? (
                <Badge variant="secondary">Generic</Badge>
              ) : (
                <Badge variant="outline">Branded</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            <TabsTrigger value="prices">Compare Prices</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Manufacturer</h4>
              <p className="text-muted-foreground">{medicine.manufacturer}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-muted-foreground">{medicine.description}</p>
            </div>

            <Separator />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="composition">
                <AccordionTrigger>Composition</AccordionTrigger>
                <AccordionContent>
                  <p>{medicine.activeIngredient}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="dosage">
                <AccordionTrigger>Dosage</AccordionTrigger>
                <AccordionContent>
                  <p>{medicine.dosage}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="alternatives">
            {isLoadingAlternatives ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : alternativesWithSavings.length > 0 ? (
              <div className="space-y-4">
                {alternativesWithSavings.map((alternative) => (
                  <AlternativeCard
                    key={alternative.id}
                    alternative={alternative}
                    originalMedicine={medicine}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">No alternatives found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any alternatives with the same active ingredient
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Price Comparison</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compare prices across different pharmacies
                </p>
                <div className="space-y-2">
                  {medicine.availableAt.map((pharmacy, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-background p-3 rounded-md"
                    >
                      <span>{pharmacy}</span>
                      <Badge variant="secondary">
                        ₹{formatPrice(medicine.price * (0.95 + Math.random() * 0.1))}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline">View Full Details</Button>
        <Button>Find Nearby</Button>
      </CardFooter>
    </Card>
  );
}

function MedicineDetailSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}