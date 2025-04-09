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
import Products from "@/pages/Products";
import MedicineDetail from "@/pages/MedicineDetail";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import BlogSearch from "@/pages/BlogSearch";
import BlogTopic from "@/pages/BlogTopic";
import DoctorConsultation from "@/pages/DoctorConsultation";
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
      <Route path="/products" component={Products} />
      <Route path="/medicine/:name" component={MedicineDetail} />
      <Route path="/doctor-consultation" component={DoctorConsultation} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/search" component={BlogSearch} />
      <Route path="/blog/topic/:topic" component={BlogTopic} />
      <Route path="/blog/:slug" component={BlogDetail} />
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
