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
  ChevronRight,
  Users,
  X,
  Flame,
  Laptop,
  BookOpen,
  Compass,
  Coffee,
  Palette,
  ArrowRight,
  GraduationCap,
  Info,
  CheckCircle2
} from "lucide-react";
import { useGlobalChat } from "@/app/providers/GlobalChatProvider";

// Category Visual Covers for Events
const CATEGORY_COVERS: Record<string, string> = {
  Tech: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  Study: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
  Outdoors: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  Social: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
  Creative: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
  Default: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
};

// Category Filter Config with Clean Neutral Grey Lucide Icons
const CATEGORIES_CONFIG = [
  { name: "All", icon: Flame, color: "text-gray-500" },
  { name: "Tech", icon: Laptop, color: "text-gray-500" },
  { name: "Study", icon: BookOpen, color: "text-gray-500" },
  { name: "Outdoors", icon: Compass, color: "text-gray-500" },
  { name: "Social", icon: Coffee, color: "text-gray-500" },
  { name: "Creative", icon: Palette, color: "text-gray-500" },
];

// Non-distractive, evenly distributed Academic SVG Watermark Pattern
function AcademicBackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="academic-bg-pattern" width="320" height="320" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#64748b" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.08">
              
              {/* Row 1, Col 1: Graduation Cap (Mortarboard) */}
              <g transform="translate(28, 28) scale(1.15) rotate(-6 12 12)">
                <path d="M 12 3 L 22 8 L 12 13 L 2 8 Z" />
                <path d="M 6 10.5 V 15.5 C 6 17.5 18 17.5 18 15.5 V 10.5" />
                <path d="M 20 9 V 15.5 M 19 15.5 H 21" />
              </g>

              {/* Row 1, Col 2: Atom & Science Orbitals */}
              <g transform="translate(108, 24) scale(1.15) rotate(12 12 12)">
                <circle cx="12" cy="12" r="2" fill="#64748b" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)" />
              </g>

              {/* Row 1, Col 3: Open Textbook */}
              <g transform="translate(188, 26) scale(1.15) rotate(-4 12 12)">
                <path d="M 12 6 V 19" />
                <path d="M 12 6 C 9 4.5 4 4.5 2 6 V 18 C 4 16.5 9 16.5 12 18" />
                <path d="M 12 6 C 15 4.5 20 4.5 22 6 V 18 C 20 16.5 15 16.5 12 18" />
              </g>

              {/* Row 1, Col 4: Mathematical Sigma (Summation) */}
              <g transform="translate(265, 28) scale(1.15)">
                <path d="M 17 6 H 7 L 12 12 L 7 18 H 17" />
              </g>

              {/* Row 2, Col 1: Chemistry Erlenmeyer Flask */}
              <g transform="translate(26, 108) scale(1.15) rotate(8 12 12)">
                <path d="M 10 3 H 14 M 10 3 V 7 M 14 3 V 7" />
                <path d="M 10 7 L 4.5 18 C 4 19 4.6 20 5.8 20 H 18.2 C 19.4 20 20 19 19.5 18 L 14 7" />
                <path d="M 7 15.5 C 9 14.5 11.5 16.5 14 15.5 C 15.5 15 16.5 15.5 17 15.5" />
                <circle cx="10" cy="12" r="0.8" fill="#64748b" />
              </g>

              {/* Row 2, Col 2: Eureka Lightbulb */}
              <g transform="translate(110, 110) scale(1.15) rotate(-8 12 12)">
                <path d="M 9 18 H 15 M 10 21 H 14" />
                <path d="M 12 2 C 7.5 2 4 5.5 4 10 C 4 12.8 5.8 14.8 7.5 16.5 C 8.5 17.5 8.5 18 8.5 18 H 15.5 C 15.5 18 15.5 17.5 16.5 16.5 C 18.2 14.8 20 12.8 20 10 C 20 5.5 16.5 2 12 2 Z" />
                <path d="M 10 10 L 12 8 L 14 10" />
              </g>

              {/* Row 2, Col 3: Research Microscope */}
              <g transform="translate(190, 106) scale(1.15) rotate(6 12 12)">
                <path d="M 5 21 H 19" />
                <path d="M 8 14 H 14" />
                <path d="M 11 3 L 8 8 M 13 4 L 10 9" />
                <path d="M 14 14 C 17 14 18 17 18 21" />
                <path d="M 10 2 L 13 5" />
              </g>

              {/* Row 2, Col 4: Mathematical Pi */}
              <g transform="translate(266, 108) scale(1.15) rotate(-5 12 12)">
                <path d="M 5 7 H 19 M 9 7 V 17 M 15 7 V 16 C 15 17 16 17.2 17.5 16.5" />
              </g>

              {/* Row 3, Col 1: Drafting Compass / Divider */}
              <g transform="translate(30, 190) scale(1.15) rotate(-10 12 12)">
                <circle cx="12" cy="4" r="2" />
                <path d="M 11 6 L 5.5 21" />
                <path d="M 13 6 L 18.5 21" />
                <path d="M 8.5 14.5 H 15.5" />
              </g>

              {/* Row 3, Col 2: Diploma Scroll */}
              <g transform="translate(106, 186) scale(1.15) rotate(10 12 12)">
                <path d="M 6 5 C 6 3.5 8 2.5 10 2.5 H 18 C 19.5 2.5 20.5 3.5 20.5 5 V 16 C 20.5 17.5 19.5 18.5 18 18.5 H 10 C 8 18.5 6 17.5 6 16 Z" />
                <path d="M 12 2.5 V 18.5" />
                <path d="M 10 12 L 8.5 16 M 13.5 12 L 15 16" />
                <path d="M 6 5 C 6 6.5 8 7.5 10 7.5 H 18" />
              </g>

              {/* Row 3, Col 3: Astronomy Telescope */}
              <g transform="translate(188, 188) scale(1.15) rotate(-6 12 12)">
                <path d="M 5 8 L 17 3 L 18.5 6 L 6.5 11 Z" />
                <path d="M 11 9 L 6 21 M 12 9 L 12 21 M 13 9 L 18 21" />
              </g>

              {/* Row 3, Col 4: Collegiate Shield Crest */}
              <g transform="translate(264, 190) scale(1.15) rotate(4 12 12)">
                <path d="M 12 3 L 5 6 V 11 C 5 16.5 12 20.5 12 20.5 C 12 20.5 19 16.5 19 11 V 6 Z" />
                <path d="M 12 7 V 15 M 8 10 H 16" />
              </g>

              {/* Row 4, Col 1: Globe / Atlas */}
              <g transform="translate(28, 268) scale(1.15) rotate(6 12 12)">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M 3.5 12 H 20.5" />
                <ellipse cx="12" cy="12" rx="4" ry="8.5" />
              </g>

              {/* Row 4, Col 2: Square Root / Radical */}
              <g transform="translate(108, 266) scale(1.15)">
                <path d="M 4 13 L 7 13 L 9.5 19 L 13.5 5 H 20" />
                <path d="M 15 10 L 18 14 M 18 10 L 15 14" />
              </g>

              {/* Row 4, Col 3: Pencil & Precision Ruler */}
              <g transform="translate(186, 268) scale(1.15) rotate(-8 12 12)">
                <path d="M 4 20 L 20 4 M 7 17 L 8.5 18.5 M 10 14 L 11.5 15.5 M 13 11 L 14.5 12.5 M 16 8 L 17.5 9.5" />
                <path d="M 4 4 L 6 2 L 19 15 L 17 17 Z M 4 4 L 2 7 L 6 6 Z" />
              </g>

              {/* Row 4, Col 4: DNA Double Helix */}
              <g transform="translate(266, 268) scale(1.15) rotate(10 12 12)">
                <path d="M 5 4 C 8 7 16 9 19 12 C 16 15 8 17 5 20" />
                <path d="M 19 4 C 16 7 8 9 5 12 C 8 15 16 17 19 20" />
                <path d="M 8 7 H 16 M 7 10 H 17 M 7 14 H 17 M 8 17 H 16" />
              </g>

            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-bg-pattern)" />
      </svg>
    </div>
  );
}

export default function ActivitiesEventsPage() {
  const [activeTab, setActiveTab] = useState<"recommended" | "my-events" | "created-events">("recommended");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isRecommendedExplainerDismissed, setIsRecommendedExplainerDismissed] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allEventsCount, setAllEventsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [generateMoreSuccess, setGenerateMoreSuccess] = useState(false);
  const [noMoreMatches, setNoMoreMatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);
  const isFirstRender = React.useRef(true);
  const eventGridRef = React.useRef<HTMLDivElement>(null);
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const todayStr = new Date().toISOString().split("T")[0];

  const openCreateModal = () => {
    setFormStartDate("");
    setFormEndDate("");
    setFormError("");
    setIsModalOpen(true);
  };
  
  const { totalUnreadCount } = useGlobalChat();

  const categories = ["All", "Tech", "Study", "Outdoors", "Social", "Creative"];

  const EVENTS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PER_PAGE));

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    if (eventGridRef.current) {
      const yOffset = -100;
      const y = eventGridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const loadAllCategoryCount = async (targetTab = activeTab) => {
    try {
      const qp = new URLSearchParams({
        page: "1",
        limit: "1",
        tab: targetTab,
        category: "All"
      });
      const res = await apiFetch(`/api/events?${qp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAllEventsCount(data.totalCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadEvents = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setNoMoreMatches(false);
      setGenerateMoreSuccess(false);
    }
    
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
        if (activeCategory === "All") {
          setAllEventsCount(result.totalCount || 0);
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    if (showLoading) setIsLoading(false);
  };

  const handleGenerateMoreAI = async () => {
    setIsGeneratingMore(true);
    setGenerateMoreSuccess(false);
    setNoMoreMatches(false);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: EVENTS_PER_PAGE.toString(),
        tab: "recommended",
        category: activeCategory,
        generate_more: "true"
      });
      const res = await apiFetch(`/api/events?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        const prevIds = events.map(e => e.id);
        const newEvents = result.events || [];
        const newIds = newEvents.map((e: any) => e.id);

        // Check if the events list on this page is identical to before (no new matches)
        const isIdentical = 
          prevIds.length === newIds.length && 
          prevIds.every((id, idx) => id === newIds[idx]);

        setEvents(newEvents);
        setTotalCount(result.totalCount || 0);

        if (isIdentical || result.hasMoreMatches === false) {
          setNoMoreMatches(true);
        } else {
          setGenerateMoreSuccess(true);
          setTimeout(() => setGenerateMoreSuccess(false), 3500);
        }
      }
    } catch (err) {
      console.error("Failed to generate more AI recommendations:", err);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Read from URL on mount
  React.useEffect(() => {
    // Check onboarding status on mount
    async function checkFirstLogin() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const user = await res.json();
          if (user.isFirstLogin) {
            window.location.href = "/onboarding";
            return;
          }
        }
      } catch (err) {
        // Silently continue if network fails
      }
    }
    checkFirstLogin();

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

  // Keep allEventsCount synchronized when tab changes
  React.useEffect(() => {
    if (!isUrlLoaded) return;
    if (activeCategory !== "All") {
      loadAllCategoryCount(activeTab);
    }
  }, [activeTab, isUrlLoaded]);

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
    const startDate = (formData.get("startDate") as string) || formStartDate;
    const startTime = formData.get("startTime") as string;
    const endDate = (formData.get("endDate") as string) || formEndDate;
    const endTime = formData.get("endTime") as string;
    
    if (!startDate || !startTime || !endDate || !endTime) {
      setFormError("Start date, start time, end date, and end time are all required.");
      return;
    }

    const startDatetime = `${startDate}T${startTime}:00`;
    const endDatetime = `${endDate}T${endTime}:00`;

    const startObj = new Date(startDatetime);
    const endObj = new Date(endDatetime);
    const now = new Date();

    if (endObj <= startObj) {
      setFormError("Event end date and time must be after the start date and time.");
      return;
    }

    if (endObj <= now) {
      setFormError("Event end date and time cannot be in the past.");
      return;
    }

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
      setFormStartDate("");
      setFormEndDate("");
      await loadEvents();
      await loadAllCategoryCount();
    } catch (e) {
      setFormError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 font-sans relative overflow-x-hidden selection:bg-[#444444] selection:text-white">
      <Head>
        <title>Activities & Events</title>
      </Head>

      {/* Non-distractive, evenly distributed Academic SVG Watermark Pattern spanning the entire page */}
      <AcademicBackgroundPattern />

      {/* Navigation / Header Area - Centered Floating Pill */}
      <header className="z-50 w-full flex justify-center pt-4 pb-[20px] px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md shadow-gray-200/50 rounded-full px-6 py-2 flex items-center justify-center transition-all">
          <div className="flex space-x-6 text-gray-400 items-center">
            <a href="/student-hub" className="hover:text-[#444444] transition-colors p-2" title="Student Hub">
              <LayoutDashboard className="w-5 h-5" />
            </a>
            <a href="/events" className="text-[#444444] border-b-2 border-[#444444] pb-1 px-2 pt-2" title="Activities & Events">
              <CalendarRange className="w-5 h-5" />
            </a>
            <a href="/chat" className="hover:text-[#444444] transition-colors p-2 relative" title="Chat">
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </a>
            <a href="/profile" className="hover:text-[#444444] transition-colors p-2" title="Profile">
              <User className="w-5 h-5" />
            </a>
            <button onClick={() => { Cookies.remove('access_token'); window.location.href = '/login'; }} className="hover:text-red-500 transition-colors p-2" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Page Header with Live Pulse Ticker */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-2xs text-xs font-semibold text-gray-600 mb-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Campus Live: <strong className="text-gray-900 font-bold">140+ students</strong> connected</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{allEventsCount > 0 ? allEventsCount : totalCount} active hangouts</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mb-2">Activities & Events</h1>
            <p className="text-gray-500 text-sm">Discover and join activities and events matched to your interests and social energy created by people at your insititution.</p>
            {isBannerDismissed && (
              <button 
                onClick={() => setIsBannerDismissed(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Find your people</span>
              </button>
            )}
          </div>
          
          <button 
            onClick={openCreateModal}
            className="mt-2 md:mt-0 bg-[#222222] hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2 shrink-0 active:scale-95"
          >
            <PenTool className="w-4 h-4 text-amber-400" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Motivating "Find Your People" Catalyst Banner */}
        {!isBannerDismissed && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172033] via-[#1c222c] to-[#2d2719] text-white p-6 sm:p-8 mb-8 border border-gray-700/60 shadow-2xl animate-in fade-in duration-300">
            {/* Background Yellow and Blue Ambient Gradient Glows */}
            <div className="absolute -top-16 -right-12 w-72 h-72 bg-blue-500/25 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-12 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-blue-500/15 pointer-events-none"></div>

            {/* Top Bar: Pill Tag & Dismiss Button */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-white" /> FIND YOUR PEOPLE
              </span>
              <button 
                onClick={() => setIsBannerDismissed(true)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Headline & Body */}
            <div className="relative z-10 max-w-3xl mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                Have plans in mind, but need more people?
                <br className="hidden sm:inline" /> Create an event and we&apos;ll handle the rest.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                We make first contact easier, eliminating the awkwardness of meeting new people.
              </p>
            </div>

            {/* 3 Core Value Pillars */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">You Host the Event</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">We&apos;ll connect you with the right people.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Small & Casual</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">Set a limit (max 10 people) for a low-pressure coffee run, gym session, or study.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Realtime Messaging</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">A private group chat is unlocked the instant someone joins.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <Ticket className="w-4 h-4" /> Joined Events
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

        {/* Interactive Category Filter Chips with Icons & Counts */}
        <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 chat-scrollbar">
          {CATEGORIES_CONFIG.map(({ name, icon: Icon, color }) => {
            const isActive = activeCategory === name;
            return (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-2xs ${
                  isActive 
                    ? "bg-[#222222] text-white shadow-md shadow-black/10 scale-[1.02] border border-[#222222]" 
                    : "bg-white/85 backdrop-blur-sm text-gray-600 border border-gray-200/80 hover:border-gray-300 hover:bg-white hover:text-gray-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gray-300" : color}`} />
                <span>{name}</span>
                {name === "All" && (allEventsCount > 0 || totalCount > 0) && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {allEventsCount > 0 ? allEventsCount : totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recommended AI Explanation Micro-Strip */}
        {activeTab === "recommended" && !isRecommendedExplainerDismissed && (
          <div className="bg-white/85 backdrop-blur-md border border-gray-200/80 rounded-2xl px-8 py-3 mb-6 relative flex items-center justify-center shadow-2xs animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <Sparkles className="w-4 h-4 text-gray-500 shrink-0" />
              <p className="text-xs text-gray-700 leading-snug text-center">
                Our algorithm will match you with others in real-time by matching your bio information captured during onboarding.
              </p>
              <a 
                href="/profile" 
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-black hover:underline transition-all shrink-0 ml-1"
              >
                <span>Manage Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </a>
            </div>

            <button
              onClick={() => setIsRecommendedExplainerDismissed(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Event Grid */}
        <div ref={eventGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
                <div className="h-28 w-full bg-gray-200/60 border-b border-gray-100 p-4"></div>
                <div className="px-6 pt-5 pb-2 flex-grow flex flex-col">
                  <div className="h-14 mb-2 flex flex-col justify-center space-y-1.5">
                    <div className="h-5 bg-gray-200/60 rounded-md w-3/4"></div>
                    <div className="h-5 bg-gray-200/60 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-[4.25rem] mb-3 flex flex-col justify-center space-y-1.5">
                    <div className="h-3.5 bg-gray-200/60 rounded-md w-full"></div>
                    <div className="h-3.5 bg-gray-200/60 rounded-md w-11/12"></div>
                    <div className="h-3.5 bg-gray-200/60 rounded-md w-4/6"></div>
                  </div>
                  
                  <div className="h-5 mb-2 flex items-center">
                    <div className="h-4 bg-gray-200/60 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-10 mb-4 flex items-center space-y-1 flex-col justify-center">
                    <div className="h-3.5 bg-gray-200/60 rounded-md w-full"></div>
                    <div className="h-3.5 bg-gray-200/60 rounded-md w-3/4"></div>
                  </div>
                  
                  <div className="w-full h-20 mb-4 rounded-xl bg-gray-200/60 border border-gray-100 shrink-0"></div>
                  <div className="bg-gray-100/60 rounded-xl p-3.5 h-[128px] w-full mb-2 shrink-0"></div>
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
              <div key={event.id} className="relative group">
                {/* Fixed Grid Placeholder: Keeps all rows and adjacent cards rock-solid and aligned */}
                <div className="invisible bg-white rounded-3xl border border-transparent p-0 flex flex-col pointer-events-none select-none" aria-hidden="true">
                  <div className="h-28 w-full"></div>
                  <div className="px-6 pt-5 pb-2 flex-grow flex flex-col">
                    <div className="h-14 mb-2"></div>
                    <div className="h-[4.25rem] mb-3"></div>
                    <div className="h-5 mb-2"></div>
                    <div className="h-10 mb-4"></div>
                    <div className="h-20 mb-4"></div>
                    <div className="h-[128px] mb-2"></div>
                  </div>
                  <div className="px-6 py-5">
                    <div className="h-9"></div>
                  </div>
                </div>

                {/* Floating Interactive Card: Normal aligned state by default; seamlessly expands downward on hover if truncated */}
                <div className="absolute top-0 left-0 w-full min-h-full bg-white/95 backdrop-blur-xs rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 z-10 hover:z-30">
                  
                  {/* Rich Visual Cover with Gradient Overlay */}
                  <div className="h-28 w-full relative p-4 flex justify-between items-start shrink-0 border-b border-gray-100">
                    <div className="absolute inset-0 overflow-hidden">
                      <img 
                        src={CATEGORY_COVERS[event.category] || CATEGORY_COVERS.Default} 
                        alt={event.category}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none"></div>
                    </div>

                    {/* Top Left: Category Tag & Ended Status Badge */}
                    <div className="relative z-10 flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/20">
                        {event.category}
                      </span>
                      
                      {event.isEnded && (
                        <div className="relative group/ended">
                          <div 
                            className="flex items-center space-x-1.5 text-white bg-red-600/90 backdrop-blur-md px-2.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-red-950/20 border border-red-400/40 cursor-help transition-all duration-150 hover:bg-red-600 active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span>Ended</span>
                            <Info className="w-3.5 h-3.5 text-white/90 shrink-0" />
                          </div>

                          {/* Hover Tooltip Card */}
                          <div className="absolute left-0 top-full mt-2 hidden group-hover/ended:flex flex-col w-60 p-3 bg-gray-900/95 backdrop-blur-md text-white text-[11px] leading-snug rounded-2xl shadow-2xl border border-white/10 pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-start gap-2">
                              <div className="p-1 rounded-full bg-red-500/20 text-red-400 shrink-0 mt-0.5">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-red-300 block mb-0.5">Event Finished</span>
                                <p className="text-gray-200">
                                  Ended events stop being recommended to people but the ability to chat is still available.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Top Right Badges: Match % or Organizer */}
                    <div className="relative z-10 flex items-center space-x-1.5">
                      {!isCreatedByMe && (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-md transition-all backdrop-blur-md bg-black/40 text-white">
                          <Sparkles className="w-3.5 h-3.5 text-gray-300" />
                          <span>{event.similarity}% Match</span>
                        </div>
                      )}
                      {isCreatedByMe && (
                        <div className="flex items-center space-x-1 text-white bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black shadow-md border border-blue-400/30">
                          <span>Organizer</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Info */}
                  <div className="px-6 pt-5 pb-2 flex-grow flex flex-col">
                    {/* Title: Exactly 2 lines aligned; unclamps on card hover */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#444444] transition-colors line-clamp-2 min-h-[3.5rem] group-hover:line-clamp-none group-hover:h-auto" title={event.title}>
                      {event.title}
                    </h3>
                    
                    {/* Description: 3 lines aligned; unclamps on card hover */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[4.25rem] group-hover:line-clamp-none group-hover:h-auto leading-relaxed transition-all">
                      {event.description || "\u00A0"}
                    </p>

                    {/* Datetime: 1 line (h-5) */}
                    <div className="flex items-center text-sm text-gray-500 mb-2 font-medium h-5 shrink-0">
                      <Clock className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" />
                      <span className="truncate">{event.datetime}</span>
                    </div>

                    {/* Location: 2 lines aligned; unclamps on card hover */}
                    <div className="flex items-start text-sm text-gray-500 mb-4 font-medium min-h-[2.5rem] group-hover:h-auto">
                      <MapPin className="w-4 h-4 mr-2.5 mt-0.5 text-gray-400 shrink-0" />
                      <span className="line-clamp-2 group-hover:line-clamp-none leading-snug transition-all" title={event.location}>{event.location}</span>
                    </div>
                    
                    {/* Mini Map: Styled Campus Vector Snippet */}
                    <div className="w-full h-20 mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center border border-gray-200 relative overflow-hidden group/map cursor-pointer shrink-0 shadow-inner">
                      {/* Stylized vector map streets */}
                      <div className="absolute w-full h-2.5 bg-white/90 top-1/2 -translate-y-1/2 rotate-12 shadow-2xs"></div>
                      <div className="absolute w-2.5 h-full bg-white/90 left-1/3 -translate-x-1/2 -rotate-12 shadow-2xs"></div>
                      <div className="absolute w-full h-2 bg-white/80 top-1/4 -translate-y-1/2 -rotate-6"></div>
                      <div className="absolute w-full h-1.5 bg-slate-200/90 bottom-1/4 rotate-3"></div>
                      
                      {/* Radar Pulse Ring on Location Pin */}
                      <div className="relative z-10 flex flex-col items-center group-hover/map:-translate-y-1 transition-transform duration-300">
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-red-400 opacity-40"></span>
                          <MapPin className="w-6 h-6 text-red-500 fill-red-100 drop-shadow-md relative z-10" />
                        </div>
                        <div className="w-3 h-1 bg-gray-400/60 rounded-full blur-[1px] mt-0.5"></div>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] opacity-0 group-hover/map:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/20 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-400" /> View Campus Venue
                        </span>
                      </div>
                    </div>

                    {/* Rationale: 128px / 5 lines aligned; unclamps on card hover */}
                    <div className="bg-gray-50/90 rounded-2xl p-3.5 mb-2 text-gray-600 flex items-start border border-gray-100 min-h-[128px] group-hover:h-auto group-hover:max-h-none transition-all shrink-0 shadow-2xs">
                      <span className="mr-2.5 mt-0.5 shrink-0" aria-hidden="true">
                        {isCreatedByMe ? <PenTool className="w-4 h-4 text-[#444444]" /> : <Sparkles className="w-4 h-4 text-gray-400" />}
                      </span>
                      <p className="line-clamp-5 group-hover:line-clamp-none text-gray-600 text-[12.5px] leading-relaxed transition-all" title={event.rationale}>
                        {event.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Capacity, Social Proof & CTA */}
                  <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto shrink-0">
                    
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
                          className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-gradient-to-r from-emerald-500 to-[#444444]'}`} 
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
                          disabled={(isFull && !isJoined) || processingEventId === event.id || (!isJoined && event.isEnded)}
                          title={(!isJoined && event.isEnded) ? "Ended events stop being recommended to people but the ability to chat is still available." : undefined}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[70px] ${
                            !isJoined && event.isEnded
                              ? "bg-red-50 text-red-500/80 cursor-not-allowed shadow-none border border-red-200/70"
                              : isJoined 
                                ? "bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-red-500"
                                : isFull 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                                  : "bg-white border border-gray-300 text-[#444444] hover:border-[#444444] hover:bg-gray-50"
                          } ${(processingEventId === event.id) ? "opacity-75 cursor-wait" : ""}`}
                        >
                          {processingEventId === event.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            isJoined ? "Leave" : (event.isEnded ? "Ended" : (isFull ? "Full" : "Join"))
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* On-Demand Generate More AI Matches Action (Recommended Tab Only - Last Page Only) */}
        {activeTab === "recommended" && !isLoading && events.length > 0 && currentPage === totalPages && (
          <div className="flex flex-col items-center justify-center mt-10 mb-2 animate-in fade-in duration-300">
            <button
              onClick={handleGenerateMoreAI}
              disabled={isGeneratingMore || isLoading || noMoreMatches}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-200 border ${
                noMoreMatches
                  ? "bg-gray-800/80 border-gray-700/80 text-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-gray-900 via-[#333333] to-gray-900 hover:shadow-xl hover:scale-105 active:scale-95 border-gray-700/50 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              }`}
            >
              {isGeneratingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Analyzing Campus Matches with AI...</span>
                </>
              ) : noMoreMatches ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-200">No More Matches Available</span>
                </>
              ) : generateMoreSuccess ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Matches Updated with AI!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Generate More AI Matches</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              {noMoreMatches
                ? "All available campus events have been evaluated. Check back later as new events are posted!"
                : generateMoreSuccess 
                  ? "Evaluated additional campus events and updated match rankings."
                  : "You've reached the end of current matches. Click to analyze more unjoined campus events."
              }
            </p>
          </div>
        )}

        {/* Elevated Floating Pill Pagination */}
        {totalCount > EVENTS_PER_PAGE && (
          <div className="flex flex-col items-center justify-center mt-12 mb-4 gap-2.5 animate-in fade-in duration-300">
            <div 
              role="navigation" 
              aria-label="Pagination Navigation"
              className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md shadow-gray-200/50"
            >
              {/* Previous Button */}
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                aria-label="Previous Page"
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Direct Page Number Chips */}
              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((page, idx) => (
                  typeof page === "number" ? (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`w-9 h-9 rounded-full text-xs font-black transition-all duration-200 flex items-center justify-center ${
                        currentPage === page
                          ? "bg-[#222222] text-white shadow-sm scale-105"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={idx} className="w-7 text-center text-gray-400 font-bold select-none text-xs">
                      •••
                    </span>
                  )
                ))}
              </div>

              {/* Next Button */}
              <button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                aria-label="Next Page"
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Contextual Item Count Status */}
            <p className="text-[11px] font-medium text-gray-400 tracking-tight">
              Showing <strong className="text-gray-700 font-bold">{(currentPage - 1) * EVENTS_PER_PAGE + 1}–{Math.min(currentPage * EVENTS_PER_PAGE, totalCount)}</strong> of <strong className="text-gray-700 font-bold">{totalCount}</strong> events
            </p>
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
              onClick={openCreateModal}
              className="bg-[#444444] hover:bg-[#333333] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              Be the first to create one!
            </button>
          </div>
        )}

        {/* Bottom Banner: Cross-Campus Horizon (Connecting to Student Hub) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#363636] text-white p-6 sm:p-9 mt-16 shadow-2xl border border-gray-700/60 group animate-in fade-in duration-300">
          {/* Background Ambient Glows */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700"></div>
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/15 mb-3">
                <Compass className="w-3.5 h-3.5 text-white" /> Cross-Campus Connect
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Curious what students at other universities are up to?
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Step outside your institution's bubble. Check out the latest student community photo drops and browse public campus events hosted across the major institutions in South Africa.
              </p>

              {/* University Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  CPUT
                </span>
                <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  UCT
                </span>
                <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  Stellenbosch
                </span>
                <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  UWC
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href="/student-hub"
                className="px-6 py-3.5 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                <span>Visit Student Hub</span>
                <ChevronRight className="w-4 h-4 text-[#444444] group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="startDate">Start Date</label>
                  <input 
                    required 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    min={todayStr}
                    value={formStartDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setFormStartDate(newStart);
                      if (!formEndDate || formEndDate < newStart) {
                        setFormEndDate(newStart);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="startTime">Start Time</label>
                  <input required id="startTime" name="startTime" type="time" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="endDate">End Date</label>
                  <input 
                    required 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    min={formStartDate || todayStr}
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all shadow-sm" 
                  />
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
