import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  businessType: z.enum(["pharmacy", "distributor", "manufacturer", "wholesaler", "other"], {
    required_error: "Please select a business type",
  }),
  // Bank account details
  accountHolderName: z.string().min(2, "Account holder name is required"),
  accountNumber: z.string().min(5, "Valid account number is required"),
  ifscCode: z.string().min(4, "IFSC code is required"),
  bankName: z.string().min(2, "Bank name is required"),
  bankBranch: z.string().min(2, "Branch name is required"),
  // Product categories
  productCategories: z.array(z.string()).min(1, "Select at least one product category"),
  // License and documents
  gstNumber: z.string().optional(),
  drugLicenseNumber: z.string().min(3, "License number is required"),
  // Terms agreement
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  description: z.string().optional(),
});

// List of product categories
const productCategoriesOptions = [
  { id: "allopathic", label: "Allopathic Medicines" },
  { id: "generics", label: "Generic Medicines" },
  { id: "ayurvedic", label: "Ayurvedic Products" },
  { id: "surgical", label: "Surgical Supplies" },
  { id: "equipment", label: "Medical Equipment" },
  { id: "otc", label: "OTC Products" },
  { id: "wellness", label: "Health & Wellness" },
  { id: "baby", label: "Baby Care" },
  { id: "personal", label: "Personal Care" },
];

type FormValues = z.infer<typeof formSchema>;

export default function MerchantSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({
    drugLicense: null,
    gstCertificate: null,
    shopEstablishment: null,
    ownershipProof: null,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      businessType: "pharmacy",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      bankBranch: "",
      productCategories: [],
      gstNumber: "",
      drugLicenseNumber: "",
      termsAgreed: false,
      description: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: file,
      });
    }
  };

  async function onSubmit(data: FormValues) {
    // Check if required files are uploaded
    if (!uploadedFiles.drugLicense) {
      toast({
        title: "Missing Documents",
        description: "Please upload your Drug License certificate",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real implementation, you would:
      // 1. Upload files to server/storage
      // 2. Get file URLs
      // 3. Attach file URLs to form data
      
      // Create a FormData object to send both form data and files
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "productCategories") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });
      
      // Add files
      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      // For this example, we're just simulating the API call
      console.log("Form data would be sent:", data);
      console.log("Files would be sent:", uploadedFiles);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSubmitSuccess(true);
      toast({
        title: "Registration Successful",
        description: "Your merchant application has been received. We'll contact you shortly.",
        variant: "default",
      });
      form.reset();
      setUploadedFiles({
        drugLicense: null,
        gstCertificate: null,
        shopEstablishment: null,
        ownershipProof: null,
      });
    } catch (error) {
      console.error("Merchant registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Become a PharmAssist Partner</h1>
        <p className="mt-3 text-muted-foreground">
          Join our network of trusted medical suppliers to reach more customers and grow your business
        </p>
      </div>

      {submitSuccess ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Application Received!</CardTitle>
            <CardDescription className="text-center">
              Thank you for applying to join the PharmAssist partner network. Our team will review your
              information and contact you within 2-3 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={() => setSubmitSuccess(false)} 
              className="mt-4"
            >
              Register Another Business
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Merchant Registration</CardTitle>
            <CardDescription>
              Please provide your business details to get started with PharmAssist partnership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Business Information</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your pharmacy or business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name of business owner" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type*</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="pharmacy">Pharmacy / Medical Store</option>
                              <option value="distributor">Distributor</option>
                              <option value="wholesaler">Wholesaler</option>
                              <option value="manufacturer">Manufacturer</option>
                              <option value="other">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="drugLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drug License Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your drug license number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your GST registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel>Business Address*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Full address of your business location"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Product Categories</h3>
                  <FormField
                    control={form.control}
                    name="productCategories"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What products do you sell?*</FormLabel>
                          <FormDescription>
                            Select all categories that apply to your business
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {productCategoriesOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="productCategories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Bank Account Details</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Name as per bank records" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your bank account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="Bank IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of your bank" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Branch location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
                  <Alert className="mb-4">
                    <AlertDescription>
                      Please upload clear, readable scans or photos of your documents. Accepted formats: PDF, JPG, PNG (max 5MB each)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="font-medium text-sm">Drug License* (Required)</label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25">
                        <input
                          type="file"
                          id="drugLicense"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'drugLicense')}
                        />
                        <label
                          htmlFor="drugLicense"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1 h-32 text-muted-foreground"
                        >
                          {uploadedFiles.drugLicense ? (
                            <>
                              <div className="text-green-600">File uploaded:</div>
                              <div className="font-medium text-sm">{uploadedFiles.drugLicense.name}</div>
                              <div className="text-xs">Click to change</div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8" />
                              <span>Click to upload Drug License</span>
                              <span className="text-xs">Required</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium text-sm">GST Certificate (Optional)</label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25">
                        <input
                          type="file"
                          id="gstCertificate"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'gstCertificate')}
                        />
                        <label
                          htmlFor="gstCertificate"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1 h-32 text-muted-foreground"
                        >
                          {uploadedFiles.gstCertificate ? (
                            <>
                              <div className="text-green-600">File uploaded:</div>
                              <div className="font-medium text-sm">{uploadedFiles.gstCertificate.name}</div>
                              <div className="text-xs">Click to change</div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8" />
                              <span>Click to upload GST Certificate</span>
                              <span className="text-xs">Optional</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium text-sm">Shop & Establishment Certificate</label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25">
                        <input
                          type="file"
                          id="shopEstablishment"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'shopEstablishment')}
                        />
                        <label
                          htmlFor="shopEstablishment"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1 h-32 text-muted-foreground"
                        >
                          {uploadedFiles.shopEstablishment ? (
                            <>
                              <div className="text-green-600">File uploaded:</div>
                              <div className="font-medium text-sm">{uploadedFiles.shopEstablishment.name}</div>
                              <div className="text-xs">Click to change</div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8" />
                              <span>Click to upload S&E Certificate</span>
                              <span className="text-xs">Optional</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium text-sm">Ownership Proof / Rent Agreement</label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25">
                        <input
                          type="file"
                          id="ownershipProof"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'ownershipProof')}
                        />
                        <label
                          htmlFor="ownershipProof"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1 h-32 text-muted-foreground"
                        >
                          {uploadedFiles.ownershipProof ? (
                            <>
                              <div className="text-green-600">File uploaded:</div>
                              <div className="font-medium text-sm">{uploadedFiles.ownershipProof.name}</div>
                              <div className="text-xs">Click to change</div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8" />
                              <span>Click to upload Ownership Proof</span>
                              <span className="text-xs">Optional</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information About Your Business</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What products do you specialize in? How long have you been in business? Any special services you offer?"
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us understand your business better and match you with the right opportunities.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termsAgreed"
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
                          I agree to the Terms and Conditions
                        </FormLabel>
                        <FormDescription>
                          By submitting this form, I confirm that all information provided is accurate.
                          I authorize PharmAssist to verify my business credentials and contact me regarding my application.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-12 py-8 px-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Benefits of Joining PharmAssist Network</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4">
            <h3 className="font-medium text-primary mb-2">Expanded Reach</h3>
            <p className="text-sm">Connect with thousands of customers searching for medicines daily</p>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-primary mb-2">Digital Presence</h3>
            <p className="text-sm">Get online with minimal effort and showcase your inventory</p>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-primary mb-2">Inventory Management</h3>
            <p className="text-sm">Access to our state-of-the-art inventory tracking system</p>
          </div>
        </div>
      </div>
    </div>
  );
}