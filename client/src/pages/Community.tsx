import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommunityDiscussionCard from "@/components/CommunityDiscussionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Search, 
  Plus, 
  Star, 
  Filter, 
  User, 
  BookOpen, 
  Pill, 
  Stethoscope,
  Award,
  Building,
  CalendarCheck,
  Sparkles
} from "lucide-react";

export default function CommunityPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data for community discussions
  const discussions = [
    {
      id: "1",
      title: "Is there a good alternative to Telma-H for hypertension with fewer side effects?",
      excerpt: "I've been taking Telma-H (Telmisartan/Hydrochlorothiazide) for the past 3 months but experiencing some side effects like dizziness and fatigue. Has anyone tried a generic alternative with fewer side effects?",
      author: {
        name: "Rajesh Sharma",
        avatar: "",
        role: "Community Member",
        isVerified: false
      },
      category: "Medication Alternatives",
      tags: ["Hypertension", "Telma-H", "Side Effects", "Generics"],
      replies: 14,
      likes: 8,
      createdAt: "2023-11-10T10:30:00.000Z"
    },
    {
      id: "2",
      title: "My experience switching from Glycomet to its generic metformin for diabetes management",
      excerpt: "I switched from branded Glycomet to generic metformin 6 months ago and wanted to share my experience with blood sugar control and cost savings. There was no difference in effectiveness for me.",
      author: {
        name: "Dr. Priya Patel",
        avatar: "",
        role: "Endocrinologist",
        isVerified: true
      },
      category: "Success Stories",
      tags: ["Diabetes", "Metformin", "Glycomet", "Cost Savings"],
      replies: 23,
      likes: 42,
      createdAt: "2023-10-25T15:45:00.000Z"
    },
    {
      id: "3",
      title: "Jan Aushadhi stores in Delhi NCR - Sharing locations and experiences",
      excerpt: "I've compiled a list of Jan Aushadhi stores in the Delhi NCR region with details on their stock availability, especially for chronic condition medications. Let's share our experiences with these stores.",
      author: {
        name: "Amit Verma",
        avatar: "",
        role: "Community Guide",
        isVerified: false
      },
      category: "Resources",
      tags: ["Jan Aushadhi", "Delhi NCR", "Medicine Availability", "Generic Stores"],
      replies: 31,
      likes: 56,
      createdAt: "2023-12-05T09:15:00.000Z"
    },
    {
      id: "4",
      title: "Questions about recent CDSCO regulations on fixed-dose combinations",
      excerpt: "I'm trying to understand the recent CDSCO guidelines on fixed-dose combinations and how they might affect the availability of my medications. Can someone with regulatory knowledge explain?",
      author: {
        name: "Dr. Sunil Khanna",
        avatar: "",
        role: "Pharmacologist",
        isVerified: true
      },
      category: "Regulatory Updates",
      tags: ["CDSCO", "Regulations", "Fixed-Dose Combinations"],
      replies: 7,
      likes: 15,
      createdAt: "2023-12-15T11:20:00.000Z"
    }
  ];

  // Mock data for testimonials
  const testimonials = [
    {
      id: "1",
      title: "Saved ₹2,800 monthly on blood pressure medication",
      content: "After finding this platform, I discovered a generic alternative to my branded blood pressure medication that works just as well. I'm now saving ₹2,800 every month. The detailed information helped me discuss this switch confidently with my doctor.",
      author: {
        name: "Vikram Mehta",
        location: "Mumbai, Maharashtra",
        avatar: ""
      },
      medicationSwitched: "Telma-H to generic Telmisartan/HCTZ",
      savings: 2800,
      rating: 5,
      date: "2023-11-15T00:00:00.000Z"
    },
    {
      id: "2",
      title: "Found affordable options for my entire family",
      content: "My parents and I all take medications for different chronic conditions. Using PharmAssist, we found generic alternatives for all our prescriptions and now save about ₹4,500 monthly as a family. The comparison tool was extremely helpful.",
      author: {
        name: "Sunita Agarwal",
        location: "Jaipur, Rajasthan",
        avatar: ""
      },
      medicationSwitched: "Multiple medications",
      savings: 4500,
      rating: 5,
      date: "2023-10-20T00:00:00.000Z"
    },
    {
      id: "3",
      title: "Jan Aushadhi store locator was a game-changer",
      content: "I didn't know there was a Jan Aushadhi store just 2km from my home until I used the store locator on this platform. Now I get all my diabetes medications at 50-70% less than what I was paying before. Thank you for this valuable resource!",
      author: {
        name: "Ramesh Patel",
        location: "Ahmedabad, Gujarat",
        avatar: ""
      },
      medicationSwitched: "Branded diabetes medications to Jan Aushadhi generics",
      savings: 1800,
      rating: 4,
      date: "2023-09-05T00:00:00.000Z"
    }
  ];

  // Mock data for verified experts
  const experts = [
    {
      id: "1",
      name: "Dr. Ananya Singh",
      credentials: "MD, Pharmacology",
      institution: "AIIMS New Delhi",
      specialization: "Clinical Pharmacology",
      avatar: "",
      verified: true,
      contributions: 47,
      joined: "2023-06-15T00:00:00.000Z"
    },
    {
      id: "2",
      name: "Dr. Rahul Kapoor",
      credentials: "PharmD",
      institution: "Manipal College of Pharmaceutical Sciences",
      specialization: "Drug Information & Safety",
      avatar: "",
      verified: true,
      contributions: 36,
      joined: "2023-07-22T00:00:00.000Z"
    },
    {
      id: "3",
      name: "Dr. Meera Reddy",
      credentials: "MD, Internal Medicine",
      institution: "Christian Medical College, Vellore",
      specialization: "Rational Pharmacotherapy",
      avatar: "",
      verified: true,
      contributions: 29,
      joined: "2023-08-10T00:00:00.000Z"
    }
  ];

  // Categories for filtering
  const categories = [
    "All Categories",
    "Medication Alternatives",
    "Success Stories",
    "Questions & Answers",
    "Resources",
    "Regulatory Updates",
    "Side Effects",
    "Drug Interactions"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-3xl font-bold">PharmAssist Community</h1>
            </div>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8">
              Connect with patients, healthcare professionals, and experts to discuss medications, share experiences, and find answers
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="flex items-center gap-2"
                onClick={() => setLocation("/community/new-discussion")}
              >
                <Plus className="h-4 w-4" />
                Start New Discussion
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setLocation("/community/ask-expert")}
              >
                <Stethoscope className="h-4 w-4" />
                Ask an Expert
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Community Navigation Tabs */}
            <Tabs defaultValue="discussions" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Discussions</span>
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Testimonials</span>
                </TabsTrigger>
                <TabsTrigger value="experts" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>Verified Experts</span>
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Resources</span>
                </TabsTrigger>
              </TabsList>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="m-0">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex flex-grow max-w-2xl gap-2">
                    <Input 
                      placeholder="Search discussions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </form>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category, index) => (
                          <SelectItem key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Discussions List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {discussions.map((discussion) => (
                    <CommunityDiscussionCard 
                      key={discussion.id}
                      {...discussion}
                    />
                  ))}
                </div>

                {/* View More Button */}
                <div className="text-center mt-8">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/community/discussions")}
                  >
                    View All Discussions
                  </Button>
                </div>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="m-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Success Stories & Testimonials
                  </h2>
                  <p className="text-slate-600">
                    Real experiences from patients who have successfully switched to generic medications across India
                  </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                          <div className="flex">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <CardDescription>
                          Switched from {testimonial.medicationSwitched}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-slate-700 mb-4">{testimonial.content}</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 mb-2">
                          Monthly Savings: ₹{testimonial.savings}
                        </Badge>
                      </CardContent>
                      <div className="px-6 pb-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {testimonial.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{testimonial.author.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.author.location}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Submit Testimonial Button */}
                <div className="text-center">
                  <Button 
                    onClick={() => setLocation("/community/submit-testimonial")}
                  >
                    Share Your Success Story
                  </Button>
                </div>
              </TabsContent>

              {/* Experts Tab */}
              <TabsContent value="experts" className="m-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Verified Healthcare Professionals
                  </h2>
                  <p className="text-slate-600">
                    Get reliable information from verified doctors, pharmacists, and healthcare professionals
                  </p>
                </div>

                {/* Experts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {experts.map((expert) => (
                    <Card key={expert.id} className="bg-slate-50 border">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {expert.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-1">
                              {expert.name}
                              <Badge variant="secondary" className="ml-1">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                <span className="text-xs">Verified</span>
                              </Badge>
                            </CardTitle>
                            <CardDescription>{expert.credentials}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{expert.institution}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">Specializes in {expert.specialization}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{expert.contributions} contributions</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CalendarCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">Joined {new Date(expert.joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setLocation(`/community/expert/${expert.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* View All Experts Button */}
                <div className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/community/experts")}
                  >
                    View All Healthcare Professionals
                  </Button>
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="m-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Educational Resources
                  </h2>
                  <p className="text-slate-600">
                    Reliable information about generic medicines, regulations, and healthcare in India
                  </p>
                </div>

                {/* Resources Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        Understanding Bioequivalence
                      </CardTitle>
                      <CardDescription>
                        Learn why generic medicines work the same as brand-name drugs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">
                        This comprehensive guide explains how bioequivalence testing ensures that generic 
                        medicines deliver the same amount of active ingredient at the same rate as 
                        brand-name medications.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => setLocation("/resources/bioequivalence")}
                        >
                          Read Guide
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        Indian Regulatory Bodies
                      </CardTitle>
                      <CardDescription>
                        Understanding CDSCO, DCGI, and other regulatory authorities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">
                        Learn about the Central Drugs Standard Control Organization (CDSCO), 
                        Drug Controller General of India (DCGI), and how they ensure medication 
                        safety and quality in India.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => setLocation("/resources/regulatory-bodies")}
                        >
                          Read Guide
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Talking to Your Doctor
                      </CardTitle>
                      <CardDescription>
                        How to discuss generic alternatives with your healthcare provider
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">
                        This guide provides practical advice on how to discuss switching to generic 
                        medications with your doctor, including questions to ask and information to share.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => setLocation("/resources/doctor-discussion-guide")}
                        >
                          Read Guide
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Adverse Event Reporting
                      </CardTitle>
                      <CardDescription>
                        How to report medication side effects to Indian authorities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">
                        Learn about the Pharmacovigilance Programme of India (PvPI) and how to report adverse 
                        drug reactions to help improve medication safety for everyone.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          className="text-primary"
                          onClick={() => setLocation("/resources/adverse-event-reporting")}
                        >
                          Read Guide
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* View All Resources Button */}
                <div className="text-center mt-8">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/resources")}
                  >
                    Browse All Educational Resources
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}