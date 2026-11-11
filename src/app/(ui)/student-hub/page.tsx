"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Cookies from "js-cookie";
import { apiFetch } from "@/lib/api";
import { 
  LayoutDashboard, 
  CalendarRange, 
  MessageSquare, 
  User, 
  LogOut,
  Camera,
  Upload,
  Heart,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  X,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
  Info,
  Maximize2
} from "lucide-react";
import { useGlobalChat } from "@/app/providers/GlobalChatProvider";

// Type definitions
interface CommunityPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  author: {
    name: string;
    avatar: string;
    university: "CPUT" | "UCT" | "UWC" | "SU";
  };
  likes: number;
  commentsCount: number;
  tag?: string;
  isLiked?: boolean;
}

interface UniversityEvent {
  id: string;
  title: string;
  category: "Tech" | "Study" | "Outdoors" | "Social" | "Creative";
  capacity: number;
  joinedCount: number;
  participants: string[];
  hostName: string;
  hostAvatar: string;
}

interface UniversityGroup {
  id: string;
  name: string;
  shortName: "UCT" | "SU" | "CPUT" | "UWC";
  colorBadge: string;
  tagline: string;
  events: UniversityEvent[];
}

// Initial Mock Community Photos (Date & Time omitted)
const INITIAL_COMMUNITY_PHOTOS: CommunityPhoto[] = [
  {
    id: "photo-1",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    caption: "Late night finals sprint at the Cape Town Innovation Lab with the crew! ☕💻",
    author: {
      name: "Tariq Adams",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      university: "CPUT"
    },
    likes: 42,
    commentsCount: 9,
    tag: "#HackathonSprint",
    isLiked: false
  },
  {
    id: "photo-2",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    caption: "Upper Campus views never get old. Clear skies before the engineering lecture! ☀️⛰️",
    author: {
      name: "Chloe van der Merwe",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      university: "UCT"
    },
    likes: 67,
    commentsCount: 14,
    tag: "#UpperCampus",
    isLiked: false
  },
  {
    id: "photo-3",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    caption: "Robotics club demo day! Autonomous line follower completed in under 48 hours. 🤖🔥",
    author: {
      name: "Sipho Dlamini",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      university: "SU"
    },
    likes: 85,
    commentsCount: 21,
    tag: "#RoboticsDemo",
    isLiked: false
  },
  {
    id: "photo-4",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    caption: "Group study session turning into a spontaneous pizza brainstorming marathon 🍕📚",
    author: {
      name: "Zoe Petersen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      university: "UWC"
    },
    likes: 38,
    commentsCount: 6,
    tag: "#StudyVibes",
    isLiked: false
  },
  {
    id: "photo-5",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    caption: "Acoustic open mic afternoon at the amphitheatre. Unreal talent across campus! 🎸🎤",
    author: {
      name: "Marcus Ndlovu",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      university: "UCT"
    },
    likes: 54,
    commentsCount: 11,
    tag: "#CampusCulture",
    isLiked: false
  }
];

// Mock University Datasets
// Notice:
// UCT has 6 events -> RENDERED (>= 5)
// Stellenbosch University has 5 events -> RENDERED (>= 5)
// UWC has 3 events -> AUTOMATICALLY OMITTED (< 5)
// Location, Date & Time are intentionally omitted per user specification
const ALL_UNIVERSITY_GROUPS: UniversityGroup[] = [
  {
    id: "uct",
    name: "University of Cape Town (UCT)",
    shortName: "UCT",
    colorBadge: "bg-blue-50 text-blue-700 border-blue-200",
    tagline: "Rondebosch & Medical Campuses",
    events: [
      {
        id: "uct-1",
        title: "Table Mountain Sunrise Ridge Hike",
        category: "Outdoors",
        capacity: 15,
        joinedCount: 12,
        participants: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Lian K.",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uct-2",
        title: "Kramer Mechatronics & AI Showcase",
        category: "Tech",
        capacity: 40,
        joinedCount: 34,
        participants: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Anele M.",
        hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uct-3",
        title: "Chancellor Oppenheimer Quiet Study Blitz",
        category: "Study",
        capacity: 25,
        joinedCount: 20,
        participants: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Farhaan P.",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uct-4",
        title: "Kirstenbosch Open Air Sketch Walk",
        category: "Creative",
        capacity: 18,
        joinedCount: 16,
        participants: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Nandi G.",
        hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uct-5",
        title: "Inter-Faculty Debating Society Cup",
        category: "Social",
        capacity: 30,
        joinedCount: 27,
        participants: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Kagiso T.",
        hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uct-6",
        title: "Sarah Baartman Lawn Acoustic Sessions",
        category: "Creative",
        capacity: 50,
        joinedCount: 42,
        participants: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Liam D.",
        hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
      }
    ]
  },
  {
    id: "su",
    name: "Stellenbosch University (SU)",
    shortName: "SU",
    colorBadge: "bg-red-50 text-red-800 border-red-200",
    tagline: "Stellenbosch Main Campus & Neelsie",
    events: [
      {
        id: "su-1",
        title: "Jonkershoek 10K Nature Trail Run",
        category: "Outdoors",
        capacity: 20,
        joinedCount: 18,
        participants: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Jacques B.",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "su-2",
        title: "Winelands AgriTech & Data Pitch",
        category: "Tech",
        capacity: 35,
        joinedCount: 31,
        participants: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Elna R.",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "su-3",
        title: "Neelsie Student Centre Acoustic Night",
        category: "Creative",
        capacity: 45,
        joinedCount: 40,
        participants: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Willem S.",
        hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "su-4",
        title: "Computer Science Algorithmic Jam",
        category: "Tech",
        capacity: 25,
        joinedCount: 22,
        participants: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Pieter K.",
        hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "su-5",
        title: "JS Gericke Library Deep Focus Sprint",
        category: "Study",
        capacity: 30,
        joinedCount: 28,
        participants: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Anri V.",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      }
    ]
  },
  {
    id: "uwc",
    name: "University of the Western Cape (UWC)",
    shortName: "UWC",
    colorBadge: "bg-amber-50 text-amber-800 border-amber-200",
    tagline: "Bellville Campus",
    // ONLY 3 EVENTS: This group is automatically filtered out by the >= 5 rule!
    events: [
      {
        id: "uwc-1",
        title: "Nature Reserve Botanical Clean-Up",
        category: "Outdoors",
        capacity: 25,
        joinedCount: 19,
        participants: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Vuyani Z.",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uwc-2",
        title: "Makerspace 3D Printing Masterclass",
        category: "Tech",
        capacity: 15,
        joinedCount: 14,
        participants: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Fatima J.",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      },
      {
        id: "uwc-3",
        title: "Law Moot Court Practice Mock Trial",
        category: "Study",
        capacity: 20,
        joinedCount: 16,
        participants: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
        ],
        hostName: "Themba K.",
        hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
      }
    ]
  }
];

export default function StudentHubPage() {
  const { totalUnreadCount } = useGlobalChat();

  // Community Photos Carousel State
  const [photos, setPhotos] = useState<CommunityPhoto[]>(INITIAL_COMMUNITY_PHOTOS);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPhotoPaused, setIsPhotoPaused] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<CommunityPhoto | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState("");
  const [universityTag, setUniversityTag] = useState<"CPUT" | "UCT" | "UWC" | "SU">("CPUT");
  const [activityTagInput, setActivityTagInput] = useState("");
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  // Other Universities Horizontal Scroll State
  const scrollContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Check onboarding status on mount
  useEffect(() => {
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
  }, []);

  // Auto-advance photo carousel every 5.5s unless hovered
  useEffect(() => {
    if (isPhotoPaused || photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPhotoPaused, photos.length]);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === id) {
          const isLiked = !photo.isLiked;
          return {
            ...photo,
            isLiked,
            likes: photo.likes + (isLiked ? 1 : -1)
          };
        }
        return photo;
      })
    );
  };

  // Image Upload handler (supports real file selection or drag-drop preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImagePreview && !captionInput.trim()) return;

    setIsSubmittingPhoto(true);

    setTimeout(() => {
      const newPhoto: CommunityPhoto = {
        id: `photo-custom-${Date.now()}`,
        imageUrl: selectedImagePreview || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        caption: captionInput.trim() || "Just dropped a new campus moment! 🎓✨",
        author: {
          name: "You (Student)",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          university: universityTag
        },
        likes: 1,
        commentsCount: 0,
        tag: activityTagInput.trim() ? (activityTagInput.startsWith("#") ? activityTagInput : `#${activityTagInput}`) : "#CampusVibes",
        isLiked: true
      };

      setPhotos((prev) => [newPhoto, ...prev]);
      setCurrentPhotoIndex(0);
      setIsSubmittingPhoto(false);
      setIsUploadModalOpen(false);
      setSelectedImagePreview(null);
      setCaptionInput("");
      setActivityTagInput("");

      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 4000);
    }, 600);
  };

  // Horizontal scroll helpers for university carousels
  const handleScrollUni = (uniId: string, direction: "left" | "right") => {
    const container = scrollContainerRefs.current[uniId];
    if (container) {
      const scrollAmount = 340;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // STRICT USER RULE: Only display for the university if there are a MINIMUM of 5 events in existence
  const eligibleUniversities = ALL_UNIVERSITY_GROUPS.filter(
    (uni) => uni.events && uni.events.length >= 5
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-[#444444] selection:text-white">
      <Head>
        <title>Student Hub | The Quad</title>
      </Head>

      {/* Navigation / Header Area - Centered Floating Pill */}
      <header className="z-50 w-full flex justify-center pt-4 pb-[20px] px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md shadow-gray-200/50 rounded-full px-6 py-2 flex items-center justify-center transition-all">
          <div className="flex space-x-6 text-gray-400 items-center">
            {/* Student Hub (Active) */}
            <a href="/student-hub" className="text-[#444444] border-b-2 border-[#444444] pb-1 px-2 pt-2" title="Student Hub">
              <LayoutDashboard className="w-5 h-5" />
            </a>
            {/* Events */}
            <a href="/events" className="hover:text-[#444444] transition-colors p-2" title="Activities & Events">
              <CalendarRange className="w-5 h-5" />
            </a>
            {/* Chat */}
            <a href="/chat" className="hover:text-[#444444] transition-colors p-2 relative" title="Chat">
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </a>
            {/* Profile */}
            <a href="/profile" className="hover:text-[#444444] transition-colors p-2" title="Profile">
              <User className="w-5 h-5" />
            </a>
            {/* Sign Out */}
            <button 
              onClick={() => { Cookies.remove('access_token'); window.location.href = '/login'; }} 
              className="hover:text-red-500 transition-colors p-2" 
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#444444]/10 text-[#444444]">
                <Sparkles className="w-3.5 h-3.5" /> Campus Pulse
              </span>
              <span className="text-xs text-gray-400">• Updated in real-time</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
              Student Hub
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              See moments captured by students and explore what neighboring campuses are hosting.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="self-start md:self-auto bg-[#444444] hover:bg-[#333333] text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Share Campus Moment</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: Student Photos Carousel (First, Top)                          */}
        {/* ========================================================================= */}
        <section aria-labelledby="carousel-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="carousel-heading" className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Student Campus Feed
              </h2>
              <p className="text-xs text-gray-500">Live moments uploaded by fellow students across universities</p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm transition-all hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm transition-all hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Slide Container */}
          <div 
            className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-xl bg-gray-900 group"
            onMouseEnter={() => setIsPhotoPaused(true)}
            onMouseLeave={() => setIsPhotoPaused(false)}
          >
            {photos.map((photo, index) => {
              const isActive = index === currentPhotoIndex;
              return (
                <div
                  key={photo.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {/* Photo Background */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out cursor-pointer"
                    onClick={() => setLightboxPhoto(photo)}
                  />

                  {/* Gradient Overlays for High Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 pointer-events-none"></div>

                  {/* Top Bar on Card: University & Author Pill */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-20">
                    <div className="flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                      <img
                        src={photo.author.avatar}
                        alt={photo.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-white/60"
                      />
                      <span className="text-xs font-semibold text-white drop-shadow-sm">{photo.author.name}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                        {photo.author.university}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setLightboxPhoto(photo)}
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:bg-black/60 transition-colors"
                        title="Expand photo"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Caption, Tag & Likes (Date/time omitted) */}
                  <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-xl">
                      {photo.tag && (
                        <span className="inline-block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 drop-shadow">
                          {photo.tag}
                        </span>
                      )}
                      <p className="text-white text-base sm:text-lg font-medium leading-snug drop-shadow-md">
                        {photo.caption}
                      </p>
                    </div>

                    {/* Interactive Like & Details Counter */}
                    <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                      <button
                        onClick={(e) => handleToggleLike(photo.id, e)}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-90 ${
                          photo.isLiked
                            ? "bg-red-500 text-white"
                            : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${photo.isLiked ? "fill-white" : ""}`} />
                        <span>{photo.likes}</span>
                      </button>

                      <div className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md text-white/90 border border-white/20">
                        <MessageSquare className="w-4 h-4" />
                        <span>{photo.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {photos.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={() => setCurrentPhotoIndex(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIndex === currentPhotoIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: Call to Action for Students to Upload Their Own Images        */}
        {/* ========================================================================= */}
        <section aria-labelledby="cta-heading">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c2c2c] via-[#3a3a3a] to-[#4b4b4b] text-white p-6 sm:p-8 shadow-xl border border-gray-700/50">
            {/* Background Decorative Accents */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute right-20 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 border border-white/15 text-white/90 mb-3 uppercase tracking-wider">
                  <Camera className="w-3.5 h-3.5 text-amber-400" /> Share Your Story
                </div>
                <h3 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  Have a great campus moment to share?
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Upload pictures from your societies, study sessions, sports fixtures, or creative showcases. Connect with students across campuses and show what makes your university life unique.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Upload className="w-4 h-4 text-[#444444]" />
                  <span>Upload Your Photo</span>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: See What Other Universities Are Up To (Events & Carousel)      */}
        {/* Specifications:                                                           */}
        {/* - Events are random/chronological (do not follow recommender system)       */}
        {/* - Users CANNOT join these events (no Join button, view-only badge)        */}
        {/* - NO AI rationale                                                         */}
        {/* - NO Location (omitted per user request)                                  */}
        {/* - NO Date & Time (omitted per user request)                               */}
        {/* - Minimum 5 events threshold rule per university                          */}
        {/* ========================================================================= */}
        <section aria-labelledby="other-unis-heading" className="space-y-8 pt-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-[#444444]" />
              <span className="text-xs font-bold text-[#444444] uppercase tracking-wider">Cross-Campus Horizon</span>
            </div>
            <h2 id="other-unis-heading" className="text-2xl font-extrabold text-gray-900 tracking-tight">
              See What Other Universities Are Up To
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Browse public student events across neighboring institutions. These events are campus-exclusive to their hosts.
            </p>
          </div>

          {/* Render University Carousels (Filtered for minimum 5 events) */}
          {eligibleUniversities.map((uni) => (
            <div key={uni.id} className="space-y-4">
              
              {/* University Sub-Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-black text-sm text-[#444444]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                        {uni.name}
                      </h3>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${uni.colorBadge}`}>
                        {uni.events.length} Events
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{uni.tagline}</p>
                  </div>
                </div>

                {/* Track Scroll Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleScrollUni(uni.id, "left")}
                    aria-label={`Scroll ${uni.name} events left`}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleScrollUni(uni.id, "right")}
                    aria-label={`Scroll ${uni.name} events right`}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Event Cards Carousel */}
              <div
                ref={(el) => { scrollContainerRefs.current[uni.id] = el; }}
                className="flex space-x-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth chat-scrollbar snap-x snap-mandatory"
              >
                {uni.events.map((event) => (
                  <div
                    key={event.id}
                    className="snap-start shrink-0 w-[290px] sm:w-[320px] bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Header: Category Badge & View-Only Lock */}
                    <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-800 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                        {event.category}
                      </span>

                      {/* Lock / Campus Exclusive Badge (No Joining Allowed) */}
                      <div className="flex items-center space-x-1 text-gray-500 bg-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-gray-200 shadow-2xs" title="Only students enrolled at this university may join">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span>Campus Exclusive</span>
                      </div>
                    </div>

                    {/* Body: Title & Host (LOCATION, DATE & TIME EXPLICITLY OMITTED) */}
                    <div className="p-5 flex-grow flex flex-col">
                      <h4 className="text-base font-bold text-gray-900 mb-4 leading-snug line-clamp-2 min-h-[2.75rem]" title={event.title}>
                        {event.title}
                      </h4>

                      {/* Host Info */}
                      <div className="flex items-center space-x-2.5 mt-auto pt-3 border-t border-gray-100">
                        <img
                          src={event.hostAvatar}
                          alt={event.hostName}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-gray-700 leading-none">
                            Hosted by {event.hostName}
                          </span>
                          <span className="text-[10px] text-gray-400 leading-tight">Student Organizer</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Capacity Bar & Read-Only Pill (NO JOIN BUTTON, NO AI RATIONALE) */}
                    <div className="px-5 py-4 bg-gray-50/40 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Attendance: {event.joinedCount}/{event.capacity}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{ width: `${(event.joinedCount / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                        View Only
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Context Note explaining the >= 5 threshold filter */}
          <div className="p-4 bg-gray-100/70 border border-gray-200 rounded-2xl flex items-start space-x-3 text-xs text-gray-500">
            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p>
              Showing active public events for institutions with 5 or more active events. Campus events are reserved exclusively for registered students of their respective universities.
            </p>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* Upload Photo Modal (UI Only)                                              */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#444444]" />
                <h3 className="font-bold text-gray-900 text-base">Share Campus Photo</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handlePublishPhoto} className="p-6 space-y-4">
              
              {/* Image Dropzone / Preview */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Photo Upload
                </label>
                
                {selectedImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-52 group">
                    <img
                      src={selectedImagePreview}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImagePreview(null)}
                      className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 hover:border-[#444444] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-[#444444]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      Click to upload or drag & drop photo
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2" htmlFor="caption">
                  Caption
                </label>
                <textarea
                  id="caption"
                  rows={2}
                  maxLength={160}
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="What's happening in this photo? (e.g., Robotics finals demo, library study marathon...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] transition-all resize-none"
                />
                <div className="flex justify-end text-[10px] text-gray-400 mt-1">
                  {captionInput.length}/160
                </div>
              </div>

              {/* University Selector & Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1" htmlFor="university">
                    University
                  </label>
                  <select
                    id="university"
                    value={universityTag}
                    onChange={(e) => setUniversityTag(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#444444] bg-white"
                  >
                    <option value="CPUT">CPUT</option>
                    <option value="UCT">UCT</option>
                    <option value="SU">Stellenbosch</option>
                    <option value="UWC">UWC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1" htmlFor="tag">
                    Hashtag (Optional)
                  </label>
                  <input
                    id="tag"
                    type="text"
                    value={activityTagInput}
                    onChange={(e) => setActivityTagInput(e.target.value)}
                    placeholder="#CampusLife"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#444444]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPhoto || (!selectedImagePreview && !captionInput.trim())}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#444444] hover:bg-[#333333] text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {isSubmittingPhoto ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Post to Feed</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lightbox Modal (For viewing photo in full resolution)                     */}
      {/* ========================================================================= */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors shadow-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 mt-3 w-full max-w-xl text-center shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-bold text-xs text-gray-900">{lightboxPhoto.author.name}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {lightboxPhoto.author.university}
                </span>
              </div>
              <p className="text-sm text-gray-700">{lightboxPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Success Toast */}
      {uploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#444444] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Your campus moment was published to the feed!</span>
        </div>
      )}

    </div>
  );
}
