"use client";

import React, { useState } from "react";
import Head from "next/head";
import { apiFetch } from "@/lib/api";
import Cookies from "js-cookie";
import { 
  LayoutDashboard, 
  CalendarRange, 
  MessageSquare, 
  User, 
  Sparkles, 
  Ticket, 
  PenTool,
  SearchX,
  MapPin,
  Clock,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useGlobalChat } from "@/app/providers/GlobalChatProvider";

export default function ActivitiesEventsPage() {
  const [activeTab, setActiveTab] = useState<"recommended" | "my-events" | "created-events">("recommended");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);
  const isFirstRender = React.useRef(true);
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  
  const { totalUnreadCount } = useGlobalChat();

  const categories = ["All", "Tech", "Study", "Outdoors", "Social", "Creative"];

  const EVENTS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PER_PAGE));

  const loadEvents = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: EVENTS_PER_PAGE.toString(),
        tab: activeTab,
        category: activeCategory
      });
      
      const res = await apiFetch(`/api/events?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setEvents(result.events || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
    
    if (showLoading) setIsLoading(false);
  };

  // Read from URL on mount
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab") as any;
    const categoryFromUrl = searchParams.get("category");
    const page = searchParams.get("page");

    if (tab) setActiveTab(tab);
    if (categoryFromUrl) {
      const matchedCategory = categories.find(c => c.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matchedCategory) setActiveCategory(matchedCategory);
    }
    if (page) setCurrentPage(Number(page));
    
    setIsUrlLoaded(true);
  }, []);

  // Update URL whenever state changes
  React.useEffect(() => {
    if (!isUrlLoaded) return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    params.set("category", activeCategory.toLowerCase());
    params.set("page", currentPage.toString());
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [activeTab, activeCategory, currentPage, isUrlLoaded]);

  // Reset to page 1 ONLY when tab or category changes, not on mount
  React.useEffect(() => {
    if (isFirstRender.current) {
      if (isUrlLoaded) isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [activeTab, activeCategory, isUrlLoaded]);

  // Fetch events when page, tab, or category changes
  React.useEffect(() => {
    if (!isUrlLoaded) return;
    loadEvents();
  }, [currentPage, activeTab, activeCategory, isUrlLoaded]);

  const handleJoinLeave = async (id: string, isJoined: boolean) => {
    setProcessingEventId(id);
    
    // Optimistic UI Update
    setEvents(prev => prev.map(e => 
      e.id === id ? { 
        ...e, 
        isJoined: !isJoined, 
        joinedCount: e.joinedCount + (isJoined ? -1 : 1) 
      } : e
    ));

    try {
      if (isJoined) {
        await apiFetch(`/api/events/${id}/leave`, { method: "POST" });
      } else {
        await apiFetch(`/api/events/${id}/join`, { method: "POST" });
      }
    } catch (error) {
      // Revert on failure
      setEvents(prev => prev.map(e => 
        e.id === id ? { 
          ...e, 
          isJoined: isJoined, 
          joinedCount: e.joinedCount + (isJoined ? 1 : -1) 
        } : e
      ));
      console.error("Failed to join/leave event:", error);
    }
    
    setProcessingEventId(null);
  };

  const handleEditEvent = (id: string) => {
    console.log("Edit event", id);
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    
    const startDatetime = `${date}T${startTime}:00`;
    const endDatetime = `${date}T${endTime}:00`;
    
    setFormError("");
    
    try {
      const res = await apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title") as string,
          category: formData.get("category") as string,
          description: formData.get("description") as string, 
          startTime: startDatetime,
          endTime: endDatetime,
          location: formData.get("location") as string,
          maxParticipants: parseInt(formData.get("capacity") as string) || 10,
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.detail || "Failed to create event");
        return;
      }
      
      setIsModalOpen(false);
      await loadEvents();
    } catch (e) {
      setFormError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Head>
        <title>Activities & Events | The Quad</title>
      </Head>

      {/* Navigation / Header Area */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-center items-center">
          <div className="flex space-x-6 text-gray-400 items-center">
            <a href="/dashboard" className="hover:text-[#444444] transition-colors p-2" title="Dashboard">
              <LayoutDashboard className="w-5 h-5" />
            </a>
            <a href="/events" className="text-[#444444] border-b-2 border-[#444444] pb-1 px-2 pt-2" title="Activities & Events">
              <CalendarRange className="w-5 h-5" />
            </a>
            <a href="/chat" className="hover:text-[#444444] transition-colors p-2 relative" title="Chat">
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </a>
            <a href="/profile" className="hover:text-[#444444] transition-colors p-2" title="Profile">
              <User className="w-5 h-5" />
            </a>
            <button onClick={() => { Cookies.remove('access_token'); window.location.href = '/login'; }} className="hover:text-red-500 transition-colors p-2" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#444444] tracking-tight mb-2">Activities & Events</h1>
            <p className="text-gray-500 text-sm">Discover and join events matched to your interests and social energy.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-0 bg-[#444444] hover:bg-[#333333] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Create Event</span>
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200 mb-6 space-x-8 overflow-x-auto chat-scrollbar">
          <button 
            onClick={() => setActiveTab("recommended")}
            className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "recommended" ? "text-[#444444]" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Sparkles className="w-4 h-4" /> Recommended
            {activeTab === "recommended" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#444444] rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("my-events")}
            className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "my-events" ? "text-[#444444]" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Ticket className="w-4 h-4" /> My Events
            {activeTab === "my-events" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#444444] rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("created-events")}
            className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "created-events" ? "text-[#444444]" : "text-gray-400 hover:text-gray-600"}`}
          >
            <PenTool className="w-4 h-4" /> Created Events
            {activeTab === "created-events" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#444444] rounded-t-full"></span>}
          </button>
        </div>

        {/* Interactive Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 chat-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap ${
                activeCategory === category 
                  ? "bg-[#444444] text-white border border-[#444444]" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#444444] hover:text-[#444444]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
                <div className="h-28 w-full bg-gray-200/60 border-b border-gray-100 p-4"></div>
                <div className="px-6 pt-5 pb-2 flex-grow space-y-3">
                  <div className="h-6 bg-gray-200/60 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200/60 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-200/60 rounded-md w-5/6 mb-4"></div>
                  
                  <div className="h-4 bg-gray-200/60 rounded-md w-1/2"></div>
                  <div className="h-4 bg-gray-200/60 rounded-md w-2/5 mb-3"></div>
                  
                  <div className="w-full h-20 my-4 rounded-xl bg-gray-200/60 border border-gray-100"></div>
                  <div className="bg-gray-100/60 rounded-xl p-3 mb-2 h-16 w-full"></div>
                </div>
                <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="h-4 bg-gray-200/60 rounded-md w-1/3"></div>
                  <div className="h-9 bg-gray-200/60 rounded-xl w-20"></div>
                </div>
              </div>
            ))
          ) : (
            events.map((event) => {
            const isJoined = event.isJoined;
            const isFull = event.joinedCount >= event.capacity;
            const isCreatedByMe = event.isHost;
            const isHighMatch = event.similarity >= 90;
            
            return (
              <div key={event.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                
                {/* Rich Visual Header */}
                <div className="h-28 w-full bg-[rgba(249,250,251,0.5)] border-b border-gray-100 relative p-4 flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                    {event.category}
                  </span>
                  
                  {!isCreatedByMe && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all bg-white/90 backdrop-blur-sm text-gray-500 border border-gray-200">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{event.similarity}% Match</span>
                    </div>
                  )}
                  {isCreatedByMe && (
                     <div className="flex items-center space-x-1 text-blue-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black shadow-sm">
                       <span>Organizer</span>
                     </div>
                  )}
                </div>

                {/* Card Body: Info */}
                <div className="px-6 pt-5 pb-2 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#444444] transition-colors">{event.title}</h3>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-2 font-medium">
                    <Clock className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
                    {event.datetime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3 font-medium">
                    <MapPin className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
                    {event.location}
                  </div>
                  
                  {/* Mini Map Placeholder */}
                  <div className="w-full h-20 mb-5 rounded-xl bg-[#eef0f2] flex items-center justify-center border border-gray-200 relative overflow-hidden group/map cursor-pointer">
                    {/* Fake roads styling */}
                    <div className="absolute w-full h-2 bg-white top-1/2 -translate-y-1/2 rotate-12"></div>
                    <div className="absolute w-2 h-full bg-white left-1/3 -translate-x-1/2 -rotate-12"></div>
                    <div className="absolute w-full h-2 bg-white top-1/4 -translate-y-1/2 -rotate-6"></div>
                    
                    {/* Location Pin */}
                    <div className="relative z-10 flex flex-col items-center group-hover/map:-translate-y-1 transition-transform duration-300">
                       <MapPin className="w-6 h-6 text-red-500 fill-red-100 drop-shadow-sm" />
                       <div className="w-2.5 h-1 bg-gray-400/50 rounded-full blur-[1px] mt-0.5"></div>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] opacity-0 group-hover/map:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider bg-white px-3 py-1.5 rounded-full shadow-sm">View Map</span>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="bg-gray-50/80 rounded-xl p-3 mb-4 text-[13px] text-gray-600 leading-relaxed flex items-start border border-gray-100">
                    <span className="mr-2 mt-0.5 shrink-0" aria-hidden="true">
                      {isCreatedByMe ? <PenTool className="w-4 h-4 text-[#444444]" /> : <Sparkles className="w-4 h-4 text-[#444444]" />}
                    </span>
                    <p>{event.rationale}</p>
                  </div>
                </div>

                {/* Card Footer: Capacity, Social Proof & CTA */}
                <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  
                  <div className="flex flex-col mr-2">
                    <div className="flex items-center mb-1.5">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mr-3">
                        {event.joinedCount}/{event.capacity}
                      </span>
                      {/* Avatar Social Proof Cluster */}
                      <div className="flex -space-x-2">
                        {event.participants.slice(0, 3).map((img: string, idx: number) => (
                          <img key={idx} src={img} className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover" alt="Participant" />
                        ))}
                        {event.participants.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 z-10">
                            +{event.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-red-400' : 'bg-[#444444]'}`} 
                        style={{ width: `${(event.joinedCount / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {isCreatedByMe ? (
                    <div className="flex space-x-2 shrink-0">
                      <a 
                        href={`/chat?eventid=${event.id}`}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-[#444444] text-white hover:bg-[#333333] shadow-sm transition-colors flex items-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        Chat
                      </a>
                      <button 
                        onClick={() => handleEditEvent(event.id)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-300 text-[#444444] hover:bg-gray-50 shadow-sm transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 shrink-0">
                      {(isJoined && processingEventId !== event.id) && (
                        <a 
                          href={`/chat?eventid=${event.id}`}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#444444] text-white hover:bg-[#333333] shadow-sm transition-colors flex items-center justify-center animate-in fade-in zoom-in duration-300"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </a>
                      )}
                      <button 
                        onClick={() => handleJoinLeave(event.id, isJoined)}
                        disabled={(isFull && !isJoined) || processingEventId === event.id}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[70px] ${
                          isJoined 
                            ? "bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-red-500"
                            : isFull 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                              : "bg-white border border-gray-300 text-[#444444] hover:border-[#444444] hover:bg-gray-50"
                        } ${(processingEventId === event.id) ? "opacity-75 cursor-wait" : ""}`}
                      >
                        {processingEventId === event.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          isJoined ? "Leave" : isFull ? "Full" : "Join"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Pagination Controls */}
        {totalCount > EVENTS_PER_PAGE && (
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Wow Empty State */}
        {!isLoading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in duration-500">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a little quiet here...</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find any events matching your current filters. Why not take the lead and host something yourself?
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#444444] hover:bg-[#333333] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              Be the first to create one!
            </button>
          </div>
        )}
      </main>

      {/* Create Event Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#444444]" /> Create Event
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#444444] transition-colors p-1.5 rounded-full hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-500 font-bold text-xs">!</span>
                </div>
                <p className="text-sm text-red-600 font-medium">{formError}</p>
              </div>
            )}
            
            <form className="p-6 space-y-5" onSubmit={handleCreateEvent}>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="title">Event Title</label>
                <input required id="title" name="title" type="text" placeholder="e.g., Sunday Soccer Scrimmage" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="category">Category</label>
                  <select required id="category" name="category" defaultValue="" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm bg-white">
                    <option value="" disabled>Select Category</option>
                    <option value="Tech">Tech</option>
                    <option value="Study">Study</option>
                    <option value="Outdoors">Outdoors</option>
                    <option value="Social">Social</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="capacity">Capacity</label>
                  <input required id="capacity" name="capacity" type="number" min="2" placeholder="e.g., 10" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="date">Date</label>
                  <input required id="date" name="date" type="date" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="startTime">Start Time</label>
                  <input required id="startTime" name="startTime" type="time" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="endTime">End Time</label>
                  <input required id="endTime" name="endTime" type="time" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="location">Location</label>
                <input required id="location" name="location" type="text" placeholder="e.g., Campus Gym" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="description">Description</label>
                <textarea required id="description" name="description" rows={3} placeholder="What is this event about?" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm"></textarea>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full bg-[#444444] hover:bg-[#333333] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                  Post Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
