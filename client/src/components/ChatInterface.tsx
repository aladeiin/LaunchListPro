import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '../lib/queryClient';
import { v4 as uuidv4 } from 'uuid';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Pill, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isUserMessage: boolean;
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
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/chat', userId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Initialize messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Update messages when chat history is loaded
  useEffect(() => {
    if (chatHistory && chatHistory.messages && Array.isArray(chatHistory.messages)) {
      setMessages(
        chatHistory.messages.map((msg: any) => ({
          id: msg.id.toString(),
          message: msg.message,
          isUserMessage: msg.isFromUser,
        }))
      );
    }
  }, [chatHistory]);

  // Mutation for sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: string) => {
      return apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: newMessage,
        }),
      });
    },
    onSuccess: (response) => {
      // Add the AI response to the messages
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          message: response.response,
          isUserMessage: false,
        },
      ]);
      
      // Invalidate the chat history query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/chat', userId] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add the user message to the chat
    const newMessage: ChatMessage = {
      id: uuidv4(),
      message: message.trim(),
      isUserMessage: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Send the message to the API
    sendMessageMutation.mutate(message.trim());
    
    // Clear the input
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <Card className="mx-auto max-w-3xl border shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center text-xl">
          <Bot className="mr-2 h-5 w-5" />
          AI Pharmacist Assistant
          <Badge variant="outline" className="ml-2 bg-green-50">
            <Pill className="mr-1 h-3 w-3" />
            MediAssist
          </Badge>
        </CardTitle>
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
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div>
                <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ask the AI Pharmacist</h3>
                <p className="text-muted-foreground max-w-md">
                  Get answers about medications, potential drug interactions, 
                  side effects, dosages, and more.
                </p>
              </div>
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
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}