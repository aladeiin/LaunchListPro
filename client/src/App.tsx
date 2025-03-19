import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Search from "@/pages/Search";
import SymptomWizard from "@/pages/SymptomWizard";
import Inventory from "@/pages/Inventory";
import MedicineDetail from "@/pages/MedicineDetail";
import { ThemeProvider } from "./lib/theme-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/search" component={Search} />
      <Route path="/search/:query" component={Search} />
      <Route path="/symptom-wizard" component={SymptomWizard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/medicine/:name" component={MedicineDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
