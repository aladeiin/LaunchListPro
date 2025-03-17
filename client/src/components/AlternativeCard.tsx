import React from 'react';
import { Medicine } from '@shared/schema';
import { formatPrice } from '../lib/medicine-data';
import { Link } from 'wouter';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Check, 
  CheckCircle, 
  XCircle, 
  TrendingDown, 
  Pill, 
  AlertTriangle,
  Building,
  DollarSign
} from 'lucide-react';

interface AlternativeCardProps {
  alternative: Medicine & { savingsPercentage: number };
  originalMedicine: Medicine;
}

export default function AlternativeCard({ alternative, originalMedicine }: AlternativeCardProps) {
  const savingsAmount = originalMedicine.price - alternative.price;
  const hasSameDosage = alternative.dosage === originalMedicine.dosage;
  const hasSameIngredient = alternative.activeIngredient === originalMedicine.activeIngredient;

  return (
    <Card className={`overflow-hidden border ${alternative.savingsPercentage > 0 ? 'border-green-200 dark:border-green-800' : 'border-border/50'} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header with savings info */}
          <div className={`py-2 px-4 ${alternative.savingsPercentage > 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {alternative.savingsPercentage > 0 ? (
                  <Badge variant="success" className="flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Save {alternative.savingsPercentage}%
                  </Badge>
                ) : (
                  <Badge variant="outline">No Price Difference</Badge>
                )}
              </div>
              <Badge 
                variant={alternative.isGeneric ? "success" : "outline"}
                className="ml-2"
              >
                {alternative.isGeneric ? "Generic" : "Brand"}
              </Badge>
            </div>
          </div>

          {/* Main content */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* Medicine information */}
              <div className="flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{alternative.name}</h3>
                  <div className="flex items-center mt-1">
                    <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {alternative.manufacturer}
                    </p>
                  </div>
                </div>

                {/* Composition */}
                <div className="flex items-start mt-3 space-y-1 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Pill className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span className="font-medium">Active Ingredient:</span>
                    </div>
                    <p className="text-muted-foreground ml-5">
                      {alternative.activeIngredient}
                    </p>
                  </div>
                </div>

                {/* Comparison points */}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center">
                    {hasSameIngredient ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 mr-2 text-yellow-600" />
                    )}
                    <span>
                      {hasSameIngredient 
                        ? "Same active ingredient" 
                        : "Different active ingredient - consult your doctor"}
                    </span>
                  </div>
                  {alternative.dosage && (
                    <div className="flex items-center">
                      {hasSameDosage ? (
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 mr-2 text-yellow-600" />
                      )}
                      <span>
                        {hasSameDosage 
                          ? "Same dosage form" 
                          : `Different dosage: ${alternative.dosage}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    {alternative.inStock ? (
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 mr-2 text-red-600" />
                    )}
                    <span>
                      {alternative.inStock 
                        ? `In stock${alternative.stockCount ? ` (${alternative.stockCount} available)` : ''}`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price information */}
              <div className="w-full md:w-auto flex flex-col gap-2 pt-3 md:pt-0">
                <div className="flex items-baseline justify-between md:justify-end md:flex-col md:items-end">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-sm">Price</span>
                  </div>
                  <span className="font-bold text-xl text-primary">
                    ₹{formatPrice(alternative.price)}
                  </span>
                </div>
                
                {alternative.savingsPercentage > 0 && (
                  <div className="flex flex-col">
                    <div className="w-full flex-1 flex flex-col gap-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Original:</span>
                        <span className="line-through">₹{formatPrice(originalMedicine.price)}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 font-medium">
                        <span>You save:</span>
                        <span>₹{formatPrice(savingsAmount)}</span>
                      </div>
                      <Progress 
                        value={alternative.savingsPercentage} 
                        max={100}
                        className="h-1.5 mt-1"
                      />
                    </div>
                  </div>
                )}

                <Link href={`/medicine/${encodeURIComponent(alternative.name)}`} className="mt-2">
                  <Button size="sm" className="w-full">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}