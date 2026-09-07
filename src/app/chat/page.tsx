"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Users, Search, MoreVertical, Paperclip, Smile, LayoutDashboard, CalendarRange, MessageSquare, User } from "lucide-react";
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

// Mock data
const mockEvents = [
  { id: "1", name: "Hackathon 2026", lastMessage: "Let's meet at 5 PM.", time: "10:24 AM", unread: 2, image: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Study Group - AI", lastMessage: "Did anyone finish the assignment?", time: "Yesterday", unread: 0, image: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Campus Social", lastMessage: "See you there!", time: "Monday", unread: 0, image: "https://i.pravatar.cc/150?img=3" },
];

const mockMessages = [
  { id: "m1", senderId: "u1", senderName: "Alice", text: "Hey everyone! When are we starting?", time: "10:15 AM", isMe: false },
  { id: "m2", senderId: "me", senderName: "You", text: "I'll be there in 10 minutes.", time: "10:17 AM", isMe: true },
  { id: "m3", senderId: "u2", senderName: "Bob", text: "Great, I'm bringing the snacks.", time: "10:20 AM", isMe: false },
  { id: "m4", senderId: "u1", senderName: "Alice", text: "Let's meet at 5 PM.", time: "10:24 AM", isMe: false },
];

export default function ChatPage() {
  const [activeEvent, setActiveEvent] = useState(mockEvents[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-0 sm:p-4 md:p-6 font-sans antialiased text-gray-800 flex items-center justify-center">
      
      {/* App Shell mimicking the Login Card but Fullscreen */}
      <div className="w-full h-full sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] bg-white sm:rounded-[32px] border-0 sm:border border-[#e5e7eb] shadow-sm flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar - Active Chats */}
        <aside className="w-full md:w-80 lg:w-[380px] flex-shrink-0 border-b md:border-b-0 md:border-r border-[#e5e7eb] bg-[#fafafa] flex flex-col hidden md:flex">
          <div className="p-6 border-b border-[#e5e7eb] bg-white">
            <h1 className={`${merriweather.className} font-bold text-[28px] text-[#363636] tracking-normal mb-5`}>
              Messages
            </h1>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subtext">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 focus:ring-[#363636] focus:border-[#363636] text-[14px] bg-white transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto chat-scrollbar bg-[#fafafa]">
            {mockEvents.map((evt) => (
              <div 
                key={evt.id} 
                onClick={() => setActiveEvent(evt)}
                className={`flex items-center gap-4 p-5 cursor-pointer transition-colors border-b border-[#e5e7eb] ${
                  activeEvent.id === evt.id 
                    ? 'bg-white border-l-4 border-l-[#363636]' 
                    : 'hover:bg-white border-l-4 border-l-transparent'
                }`}
              >
                <img src={evt.image} alt={evt.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 text-[15px] truncate">{evt.name}</h3>
                    <span className="text-xs text-subtext whitespace-nowrap font-medium">{evt.time}</span>
                  </div>
                  <p className="text-[14px] text-gray-500 truncate">{evt.lastMessage}</p>
                </div>
                {evt.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#444444] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                    {evt.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-[#e5e7eb] bg-white flex justify-center space-x-6 items-center text-gray-400 shrink-0">
            <a href="/dashboard" className="hover:text-[#444444] transition-colors p-2" title="Dashboard">
              <LayoutDashboard className="w-5 h-5" />
            </a>
            <a href="/events" className="hover:text-[#444444] transition-colors p-2" title="Activities & Events">
              <CalendarRange className="w-5 h-5" />
            </a>
            <a href="/profile" className="hover:text-[#444444] transition-colors p-2" title="Profile">
              <User className="w-5 h-5" />
            </a>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white relative h-full">
          {/* Chat Header */}
          <header className="h-[88px] border-b border-[#e5e7eb] bg-white z-10 flex items-center justify-between px-6 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <img src={activeEvent.image} alt={activeEvent.name} className="w-11 h-11 rounded-full object-cover shadow-sm border border-gray-200" />
              <div>
                <h2 className={`${merriweather.className} font-bold text-[#363636] text-[18px]`}>{activeEvent.name}</h2>
                <p className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  3 participants online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><Users className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 chat-scrollbar space-y-6 bg-white">
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 text-[12px] font-medium text-gray-500 px-4 py-1.5 rounded-full border border-gray-200">
                Today
              </div>
            </div>
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col animate-message ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                {!msg.isMe && (
                  <span className="text-[12px] font-medium text-gray-500 ml-1 mb-1.5">{msg.senderName}</span>
                )}
                <div 
                  className={`max-w-[75%] md:max-w-[65%] px-5 py-3 shadow-sm text-[15px] leading-relaxed ${
                    msg.isMe 
                      ? 'bg-[#444444] text-white rounded-[20px] rounded-br-sm' 
                      : 'bg-[#f3f4f6] text-gray-800 border border-gray-200 rounded-[20px] rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[11px] font-medium text-gray-400 mt-1.5 mx-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 md:p-6 bg-white border-t border-[#e5e7eb] shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
              <div className="flex items-center gap-1 text-gray-400 pb-2">
                <button type="button" className="p-2 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full py-3.5 pl-4 pr-12 bg-gray-50 border border-[#c4c7cc] rounded-[20px] text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 focus:ring-[#363636] focus:border-[#363636] text-[15px] transition-shadow shadow-sm"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className={`p-3.5 rounded-full shrink-0 transition-all shadow-sm ${
                  inputText.trim() 
                    ? 'bg-[#444444] text-white hover:bg-[#333333] hover:-translate-y-0.5' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </div>
        </main>
        
      </div>
    </div>
  );
}
