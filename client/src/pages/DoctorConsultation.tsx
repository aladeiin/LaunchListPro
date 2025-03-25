import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorConsultation() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const availableTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "02:00 PM", "03:00 PM", 
    "04:00 PM", "05:00 PM"
  ];
  
  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const reason = formData.get('reason') as string;
    
    // In a real implementation, this would send the booking data to a server endpoint
    // For now, we'll simulate this with a console log showing what would be sent
    console.log('Booking information to be sent to drashwin@thakurpharmacy.com:', {
      doctorEmail: 'drashwin@thakurpharmacy.com',
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      appointmentDate: format(date!, "PPP"),
      appointmentTime: timeSlot,
      reason: reason
    });
    
    toast({
      title: "Consultation Booked",
      description: `Your appointment with Dr. Ashwin Thakur has been scheduled for ${format(date!, "PPP")} at ${timeSlot}. A confirmation email has been sent to you, and Dr. Thakur will be notified at drashwin@thakurpharmacy.com.`,
    });
    
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Doctor Consultation</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
        Get expert medical advice from our qualified doctors who can guide you on medication, 
        drug interactions, and personalized treatment plans.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
            <div className="w-24 h-24 rounded-full bg-white mx-auto mb-4 flex items-center justify-center shadow-md">
              <Stethoscope className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Dr. Ashwin Thakur</CardTitle>
            <CardDescription className="text-center text-sm">
              BAMS • 5+ Years Experience
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-6 mr-2 flex-shrink-0 text-primary">•</div>
                <p className="text-sm">Specializes in chronic disease management and medication therapy</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 mr-2 flex-shrink-0 text-primary">•</div>
                <p className="text-sm">Expert in generic drug substitution and therapeutic alternatives</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 mr-2 flex-shrink-0 text-primary">•</div>
                <p className="text-sm">Member of Indian Medical Association</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 mr-2 flex-shrink-0 text-primary">•</div>
                <p className="text-sm">Provides comprehensive medication reviews and health consultations</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Book Consultation</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleBooking}>
                  <DialogHeader>
                    <DialogTitle>Book a Consultation</DialogTitle>
                    <DialogDescription>
                      Schedule a consultation with Dr. Ashwin Thakur
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="Enter your full name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" placeholder="Enter your phone number" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => 
                              date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                              date.getDay() === 0 // Disable Sundays
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label>Select Time Slot</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={timeSlot === slot ? "default" : "outline"}
                            className={cn("flex items-center justify-center", 
                              timeSlot === slot && "bg-primary text-primary-foreground")}
                            onClick={() => setTimeSlot(slot)}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason for Consultation</Label>
                      <Textarea 
                        id="reason"
                        name="reason"
                        placeholder="Briefly describe your health concern or medication query" 
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={!date || !timeSlot}>
                      Book Appointment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0">
          <CardHeader>
            <CardTitle className="text-xl">Why Consult Our Doctors?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-sm">Personalized medication advice and alternatives</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-sm">Guidance on managing drug interactions</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-sm">Expert opinions on generic drug efficacy</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-sm">Support for chronic disease management</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-sm">Advice on medication side effects and management</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-bl from-primary/5 to-primary/10 border-0">
          <CardHeader>
            <CardTitle className="text-xl">Consultation Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span className="font-medium">Book an Appointment</span>
                </div>
                <p className="text-sm ml-9 text-gray-600 dark:text-gray-400">
                  Select your preferred doctor, date, and time slot
                </p>
              </li>
              <li className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <span className="font-medium">Receive Confirmation</span>
                </div>
                <p className="text-sm ml-9 text-gray-600 dark:text-gray-400">
                  Get appointment details via email and SMS
                </p>
              </li>
              <li className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <span className="font-medium">Join Virtual Consultation</span>
                </div>
                <p className="text-sm ml-9 text-gray-600 dark:text-gray-400">
                  Connect via secure video call at your scheduled time
                </p>
              </li>
              <li className="flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <span className="font-medium">Get Personalized Advice</span>
                </div>
                <p className="text-sm ml-9 text-gray-600 dark:text-gray-400">
                  Receive expert guidance and digital prescription if needed
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Note: Our doctors provide medical advice but do not prescribe controlled substances.
          For emergency situations, please visit your nearest emergency room or call emergency services.
        </p>
      </div>
    </div>
  );
}