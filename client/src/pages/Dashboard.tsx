import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchSection from "@/components/SearchSection";
import ChatInterface from "@/components/ChatInterface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Search, 
  ChevronLeft, 
  Store, 
  Pill, 
  TrendingUp, 
  TrendingDown, 
  BellRing, 
  Clock, 
  Filter, 
  ShoppingCart,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Home,
  LayoutDashboard,
  MessageCircle
} from "lucide-react";

import { PieChart, Pie, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  
  // Fetch statistics data for the dashboard
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/statistics', dateRange],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/statistics?range=${dateRange}`);
        if (!res.ok) {
          // If API endpoint doesn't exist yet, return mock data for demo
          return getMockDashboardData(dateRange);
        }
        return res.json();
      } catch (error) {
        // Return mock data for demo if endpoint doesn't exist
        return getMockDashboardData(dateRange);
      }
    },
    // Add initialization to prevent "Cannot read properties of undefined" errors
    initialData: getMockDashboardData(dateRange)
  });
  
  // Fetch most searched medicines
  const { data: topMedicines, isLoading: isLoadingTopMedicines } = useQuery({
    queryKey: ['/api/medicines/top-searched'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/medicines/top-searched');
        if (!res.ok) {
          // If API endpoint doesn't exist yet, return mock data for demo
          return getMockTopMedicines();
        }
        return res.json();
      } catch (error) {
        // Return mock data for demo if endpoint doesn't exist
        return getMockTopMedicines();
      }
    },
    initialData: getMockTopMedicines()
  });
  
  // Fetch inventory status
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/medicines/inventory'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/medicines/inventory');
        if (!res.ok) {
          // If API endpoint doesn't exist yet, return mock data for demo
          return getMockInventoryData();
        }
        return res.json();
      } catch (error) {
        // Return mock data for demo if endpoint doesn't exist
        return getMockInventoryData();
      }
    },
    initialData: getMockInventoryData()
  });
  
  // Fetch price alerts
  const { data: priceAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['/api/medicines/price-alerts'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/medicines/price-alerts');
        if (!res.ok) {
          // If API endpoint doesn't exist yet, return mock data for demo
          return getMockPriceAlerts();
        }
        return res.json();
      } catch (error) {
        // Return mock data for demo if endpoint doesn't exist
        return getMockPriceAlerts();
      }
    },
    initialData: getMockPriceAlerts()
  });
  
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };
  
  // Format numbers with commas for thousands
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };
  
  // Format percentage with + sign for positive values
  const formatPercentage = (value: number) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };
  
  // Generate colors for charts based on their values
  const getColorByValue = (value: number) => {
    if (value > 20) return "var(--primary)";
    if (value > 10) return "#22c55e";
    if (value > 0) return "#84cc16";
    if (value > -10) return "#eab308";
    return "#ef4444";
  };
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">PharmAssist Dashboard</h1>
              <p className="text-muted-foreground">Monitor medicine trends, inventory, and price changes</p>
            </div>
            
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/search">
                <Button className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Search Medicines
                </Button>
              </Link>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="price-changes" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Price Changes
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center">
                  <BellRing className="h-4 w-4 mr-2" />
                  Alerts
                </TabsTrigger>
              </TabsList>
              
              <div className="hidden md:flex space-x-2">
                <Button 
                  variant={dateRange === "week" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateRangeChange("week")}
                >
                  Week
                </Button>
                <Button 
                  variant={dateRange === "month" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateRangeChange("month")}
                >
                  Month
                </Button>
                <Button 
                  variant={dateRange === "year" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDateRangeChange("year")}
                >
                  Year
                </Button>
              </div>
            </div>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoadingStats ? (
                  Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-6 w-20" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Medicines</p>
                            <p className="text-3xl font-bold">{formatNumber(statsData.totalMedicines)}</p>
                          </div>
                          <Pill className="h-10 w-10 p-2 bg-primary/10 text-primary rounded-full" />
                        </div>
                        <div className="flex items-center mt-4">
                          <Badge variant={statsData.medicineGrowth > 0 ? "success" : "destructive"} className="mr-2">
                            {statsData.medicineGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercentage(statsData.medicineGrowth)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">vs. previous {dateRange}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Searches</p>
                            <p className="text-3xl font-bold">{formatNumber(statsData.totalSearches)}</p>
                          </div>
                          <Search className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />
                        </div>
                        <div className="flex items-center mt-4">
                          <Badge variant={statsData.searchGrowth > 0 ? "success" : "destructive"} className="mr-2">
                            {statsData.searchGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercentage(statsData.searchGrowth)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">vs. previous {dateRange}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Average Savings</p>
                            <p className="text-3xl font-bold">₹{formatNumber(statsData.averageSavings)}</p>
                          </div>
                          <TrendingDown className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-full" />
                        </div>
                        <div className="flex items-center mt-4">
                          <Badge variant={statsData.savingsGrowth > 0 ? "success" : "destructive"} className="mr-2">
                            {statsData.savingsGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercentage(statsData.savingsGrowth)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">vs. previous {dateRange}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">AI Chat Usage</p>
                            <p className="text-3xl font-bold">{formatNumber(statsData.chatUsage)}</p>
                          </div>
                          <MessageCircle className="h-10 w-10 p-2 bg-purple-100 text-purple-600 rounded-full" />
                        </div>
                        <div className="flex items-center mt-4">
                          <Badge variant={statsData.chatUsageGrowth > 0 ? "success" : "destructive"} className="mr-2">
                            {statsData.chatUsageGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercentage(statsData.chatUsageGrowth)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">vs. previous {dateRange}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-80 w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={statsData.searchTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="searches" stroke="var(--primary)" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="uniqueUsers" stroke="#10b981" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generic vs Branded Market Share (Quantity)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-80 w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-72">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statsData.medicineDistribution.filter((item: any) => 
                                item.name === 'Generic' || item.name === 'Branded'
                              )}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#0088FE" /> {/* Generic */}
                              <Cell fill="#FF8042" /> {/* Branded */}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Market Share by Value and Price Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Share by Value (Revenue in Crores ₹)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-80 w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-72">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statsData.marketShareByValue}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, value, percent }) => `${name}: ₹${value} Cr (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#0088FE" /> {/* Generic */}
                              <Cell fill="#FF8042" /> {/* Branded */}
                            </Pie>
                            <Tooltip formatter={(value) => [`₹${value} Cr`, 'Revenue']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Branded vs Generic Price Comparison (₹)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="h-80 w-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart 
                          data={statsData.priceComparisonData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Price']} />
                          <Legend />
                          <Bar dataKey="branded" name="Branded Price" fill="#FF8042" />
                          <Bar dataKey="generic" name="Generic Price" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Prescription Cost Comparison */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prescription Cost Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <div className="space-y-6">
                        {statsData.prescriptionCostComparisons.map((prescription: any) => (
                          <div key={prescription.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-semibold">{prescription.name}</h3>
                              <Badge className="text-sm bg-green-100 text-green-800 hover:bg-green-200">
                                {prescription.savingsPercentage}% Savings
                              </Badge>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Branded Price (₹)</TableHead>
                                    <TableHead>Generic Price (₹)</TableHead>
                                    <TableHead>Savings (₹)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {prescription.medicines.map((medicine: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">{medicine.name}</TableCell>
                                      <TableCell>{medicine.quantity}</TableCell>
                                      <TableCell>{medicine.brandedPrice}</TableCell>
                                      <TableCell>{medicine.genericPrice}</TableCell>
                                      <TableCell className="text-green-600">
                                        {medicine.brandedPrice - medicine.genericPrice}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className="bg-muted/50">
                                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                                    <TableCell className="font-bold">₹{prescription.totalBranded}</TableCell>
                                    <TableCell className="font-bold">₹{prescription.totalGeneric}</TableCell>
                                    <TableCell className="font-bold text-green-600">
                                      ₹{prescription.savings}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Top Searched Medicines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Searched Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTopMedicines ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topMedicines.slice(0, 5).map((medicine: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium text-lg mr-3 w-5 text-center">{index + 1}</span>
                            <div>
                              <p className="font-medium">{medicine.name}</p>
                              <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{medicine.price.toFixed(2)}</p>
                            <div className="flex items-center space-x-1 justify-end">
                              <Badge 
                                variant={medicine.priceChange > 0 ? "destructive" : "success"}
                                className="text-xs"
                              >
                                {medicine.priceChange > 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(medicine.priceChange)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Link href="/search" className="block">
                        <Button variant="outline" className="w-full mt-4">
                          View All Medicines
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Stock</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : formatNumber(inventoryData.totalStock)}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : inventoryData.outOfStock}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Low Stock Alert</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : inventoryData.lowStock}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stock Levels by Medicine Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={inventoryData.stockByType}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inStock" stackId="a" fill="#4ade80" name="In Stock" />
                        <Bar dataKey="lowStock" stackId="a" fill="#fbbf24" name="Low Stock" />
                        <Bar dataKey="outOfStock" stackId="a" fill="#f87171" name="Out of Stock" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Low Stock Medicines</CardTitle>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                    Attention Required
                  </Badge>
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine Name</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryData.lowStockMedicines.map((medicine: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={medicine.stockPercentage} className="h-2 w-24" />
                                <span className="text-sm">{medicine.currentStock}/{medicine.maxStock}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {medicine.currentStock === 0 ? (
                                <Badge variant="destructive">Out of Stock</Badge>
                              ) : (
                                <Badge variant="warning">Low Stock</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Price Changes Tab */}
            <TabsContent value="price-changes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Price Increases</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : inventoryData.priceIncreases}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Price Decreases</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : inventoryData.priceDecreases}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Change</p>
                        <p className="text-3xl font-bold">{isLoadingInventory ? <Skeleton className="h-9 w-20" /> : formatPercentage(inventoryData.averagePriceChange)}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Change Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={inventoryData.priceChangeTrends}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="increases" stroke="#ef4444" name="Price Increases" />
                        <Line type="monotone" dataKey="decreases" stroke="#10b981" name="Price Decreases" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Price Changes</CardTitle>
                  <Badge>Last 30 Days</Badge>
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Old Price</TableHead>
                          <TableHead>New Price</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryData.recentPriceChanges.map((change: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{change.name}</TableCell>
                            <TableCell>₹{change.oldPrice.toFixed(2)}</TableCell>
                            <TableCell>₹{change.newPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={change.percentageChange > 0 ? "destructive" : "success"}
                              >
                                {change.percentageChange > 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {formatPercentage(change.percentageChange)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Alerts</p>
                        <p className="text-3xl font-bold">{isLoadingAlerts ? <Skeleton className="h-9 w-20" /> : priceAlerts.activeAlerts}</p>
                      </div>
                      <BellRing className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Triggered Today</p>
                        <p className="text-3xl font-bold">{isLoadingAlerts ? <Skeleton className="h-9 w-20" /> : priceAlerts.triggeredToday}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Savings</p>
                        <p className="text-3xl font-bold">₹{isLoadingAlerts ? <Skeleton className="h-9 w-20 inline-block" /> : priceAlerts.averageSavings.toFixed(2)}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : priceAlerts.alerts.length > 0 ? (
                    <div className="space-y-4">
                      {priceAlerts.alerts.map((alert: any, index: number) => (
                        <Card key={index} className={`border-l-4 ${alert.status === 'triggered' ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium">{alert.medicineName}</h3>
                                <p className="text-sm text-muted-foreground">{alert.condition}</p>
                              </div>
                              <Badge variant={alert.status === 'triggered' ? "success" : "warning"}>
                                {alert.status === 'triggered' ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Triggered
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="flex justify-between mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Target: </span>
                                <span className="font-medium">₹{alert.targetPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Current: </span>
                                <span className="font-medium">₹{alert.currentPrice.toFixed(2)}</span>
                              </div>
                              {alert.status === 'triggered' && (
                                <div className="text-sm text-green-600 font-medium">
                                  Saved: ₹{(alert.originalPrice - alert.currentPrice).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BellRing className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No Price Alerts</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                        Set up price alerts to be notified when medicines drop in price
                      </p>
                      <Button className="mt-4">Create New Alert</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Mock data for the dashboard (this would be replaced by actual API calls in production)
function getMockDashboardData(dateRange: string) {
  // Adjust data based on the selected date range
  const multiplier = dateRange === "week" ? 1 : dateRange === "month" ? 4 : 12;
  
  return {
    totalMedicines: 2450 + Math.floor(Math.random() * 100),
    medicineGrowth: 12.5,
    totalSearches: 18700 * multiplier + Math.floor(Math.random() * 1000),
    searchGrowth: 8.2,
    averageSavings: 156.75 + Math.floor(Math.random() * 20),
    savingsGrowth: 15.3,
    chatUsage: 3520 * multiplier + Math.floor(Math.random() * 500),
    chatUsageGrowth: 24.7,
    
    // Search trends data for the line chart
    searchTrends: Array(multiplier).fill(0).map((_, i) => ({
      date: dateRange === "week" 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7]
        : dateRange === "month"
        ? `Week ${i+1}`
        : `Month ${i+1}`,
      searches: 1200 + Math.floor(Math.random() * 800),
      uniqueUsers: 800 + Math.floor(Math.random() * 400)
    })),
    
    // Medicine distribution data for the pie chart (by count)
    medicineDistribution: [
      { name: 'Generic', value: 1430 },
      { name: 'Branded', value: 1020 },
      { name: 'Ayurvedic', value: 350 },
      { name: 'Homeopathic', value: 180 },
      { name: 'Other', value: 120 }
    ],
    
    // Market share by value (revenue in crores INR)
    marketShareByValue: [
      { name: 'Generic', value: 58.7 },
      { name: 'Branded', value: 142.3 }
    ],
    
    // Price comparison data for branded vs generic drugs
    priceComparisonData: [
      { name: 'Paracetamol', branded: 35, generic: 12 },
      { name: 'Amoxicillin', branded: 120, generic: 45 },
      { name: 'Atorvastatin', branded: 240, generic: 75 },
      { name: 'Metformin', branded: 180, generic: 60 },
      { name: 'Losartan', branded: 160, generic: 55 },
      { name: 'Omeprazole', branded: 140, generic: 40 },
    ],
    
    // Prescription cost comparison examples
    prescriptionCostComparisons: [
      {
        id: 1,
        name: "Common Cold Treatment",
        medicines: [
          { name: "Ascodex LS", quantity: "1 bottle", brandedPrice: 145, genericPrice: 60 },
          { name: "Clavam 625", quantity: "6 tablets", brandedPrice: 396, genericPrice: 180 },
          { name: "Allegra-M", quantity: "1 strip (10 tablets)", brandedPrice: 175, genericPrice: 70 }
        ],
        totalBranded: 716,
        totalGeneric: 310,
        savings: 406,
        savingsPercentage: 56.7
      },
      {
        id: 2,
        name: "Hypertension Monthly Medication",
        medicines: [
          { name: "Telma-H", quantity: "30 tablets", brandedPrice: 620, genericPrice: 240 },
          { name: "Ecosprin 75", quantity: "30 tablets", brandedPrice: 25, genericPrice: 12 },
          { name: "Atorva 10", quantity: "30 tablets", brandedPrice: 560, genericPrice: 180 }
        ],
        totalBranded: 1205,
        totalGeneric: 432,
        savings: 773,
        savingsPercentage: 64.1
      },
      {
        id: 3,
        name: "Diabetes Management",
        medicines: [
          { name: "Glycomet 500 SR", quantity: "60 tablets", brandedPrice: 240, genericPrice: 96 },
          { name: "Januvia 100", quantity: "30 tablets", brandedPrice: 1560, genericPrice: 620 },
          { name: "Ecosprin 75", quantity: "30 tablets", brandedPrice: 25, genericPrice: 12 }
        ],
        totalBranded: 1825,
        totalGeneric: 728,
        savings: 1097,
        savingsPercentage: 60.1
      }
    ]
  };
}

function getMockTopMedicines() {
  return [
    { 
      name: 'Paracetamol 500mg', 
      genericName: 'Paracetamol',
      price: 35.40, 
      priceChange: -5.2,
      searches: 3420
    },
    { 
      name: 'Azithromycin 500mg', 
      genericName: 'Azithromycin',
      price: 180.25, 
      priceChange: 2.7,
      searches: 2890
    },
    { 
      name: 'Montelukast 10mg', 
      genericName: 'Montelukast',
      price: 246.80, 
      priceChange: -3.5,
      searches: 2670
    },
    { 
      name: 'Amoxicillin 500mg', 
      genericName: 'Amoxicillin',
      price: 125.60, 
      priceChange: 0,
      searches: 2450
    },
    { 
      name: 'Dolo 650mg', 
      genericName: 'Paracetamol',
      price: 32.75, 
      priceChange: -1.8,
      searches: 2410
    },
    { 
      name: 'Crocin 500mg', 
      genericName: 'Paracetamol',
      price: 40.50, 
      priceChange: 1.5,
      searches: 2280
    },
    { 
      name: 'Cetrizine 10mg', 
      genericName: 'Cetrizine',
      price: 65.90, 
      priceChange: -2.1,
      searches: 2150
    }
  ];
}

function getMockInventoryData() {
  return {
    totalStock: 24890,
    outOfStock: 87,
    lowStock: 142,
    priceIncreases: 37,
    priceDecreases: 54,
    averagePriceChange: -1.2,
    
    // Stock by medicine type
    stockByType: [
      { name: 'Antibiotics', inStock: 1200, lowStock: 35, outOfStock: 12 },
      { name: 'Pain Relief', inStock: 1800, lowStock: 28, outOfStock: 15 },
      { name: 'Cardiac', inStock: 920, lowStock: 31, outOfStock: 18 },
      { name: 'Diabetes', inStock: 780, lowStock: 22, outOfStock: 16 },
      { name: 'Respiratory', inStock: 1050, lowStock: 26, outOfStock: 14 }
    ],
    
    // Price change trends
    priceChangeTrends: Array(12).fill(0).map((_, i) => ({
      date: `Week ${i+1}`,
      increases: 5 + Math.floor(Math.random() * 15),
      decreases: 8 + Math.floor(Math.random() * 20)
    })),
    
    // Low stock medicines
    lowStockMedicines: [
      { name: 'Amoxicillin 500mg', currentStock: 12, maxStock: 100, stockPercentage: 12 },
      { name: 'Atorvastatin 10mg', currentStock: 8, maxStock: 80, stockPercentage: 10 },
      { name: 'Metformin 500mg', currentStock: 15, maxStock: 150, stockPercentage: 10 },
      { name: 'Lisinopril 5mg', currentStock: 0, maxStock: 120, stockPercentage: 0 },
      { name: 'Sertraline 50mg', currentStock: 5, maxStock: 100, stockPercentage: 5 }
    ],
    
    // Recent price changes
    recentPriceChanges: [
      { name: 'Amoxicillin 500mg', oldPrice: 145.75, newPrice: 125.60, percentageChange: -13.8 },
      { name: 'Atorvastatin 20mg', oldPrice: 210.30, newPrice: 235.90, percentageChange: 12.2 },
      { name: 'Losartan 50mg', oldPrice: 175.20, newPrice: 168.40, percentageChange: -3.9 },
      { name: 'Albuterol Inhaler', oldPrice: 310.50, newPrice: 285.75, percentageChange: -8.0 },
      { name: 'Montelukast 10mg', oldPrice: 230.20, newPrice: 246.80, percentageChange: 7.2 }
    ]
  };
}

function getMockPriceAlerts() {
  return {
    activeAlerts: 8,
    triggeredToday: 3,
    averageSavings: 78.65,
    
    alerts: [
      {
        medicineName: 'Paracetamol 500mg',
        condition: 'Price drops below ₹30.00',
        targetPrice: 30.00,
        currentPrice: 28.50,
        originalPrice: 35.40,
        status: 'triggered',
        date: '2 hours ago'
      },
      {
        medicineName: 'Amoxicillin 500mg',
        condition: 'Price drops below ₹120.00',
        targetPrice: 120.00,
        currentPrice: 125.60,
        originalPrice: 145.75,
        status: 'pending',
        date: 'Today'
      },
      {
        medicineName: 'Atorvastatin 10mg',
        condition: 'Price drops below ₹180.00',
        targetPrice: 180.00,
        currentPrice: 175.80,
        originalPrice: 198.25,
        status: 'triggered',
        date: '1 day ago'
      },
      {
        medicineName: 'Montelukast 10mg',
        condition: 'Price drops below ₹220.00',
        targetPrice: 220.00,
        currentPrice: 246.80,
        originalPrice: 246.80,
        status: 'pending',
        date: 'Today'
      },
      {
        medicineName: 'Losartan 50mg',
        condition: 'Price drops below ₹165.00',
        targetPrice: 165.00,
        currentPrice: 168.40,
        originalPrice: 175.20,
        status: 'pending',
        date: 'Today'
      }
    ]
  };
}