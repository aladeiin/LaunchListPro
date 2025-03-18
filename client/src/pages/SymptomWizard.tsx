import SymptomWizardComponent from "@/components/SymptomWizard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SymptomWizardPage() {
  // Set document title
  document.title = "Symptom-to-Medicine Matchmaker | PharmAssist";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto py-6 px-4">
          <div className="max-w-4xl mx-auto mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Symptom-to-Medicine Matchmaker
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Describe your symptoms and get personalized over-the-counter medication recommendations
            </p>
          </div>
          
          <SymptomWizardComponent />
          
          <div className="max-w-4xl mx-auto mt-10 bg-primary/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Describe Your Symptoms</h3>
                <p className="text-sm text-muted-foreground">
                  Select from common symptoms or describe your specific health concerns
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">Review Potential Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  See possible conditions that match your symptoms with confidence levels
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Medicine Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Receive appropriate medication options with dosage guidance and pricing
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 border border-primary/20 rounded bg-white dark:bg-slate-900">
              <p className="text-sm text-center">
                <strong>Important:</strong> This tool is for informational purposes only and does not provide medical advice.
                Always consult a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}