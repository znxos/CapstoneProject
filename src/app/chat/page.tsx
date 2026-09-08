"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Users, Search, MoreVertical, Paperclip, Smile, LayoutDashboard, CalendarRange, User, LogOut, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { Merriweather } from "next/font/google";
import { signOut } from "next-auth/react";
import { getMessages, sendMessage } from "../actions/chat";
import { useGlobalChat } from "../providers/GlobalChatProvider";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });



const bubbleColors = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-purple-50 border-purple-200 text-purple-900",
  "bg-green-50 border-green-200 text-green-900",
  "bg-yellow-50 border-yellow-200 text-yellow-900",
  "bg-pink-50 border-pink-200 text-pink-900",
  "bg-indigo-50 border-indigo-200 text-indigo-900",
  "bg-teal-50 border-teal-200 text-teal-900",
  "bg-orange-50 border-orange-200 text-orange-900",
];

const getBubbleColor = (senderId: string) => {
  if (!senderId) return "bg-[#f3f4f6] border-gray-200 text-gray-800";
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bubbleColors[Math.abs(hash) % bubbleColors.length];
};

export default function ChatPage() {
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [inputText, setInputText] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const {
    events,
    messagesByEvent,
    setMessagesByEvent,
    unreadCounts,
    setUnreadCounts,
    isLoadingEvents: isLoading,
    currentUserId,
    setCurrentUserId,
    activeEventIdRef
  } = useGlobalChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    activeEventIdRef.current = activeEvent?.id || null;
  }, [activeEvent, activeEventIdRef]);

  const activeMessages = activeEvent ? (messagesByEvent[activeEvent.id] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMessagesLoading) {
      // Use a small timeout to ensure DOM layout has fully updated before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }
  }, [activeMessages, isMessagesLoading, activeEvent]);

  // Local loading of historical messages when activeEvent changes
  useEffect(() => {
    if (!activeEvent) return;

    // Clear unread count when viewing
    setUnreadCounts(prev => ({ ...prev, [activeEvent.id]: 0 }));

    let isMounted = true;

    if (messagesByEvent[activeEvent.id]) {
      // Already cached, simulate loading for 500ms for UX
      setIsMessagesLoading(true);
      setTimeout(() => {
        if (isMounted) {
          setIsMessagesLoading(false);
        }
      }, 500);
      return () => { isMounted = false; };
    }

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      const res = await getMessages(activeEvent.id);
      if (isMounted && res.messages) {
        setMessagesByEvent(prev => ({ ...prev, [activeEvent.id]: res.messages }));
        setCurrentUserId(res.currentUserId || null);
        setIsMessagesLoading(false);
      }
    };
    fetchMessages();

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeEvent) return;

    const textToSend = inputText;
    setInputText("");
    setErrorMsg("");

    // Create a temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      senderId: currentUserIdRef.current,
      senderName: "You",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      timestamp: Date.now()
    };

    // Optimistically add it to the UI immediately!
    setMessagesByEvent((prev) => {
      const existing = prev[activeEvent.id] || [];
      return { ...prev, [activeEvent.id]: [...existing, optimisticMessage] };
    });

    const res = await sendMessage(activeEvent.id, textToSend);
    
    if (res.error) {
      setErrorMsg(res.error);
      // Give them the text back ONLY if they haven't started typing a new message
      setInputText((prev) => prev.length > 0 ? prev : textToSend); 
      setMessagesByEvent((prev) => {
        if (!prev[activeEvent.id]) return prev;
        return { ...prev, [activeEvent.id]: prev[activeEvent.id].filter(m => m.id !== tempId) };
      });
    } else if (res.message) {
      // Replace temp ID with the real DB ID
      setMessagesByEvent((prev) => {
        if (!prev[activeEvent.id]) return prev;
        return {
          ...prev,
          [activeEvent.id]: prev[activeEvent.id].map(m => m.id === tempId ? { ...res.message, isMe: true } : m)
        };
      });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-0 sm:p-4 md:p-6 font-sans antialiased text-gray-800 flex items-center justify-center">
      <div className="w-full h-full sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] bg-white sm:rounded-[32px] border-0 sm:border border-[#e5e7eb] shadow-sm flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
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
                placeholder="Search events..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#c4c7cc] text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 focus:ring-[#363636] focus:border-[#363636] text-[14px] bg-white transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto chat-scrollbar bg-[#fafafa]">
            {isLoading ? (
              <div className="flex flex-col">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 border-b border-[#e5e7eb] animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="h-3.5 bg-gray-200 rounded-md w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 p-8 text-center text-sm">
                You haven't joined any events yet. Head over to the events page to join one!
              </div>
            ) : (
              events.map((evt) => (
                <div 
                  key={evt.id} 
                  onClick={() => {
                    if (activeEvent?.id !== evt.id) {
                      setIsMessagesLoading(true);
                      setActiveEvent(evt);
                    }
                  }}
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-colors border-b border-[#e5e7eb] ${
                    activeEvent?.id === evt.id 
                      ? 'bg-white border-l-4 border-l-[#363636]' 
                      : 'hover:bg-white border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-300">
                    {evt.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 text-[15px] truncate">{evt.title}</h3>
                      {unreadCounts[evt.id] > 0 && (
                        <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {unreadCounts[evt.id]}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-500 truncate">{evt.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>

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
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="hover:text-red-500 transition-colors p-2" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        {isLoading ? (
          <main className="flex-1 flex flex-col bg-white relative h-full animate-pulse">
            <header className="h-[88px] border-b border-[#e5e7eb] bg-white z-10 flex items-center justify-between px-6 shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 chat-scrollbar space-y-6 bg-white">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                  {i % 2 === 0 && <div className="h-2.5 bg-gray-100 rounded w-16 mb-2 ml-1"></div>}
                  <div className={`px-5 py-3 rounded-[20px] ${i % 2 === 0 ? 'bg-gray-100 rounded-bl-sm' : 'bg-gray-200 rounded-br-sm'} w-[60%] md:w-[45%] h-16`}></div>
                  <div className={`h-2 bg-gray-100 rounded w-10 mt-2 ${i % 2 === 0 ? 'mx-1' : 'mx-1'}`}></div>
                </div>
              ))}
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-[#e5e7eb] shrink-0">
              <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="flex items-center gap-1 pb-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100"></div>
                  <div className="w-9 h-9 rounded-full bg-gray-100"></div>
                </div>
                <div className="flex-1 h-[52px] bg-gray-50 border border-gray-100 rounded-[20px]"></div>
                <div className="w-[52px] h-[52px] rounded-full bg-gray-200 shrink-0"></div>
              </div>
            </div>
          </main>
        ) : activeEvent ? (
          <main className="flex-1 flex flex-col bg-white relative h-full">
            <header className="h-[88px] border-b border-[#e5e7eb] bg-white z-10 flex items-center justify-between px-6 shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-300">
                    {activeEvent.title.charAt(0)}
                </div>
                <div>
                  <h2 className={`${merriweather.className} font-bold text-[#363636] text-[18px]`}>{activeEvent.title}</h2>
                  <p className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Event Room
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><Users className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 chat-scrollbar space-y-6 bg-white">
              {isMessagesLoading ? (
                <div className="animate-pulse space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                      {i % 2 === 0 && <div className="h-2.5 bg-gray-100 rounded w-16 mb-2 ml-1"></div>}
                      <div className={`px-5 py-3 rounded-[20px] ${i % 2 === 0 ? 'bg-gray-100 rounded-bl-sm' : 'bg-gray-200 rounded-br-sm'} w-[60%] md:w-[45%] h-16`}></div>
                      <div className={`h-2 bg-gray-100 rounded w-10 mt-2 ${i % 2 === 0 ? 'mx-1' : 'mx-1'}`}></div>
                    </div>
                  ))}
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex justify-center mt-10 text-gray-400 text-sm font-medium">
                  Be the first to send a message!
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col animate-message ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!msg.isMe && (
                      <span className="text-[12px] font-medium text-gray-500 ml-1 mb-1.5">{msg.senderName}</span>
                    )}
                    <div 
                      className={`max-w-[75%] md:max-w-[65%] px-5 py-3 shadow-sm text-[15px] leading-relaxed break-words ${
                        msg.isMe 
                          ? 'bg-[#444444] text-white rounded-[20px] rounded-br-sm' 
                          : `${getBubbleColor(msg.senderId)} border rounded-[20px] rounded-bl-sm`
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 mt-1.5 mx-1">{msg.time}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-[#e5e7eb] shrink-0">
              {errorMsg && (
                <div className="mb-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}
              
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
                    className="w-full py-3.5 pl-4 pr-12 bg-gray-50 border border-[#c4c7cc] rounded-[20px] text-gray-800 placeholder-[#757575] focus:outline-none focus:ring-1 focus:ring-[#363636] focus:border-[#363636] text-[15px] transition-shadow shadow-sm disabled:opacity-60"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className={`p-3.5 rounded-full shrink-0 transition-all shadow-sm ${
                    inputText.trim()
                      ? 'bg-[#444444] text-white hover:bg-[#333333] hover:-translate-y-0.5' 
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col bg-white relative h-full items-center justify-center p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Select an Event</h2>
            <p className="text-gray-400 max-w-sm">Choose an event from the sidebar to start chatting with other participants.</p>
          </main>
        )}
      </div>
    </div>
  );
}
