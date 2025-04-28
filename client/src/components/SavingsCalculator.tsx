import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CalculatorIcon, TrendingDown } from "lucide-react";

interface SavingsCalculatorProps {
  brandName?: string;
  brandPrice?: number;
  genericName?: string;
  genericPrice?: number;
}

export default function SavingsCalculator({
  brandName = "",
  brandPrice = 0,
  genericName = "",
  genericPrice = 0
}: SavingsCalculatorProps) {
  const [customBrandPrice, setCustomBrandPrice] = useState<number>(brandPrice);
  const [customGenericPrice, setCustomGenericPrice] = useState<number>(genericPrice);
  const [quantity, setQuantity] = useState<number>(1);
  const [duration, setDuration] = useState<number>(1); // in months
  
  // Reset values when props change
  useEffect(() => {
    setCustomBrandPrice(brandPrice);
    setCustomGenericPrice(genericPrice);
  }, [brandPrice, genericPrice]);

  const handleQuantityChange = (value: number[]) => {
    setQuantity(value[0]);
  };

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const brandTotalPrice = customBrandPrice * quantity * duration;
  const genericTotalPrice = customGenericPrice * quantity * duration;
  const savings = brandTotalPrice - genericTotalPrice;
  const savingsPercentage = brandTotalPrice > 0 ? Math.round((savings / brandTotalPrice) * 100) : 0;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Personalized Savings Calculator</CardTitle>
        </div>
        <CardDescription>
          See how much you can save by switching to generic alternatives
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand-price">Brand Medicine Price (₹)</Label>
              <Input
                id="brand-price"
                type="number"
                value={customBrandPrice}
                onChange={(e) => setCustomBrandPrice(Number(e.target.value))}
                placeholder="Enter brand price"
                min={0}
              />
              {brandName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Default: {brandName} at ₹{brandPrice.toFixed(2)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="generic-price">Generic Medicine Price (₹)</Label>
              <Input
                id="generic-price"
                type="number"
                value={customGenericPrice}
                onChange={(e) => setCustomGenericPrice(Number(e.target.value))}
                placeholder="Enter generic price"
                min={0}
              />
              {genericName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Default: {genericName} at ₹{genericPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="quantity-slider">
              Quantity (Units/Month): {quantity}
            </Label>
            <Slider
              id="quantity-slider"
              defaultValue={[1]}
              max={30}
              min={1}
              step={1}
              value={[quantity]}
              onValueChange={handleQuantityChange}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="duration-slider">
              Treatment Duration (Months): {duration}
            </Label>
            <Slider
              id="duration-slider"
              defaultValue={[1]}
              max={12}
              min={1}
              step={1}
              value={[duration]}
              onValueChange={handleDurationChange}
              className="mt-2"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">Your Potential Savings:</h3>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Brand Total:</p>
                <p className="font-bold text-slate-900">₹{brandTotalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Generic Total:</p>
                <p className="font-bold text-slate-900">₹{genericTotalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-green-800">You Save:</h4>
                  <p className="text-xl font-bold text-green-700">₹{savings.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-green-800">Savings:</h4>
                  <p className="text-xl font-bold text-green-700">{savingsPercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            Note: Actual savings may vary based on your location, prescription requirements, and other factors. Always consult with your healthcare provider before changing medications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}