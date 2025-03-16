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
import { ArrowRight, Check, CheckCircle, XCircle } from 'lucide-react';

interface AlternativeCardProps {
  alternative: Medicine & { savingsPercentage: number };
  originalMedicine: Medicine;
}

export default function AlternativeCard({ alternative, originalMedicine }: AlternativeCardProps) {
  const savingsAmount = originalMedicine.price - alternative.price;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-semibold">{alternative.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {alternative.genericName} • {alternative.manufacturer}
                </p>
              </div>
              <Badge 
                variant={alternative.isGeneric ? "secondary" : "outline"}
                className="ml-2"
              >
                {alternative.isGeneric ? "Generic" : "Brand"}
              </Badge>
            </div>
            
            <div className="flex items-center mt-2 text-sm space-x-2">
              {alternative.activeIngredient === originalMedicine.activeIngredient && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Same active ingredient</span>
                </div>
              )}
              {alternative.dosage && (
                <span className="text-muted-foreground">
                  {alternative.dosage}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <div className="flex items-center">
              <span className="font-bold text-xl mr-2">
                ₹{formatPrice(alternative.price)}
              </span>
              <Badge variant="outline" className="bg-green-50">
                Save {alternative.savingsPercentage}%
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Save ₹{formatPrice(savingsAmount)}
            </div>

            <Link href={`/medicine/${encodeURIComponent(alternative.name)}`}>
              <Button size="sm" className="mt-1">
                View Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}