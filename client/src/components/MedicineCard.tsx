import React from 'react';
import { Medicine } from '@shared/schema';
import { formatPrice } from '../lib/medicine-data';
import { Link } from 'wouter';

import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardContent className="flex-1 p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{medicine.name}</h3>
            <p className="text-sm text-muted-foreground">
              {medicine.genericName}
            </p>
          </div>
          {medicine.isGeneric ? (
            <Badge variant="secondary">Generic</Badge>
          ) : (
            <Badge variant="outline">Branded</Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm line-clamp-3">{medicine.description}</p>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Pill className="h-4 w-4 mr-1" />
            <span>{medicine.dosage}</span>
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Manufacturer:</span> {medicine.manufacturer}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Available at:</span> {medicine.availableAt.join(', ')}
          </div>
          
          <div className="flex items-center">
            {medicine.inStock ? (
              <Badge className="flex items-center bg-green-100 text-green-800 hover:bg-green-200">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                In Stock
                {medicine.stockCount > 0 && <span className="ml-1">({medicine.stockCount})</span>}
              </Badge>
            ) : (
              <Badge className="flex items-center bg-red-100 text-red-800 hover:bg-red-200">
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0 px-5 pb-5 mt-auto">
        <div>
          <p className="font-bold text-xl text-primary">₹{formatPrice(medicine.price)}</p>
        </div>
        <Link href={`/medicine/${encodeURIComponent(medicine.name)}`}>
          <Button size="sm">
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}