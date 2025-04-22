import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '../lib/queryClient';
import { v4 as uuidv4 } from 'uuid';
import { processMedicationMessage } from '../lib/chatbot-integration';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Pill, Loader2, Info, CheckCircle2, Lightbulb, Search, BookOpen, Coins } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isUserMessage: boolean;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [userId] = useState(() => localStorage.getItem('chatUserId') || uuidv4());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Store userId in localStorage for persistence
  useEffect(() => {
    localStorage.setItem('chatUserId', userId);
  }, [userId]);

  // Fetch previous chat messages
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<ChatHistoryResponse>({
    queryKey: ['/api/chat', userId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Initialize messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Update messages when chat history is loaded
  useEffect(() => {
    if (chatHistory && 'messages' in chatHistory && Array.isArray(chatHistory.messages)) {
      console.log("Chat history loaded:", chatHistory.messages);
      setMessages(
        chatHistory.messages.map((msg: any) => ({
          id: msg.id.toString(),
          message: msg.message,
          isUserMessage: msg.isUserMessage, // Changed from isFromUser to isUserMessage to match backend schema
        }))
      );
    }
  }, [chatHistory]);

  // Mutation for sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: string) => {
      console.log("Sending chat message to API:", {
        userId,
        message: newMessage,
        isUserMessage: true,
      });
      
      try {
        const result = await apiRequest('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            message: newMessage,
            isUserMessage: true,
          }),
        });
        return result;
      } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log("Chat API response:", response);
      console.log("Response type:", typeof response);
      console.log("Response.response:", response.response);
      console.log("Response.message:", response.message);
      
      // Extract the AI's response from the response object
      const aiResponse = response.response || 
                        (response.message && response.message.message) || 
                        "I apologize, but I couldn't process your request at this time.";
      
      console.log("Final AI response:", aiResponse);
      
      // Add the AI response to the messages
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          message: aiResponse,
          isUserMessage: false,
        },
      ]);
      
      // Invalidate the chat history query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/chat', userId] });
    },
    onError: (error) => {
      console.error("Error in chat mutation:", error);
      
      // Add a friendly error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          message: "I'm sorry, I couldn't process your request at the moment. The service might be experiencing high demand. Please try again in a few moments or ask a different question.",
          isUserMessage: false,
        },
      ]);
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add the user message to the chat
    const newMessage: ChatMessage = {
      id: uuidv4(),
      message: message.trim(),
      isUserMessage: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Store the message text for processing
    const userMessageText = message.trim();
    
    // Clear the input immediately after sending
    setMessage('');
    
    // First check if it's a medication-related query
    try {
      const medicationResponse = await processMedicationMessage(userMessageText);
      
      if (medicationResponse.type === 'medication_response') {
        // It's a medication query, add the response to chat
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            message: medicationResponse.message,
            isUserMessage: false,
          },
        ]);
        
        // Add to chat history via API for persistence
        apiRequest('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            message: medicationResponse.message,
            isUserMessage: false,
          }),
        }).catch(error => {
          console.error("Error saving medication response to history:", error);
        });
        
        // Invalidate the chat history query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/chat', userId] });
        
        return; // Exit early, we've handled the message locally
      }
    } catch (error) {
      console.error("Error processing medication message:", error);
      // Continue with regular processing if medication processing fails
    }
    
    // Not a medication query or medication processing failed, send to the API
    sendMessageMutation.mutate(userMessageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Add welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && 
        !isLoadingHistory && 
        chatHistory && 
        'messages' in chatHistory && 
        Array.isArray(chatHistory.messages) && 
        chatHistory.messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        message: "👋 Hello! I'm your AI Pharmacist assistant. I can help you with:\n\n" +
                "• Finding information about medications\n" +
                "• Checking potential drug interactions\n" +
                "• Finding affordable generic alternatives\n" +
                "• Understanding medication side effects\n" +
                "• Answering questions about dosage\n\n" +
                "How can I assist you today?",
        isUserMessage: false
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, isLoadingHistory, chatHistory]);

  // Generic facts for the sidebar
  const genericFacts = [
    {
      title: "Cost Savings",
      content: "Generic medicines in India typically cost 20-90% less than brand-name equivalents while maintaining the same efficacy."
    },
    {
      title: "Quality Assurance",
      content: "Generic drugs must meet the same quality, strength, purity and stability standards as brand-name medications."
    },
    {
      title: "Jan Aushadhi Initiative",
      content: "The Indian government's Jan Aushadhi scheme provides quality generic medicines at affordable prices through dedicated stores nationwide."
    },
    {
      title: "Bioequivalence",
      content: "Generic medicines contain the same active ingredients and are bioequivalent to their brand-name counterparts."
    },
    {
      title: "Availability",
      content: "More than 80% of prescriptions in India can be filled with available generic alternatives."
    }
  ];

  // How to use the chatbot effectively
  const chatbotUsageSteps = [
    {
      icon: <Search className="w-4 h-4 text-primary" />,
      title: "Be Specific",
      content: "Mention exact medication names, dosages, or specific concerns for more accurate answers."
    },
    {
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      title: "Ask Follow-ups",
      content: "Don't hesitate to ask follow-up questions if you need more details or clarification."
    },
    {
      icon: <Lightbulb className="w-4 h-4 text-primary" />,
      title: "Compare Options",
      content: "Ask about alternatives or comparing different medications for your condition."
    },
    {
      icon: <Coins className="w-4 h-4 text-primary" />,
      title: "Find Cheaper Substitutes",
      content: "Ask for affordable generic alternatives to expensive brand-name medications to save money."
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
      title: "Verify Information",
      content: "Always confirm important medical information with a healthcare professional."
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 mx-auto max-w-6xl">
      <Card className="flex-grow border shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center text-xl">
            <Bot className="mr-2 h-5 w-5" />
            PharmAssist
            <Badge variant="outline" className="ml-2 bg-green-50">
              <Pill className="mr-1 h-3 w-3" />
              AI Pharmacist
            </Badge>
          </CardTitle>
          <CardDescription>
            Ask questions about medications, generics, side effects, and more
          </CardDescription>
        </CardHeader>
        
        <ScrollArea ref={scrollAreaRef} className="h-[400px]">
          <CardContent className="p-4">
            {isLoadingHistory ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-2/3" />
                <div className="flex justify-end">
                  <Skeleton className="h-16 w-2/3" />
                </div>
                <Skeleton className="h-16 w-3/4" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isUserMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        msg.isUserMessage ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className={`h-8 w-8 ${msg.isUserMessage ? 'ml-2' : 'mr-2'}`}>
                        {msg.isUserMessage ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.isUserMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%]">
                      <Avatar className="h-8 w-8 mr-2">
                        <Bot className="h-4 w-4" />
                      </Avatar>
                      <div className="rounded-lg p-3 bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Ask about medications, side effects, drug interactions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={() => void handleSendMessage()}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Facts section about generic medicines */}
      <div className="w-full lg:w-80 space-y-4">
        <Card className="border shadow-md">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="text-lg flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Generic Medicine Facts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {genericFacts.map((fact, index) => (
                <div key={index} className={index > 0 ? "pt-2 border-t" : ""}>
                  <h4 className="text-sm font-medium text-primary">{fact.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{fact.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-md">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-4 w-4" />
              How to Use the Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {chatbotUsageSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-0.5">{step.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}