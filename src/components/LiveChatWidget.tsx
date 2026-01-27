import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickReplies = [
  'Track my order',
  'Return policy',
  'Shipping info',
  'Contact support',
];

const botResponses: Record<string, string> = {
  'track my order': 'To track your order, please go to your Dashboard > Orders and click on the order you want to track. You can also use our Track Order page with your order number.',
  'return policy': 'We offer a 7-day return policy for all products. Items must be unused and in original packaging. Visit our Returns & Exchanges page for more details.',
  'shipping info': 'We offer free shipping on orders over ৳5,000. Standard delivery takes 2-5 business days within Dhaka and 5-7 days outside Dhaka.',
  'contact support': 'You can reach our support team at support@jhuri.com or call us at +880 1234-567890. Our support hours are 9 AM - 9 PM, 7 days a week.',
  default: "Thank you for your message! Our team will get back to you shortly. In the meantime, you can browse our FAQs or check your order status in the Dashboard.",
};

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! 👋 Welcome to Jhuri. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerText = messageText.toLowerCase();
      let response = botResponses.default;
      
      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 bg-card border rounded-2xl shadow-2xl overflow-hidden ${
              isMinimized
                ? 'bottom-6 right-6 w-72 h-14'
                : 'bottom-6 right-6 w-96 h-[500px] max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary/80 text-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {!isMinimized && (
                  <div>
                    <h3 className="font-semibold">Jhuri Support</h3>
                    <p className="text-xs text-white/80">Usually replies instantly</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="h-[340px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={message.sender === 'bot' ? 'bg-primary/20' : 'bg-secondary'}>
                            {message.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-secondary rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t overflow-x-auto">
                  <div className="flex gap-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply}
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs rounded-full"
                        onClick={() => handleSend(reply)}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="rounded-full"
                    />
                    <Button type="submit" size="icon" className="rounded-full shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
