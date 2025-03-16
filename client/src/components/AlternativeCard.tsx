import { type Medicine } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Info, Store, ArrowRight } from "lucide-react";

interface AlternativeCardProps {
  alternative: Medicine & { savingsPercentage: number };
  originalMedicine: Medicine;
}

export default function AlternativeCard({ alternative, originalMedicine }: AlternativeCardProps) {
  const isSameActiveIngredient = alternative.activeIngredient === originalMedicine.activeIngredient;
  const isSameStrength = alternative.dosage === originalMedicine.dosage;

  return (
    <Card className="border border-slate-200 hover:border-primary hover:shadow-md transition">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h5 className="font-medium">{alternative.name}</h5>
              <Badge variant="outline" className={alternative.isGeneric ? "bg-green-500/10 text-green-700" : "bg-primary-light/10 text-primary-dark"}>
                {alternative.isGeneric ? "Generic" : "Brand Name"}
              </Badge>
              
              {isSameActiveIngredient && alternative.isGeneric && (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Recommended
                </Badge>
              )}
            </div>
            <p className="text-slate-600 text-sm mt-1">{alternative.dosage}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isSameActiveIngredient && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Same active ingredient</span>
                </div>
              )}
              {isSameStrength && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Same strength</span>
                </div>
              )}
              {!isSameActiveIngredient && (
                <div className="flex items-center text-slate-500">
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-sm">Different active ingredient, similar effect</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">${alternative.price.toFixed(2)}</div>
            <div className="text-xs text-green-600 font-medium">Save {alternative.savingsPercentage}%</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Store className="h-4 w-4 text-slate-500 mr-1" />
              <span className="text-sm">Available at:</span>
              <span className="ml-2 text-sm font-medium">{alternative.availableAt.join(", ")}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
