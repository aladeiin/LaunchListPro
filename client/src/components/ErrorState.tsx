import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "We couldn't load the data. Please try again.", 
  retry 
}) => {
  return (
    <Card className="w-full border-red-200 bg-red-50 text-center">
      <CardContent className="pt-6 pb-2 flex flex-col items-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div>
          <h3 className="text-lg font-medium text-red-800 mb-1">Oops! Something went wrong</h3>
          <p className="text-red-600">{message}</p>
        </div>
      </CardContent>
      {retry && (
        <CardFooter className="flex justify-center pb-6">
          <Button 
            variant="outline" 
            onClick={retry}
            className="bg-white border-red-200 hover:bg-red-100 text-red-600"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorState;