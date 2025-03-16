import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Info } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  isUserMessage: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "Hello! I'm PharmAssist, your personal medication assistant. How can I help you today?",
      isUserMessage: false
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useRef(nanoid());

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId: userId.current,
        message,
        isUserMessage: true
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: nanoid(),
        message: data.message.message,
        isUserMessage: false
      }]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        id: nanoid(),
        message: "I'm sorry, I'm having trouble processing your request. Please try again later.",
        isUserMessage: false
      }]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    // Add user message to chat
    const userMessage = {
      id: nanoid(),
      message: inputValue,
      isUserMessage: true
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(inputValue);
    
    // Clear input
    setInputValue("");
    
    // Prevent scroll jumping
    e.currentTarget.scrollTo(0, 0);
  };

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg transition-colors">
      <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-lg font-semibold dark:text-white">PharmAssist Chat</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask any questions about medications and get instant answers</p>
      </CardHeader>
      <CardContent className="h-80 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUserMessage ? 'justify-end' : ''}`}>
            {!message.isUserMessage && (
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div 
              className={`p-3 max-w-[80%] ${
                message.isUserMessage 
                  ? 'bg-blue-50 dark:bg-blue-900 rounded-2xl rounded-br-sm' 
                  : 'bg-slate-50 dark:bg-slate-700 rounded-2xl rounded-bl-sm'
              } transition-colors`}
            >
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line">{message.message}</p>
            </div>
            {message.isUserMessage && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ml-3 flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t border-slate-200 dark:border-slate-700 p-4 transition-colors">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Ask a question about medications..." 
              className="flex-1 dark:bg-slate-700 dark:text-white dark:border-slate-600"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={chatMutation.isPending}
              aria-label="Send message"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center">
            <Info size={10} className="mr-1" />
            For informational purposes only. Consult a healthcare professional for medical advice.
          </p>
        </form>
      </CardFooter>
    </Card>
  );
}
