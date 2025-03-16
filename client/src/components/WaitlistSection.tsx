import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertWaitlistUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = insertWaitlistUserSchema.extend({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  reason: z.string({
    required_error: "Please select a reason.",
  }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to join the waitlist.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistSection() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      reason: "",
      agreedToTerms: false,
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/waitlist", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      setIsSuccess(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    waitlistMutation.mutate(values);
  }

  return (
    <section id="join-waitlist" className="py-16 bg-gradient-to-r from-primary to-cyan-500">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-sans mb-3">Join Our Waitlist</h2>
            <p className="text-slate-700">
              Be among the first to access MediCompare when we launch. We'll notify you as soon as we're ready.
            </p>
          </div>
          
          {isSuccess ? (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Thank You!</h3>
              <p className="text-green-600">
                You're now on our waitlist. We're excited to have you join us on this journey to make medications more affordable!
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How would you use MediCompare?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="personal">Find alternatives for my prescriptions</SelectItem>
                          <SelectItem value="family">Help manage my family's medications</SelectItem>
                          <SelectItem value="professional">Professional healthcare provider</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to receive emails about MediCompare updates and understand that my data will be processed according to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={waitlistMutation.isPending}
                >
                  {waitlistMutation.isPending ? "Processing..." : "Join Waitlist"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  );
}
