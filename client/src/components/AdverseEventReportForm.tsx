import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, AlertTriangle, CheckCircle2, Info, User, Pill, Ban } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define form schema using zod
const adverseEventSchema = z.object({
  patientName: z.string().min(2, "Name is required"),
  patientAge: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Age must be a positive number",
  }),
  patientGender: z.enum(["male", "female", "other"]),
  patientContact: z.string().min(10, "Valid contact information is required"),
  medicineName: z.string().min(2, "Medicine name is required"),
  batchNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  dateStarted: z.date({
    required_error: "Please select when you started the medicine",
  }),
  eventDate: z.date({
    required_error: "Please select when the adverse event occurred",
  }),
  symptoms: z.string().min(10, "Please describe the symptoms in detail"),
  severity: z.enum(["mild", "moderate", "severe", "life-threatening"]),
  outcome: z.enum(["recovered", "recovering", "not_recovered", "unknown", "fatal"]),
  medicalAttention: z.boolean(),
  otherMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  reporterType: z.enum(["patient", "relative", "healthcare_professional", "other"]),
  consentToContact: z.boolean().refine((val) => val === true, {
    message: "You must consent to be contacted for follow-up",
  }),
});

type AdverseEventFormValues = z.infer<typeof adverseEventSchema>;

export default function AdverseEventReportForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<AdverseEventFormValues>({
    resolver: zodResolver(adverseEventSchema),
    defaultValues: {
      medicalAttention: false,
      consentToContact: false,
    },
  });

  function onSubmit(data: AdverseEventFormValues) {
    // In a real app, this would submit to an API endpoint
    console.log(data);
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle>Report Submitted Successfully</CardTitle>
          </div>
          <CardDescription>
            Your adverse event report has been received
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            Thank you for reporting this adverse event. Your report helps improve medication safety for everyone.
          </p>
          <p className="mb-6">
            A reference number has been sent to your contact information. A representative from the Pharmacovigilance Programme of India (PvPI) may contact you for additional information.
          </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Submit Another Report
            </Button>
            <Button>
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-orange-50 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <CardTitle>Report an Adverse Event</CardTitle>
        </div>
        <CardDescription>
          Report medication side effects or adverse reactions to Indian authorities
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            This form reports adverse events to the Pharmacovigilance Programme of India (PvPI).
            If you're experiencing a medical emergency, please contact emergency services immediately.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="patientContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information (Phone or Email)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Medication Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="medicineName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter medicine name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include brand and generic names if known
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer (if known)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter manufacturer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number (if available)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter batch number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Usually found on medicine packaging
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateStarted"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Started Taking Medicine</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                Adverse Event Details
              </h3>
              
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date When Adverse Event Occurred</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe the Adverse Event / Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe what happened in detail"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include symptoms, duration, and any other relevant details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity of the Adverse Event</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="life-threatening">Life-threatening</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="recovered">Recovered/Resolved</SelectItem>
                          <SelectItem value="recovering">Recovering/Resolving</SelectItem>
                          <SelectItem value="not_recovered">Not Recovered/Not Resolved</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="fatal">Fatal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="medicalAttention"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Required Medical Attention
                      </FormLabel>
                      <FormDescription>
                        Check if you sought medical help for this adverse event
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="otherMedications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Medications Being Taken</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List other medicines you are currently taking"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any relevant medical conditions"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reporterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>You are reporting as a:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="patient" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Patient who experienced the event
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="relative" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Relative/caregiver of the patient
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="healthcare_professional" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Healthcare professional
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="consentToContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Consent to be contacted
                      </FormLabel>
                      <FormDescription>
                        I agree to be contacted by the Pharmacovigilance Programme of India (PvPI) for follow-up information if needed.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}