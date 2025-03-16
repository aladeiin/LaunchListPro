import { type Medicine } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="bg-slate-50 border border-slate-200 mb-6">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <h4 className="text-lg font-semibold">{medicine.name} ({medicine.genericName})</h4>
              <Badge className="ml-3 bg-primary-light/10 text-primary-dark" variant="outline">
                {medicine.isGeneric ? "Generic" : "Brand Name"}
              </Badge>
            </div>
            <p className="text-slate-600 mt-1">{medicine.dosage}</p>
            <div className="mt-3">
              <p className="text-sm"><span className="font-medium">Active Ingredient:</span> {medicine.activeIngredient}</p>
              <p className="text-sm mt-1"><span className="font-medium">Manufacturer:</span> {medicine.manufacturer}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">₹{medicine.price.toFixed(2)}</div>
            <div className="text-sm text-slate-500">Average price</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-700 flex">
            <Info className="h-4 w-4 text-cyan-500 mr-1 flex-shrink-0 mt-0.5" />
            <span>{medicine.description}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
