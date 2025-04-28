import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdverseEventReportForm from "@/components/AdverseEventReportForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Info, 
  FileText, 
  PhoneCall, 
  Building, 
  ExternalLink 
} from "lucide-react";

export default function AdverseEventReportingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              Adverse Event Reporting
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Report medication side effects or adverse reactions to help improve drug safety in India
            </p>
          </div>
          
          <Tabs defaultValue="report" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="report">Report an Event</TabsTrigger>
              <TabsTrigger value="information">How Reporting Works</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="report" className="mt-6">
              <AdverseEventReportForm />
            </TabsContent>
            
            <TabsContent value="information" className="mt-6">
              <div className="bg-white shadow-md rounded-lg border p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Info className="h-6 w-6 text-blue-500" />
                  Understanding Adverse Event Reporting
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What happens when you report?</h3>
                    <p className="text-slate-700">
                      When you submit an adverse event report, it is sent to the Pharmacovigilance Programme of India (PvPI), which is coordinated by the Indian Pharmacopoeia Commission (IPC). Your report is reviewed by healthcare professionals who may contact you for additional information. The data is analyzed to identify safety signals that may require regulatory action.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Why your report matters</h3>
                    <p className="text-slate-700">
                      Your report contributes to the ongoing safety monitoring of medications in India. It helps identify previously unknown side effects, interactions, and quality issues. This information may lead to updated safety information, changes to drug labels, or in rare cases, the withdrawal of unsafe medications from the market.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">The reporting process</h3>
                    <ol className="space-y-3 text-green-800">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>You submit your report through this form or directly to PvPI</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>The report is assessed by healthcare professionals at an ADR Monitoring Centre</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>You may be contacted for follow-up information</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>The data is analyzed to detect patterns across similar reports</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">5.</span>
                        <span>If a safety signal is identified, regulatory authorities may take action</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Your privacy</h3>
                    <p className="text-slate-700">
                      Your personal information is kept confidential and is only accessible to authorized personnel involved in the pharmacovigilance process. The data is used solely for medication safety purposes and to contact you for follow-up if needed.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6">
              <div className="bg-white shadow-md rounded-lg border p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  Additional Resources
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Building className="h-5 w-5 text-slate-700" />
                      Regulatory Bodies
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <a 
                          href="https://www.ipc.gov.in/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Indian Pharmacopoeia Commission (IPC)
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-sm text-slate-600">National Coordination Centre for PvPI</p>
                      </li>
                      <li>
                        <a 
                          href="https://cdsco.gov.in/opencms/opencms/en/Home/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Central Drugs Standard Control Organisation (CDSCO)
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-sm text-slate-600">National regulatory body for pharmaceuticals</p>
                      </li>
                      <li>
                        <a 
                          href="https://www.pvpi.nic.in/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Pharmacovigilance Programme of India (PvPI)
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-sm text-slate-600">Official portal for adverse event reporting</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <PhoneCall className="h-5 w-5 text-slate-700" />
                      Direct Reporting Options
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <p className="font-medium">PvPI Helpline</p>
                        <p className="text-primary">1800-180-3024</p>
                        <p className="text-sm text-slate-600">Toll-free helpline for reporting adverse events</p>
                      </li>
                      <li>
                        <p className="font-medium">Email Reporting</p>
                        <p className="text-primary">pvpi.compat@gmail.com</p>
                        <p className="text-sm text-slate-600">Send reports directly via email</p>
                      </li>
                      <li>
                        <p className="font-medium">ADR Monitoring Centres</p>
                        <Button variant="outline" className="mt-1" asChild>
                          <a 
                            href="https://www.pvpi.nic.in/national-coordination-centre/adr-monitoring-centres/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            Find Nearby Centre
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2">Educational Materials</h3>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="#"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Guide to Identifying Adverse Drug Reactions
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a 
                          href="#"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Understanding Drug-Drug Interactions
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a 
                          href="#"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Patient Safety: What You Should Know
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2">Apps & Digital Tools</h3>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="https://play.google.com/store/apps/details?id=com.vinfotech.suspectedadversedrugreaction"
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          ADR PvPI Mobile App
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-sm text-slate-600">Official mobile app for reporting ADRs</p>
                      </li>
                      <li>
                        <a 
                          href="#"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Medication Interaction Checker
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-sm text-slate-600">Check potential interactions between medications</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}