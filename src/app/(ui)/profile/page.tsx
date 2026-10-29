"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Merriweather } from "next/font/google";
import Cookies from "js-cookie";
import { 
  LayoutDashboard, 
  CalendarRange, 
  MessageSquare, 
  User, 
  GraduationCap, 
  Coffee,
  Sparkles,
  Zap,
  Edit3,
  Check,
  X,
  PartyPopper,
  Headphones,
  LogOut,
  Loader2,
  AlertCircle,
  Mail
} from "lucide-react";
import { useGlobalChat } from "@/app/providers/GlobalChatProvider";
import { apiFetch } from "@/lib/api";
import { extractTagsFromBio } from "@/lib/ai/onboarding";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

const AVAILABLE_LANGUAGES = [
  "English", "Afrikaans", "isiZulu", "isiXhosa", "Sepedi", 
  "Sesotho", "Setswana", "Xitsonga", "siSwati", "Tshivenda", 
  "isiNdebele", "French", "Spanish", "German", "Mandarin", 
  "Swahili", "Portuguese", "Arabic", "Hindi"
].sort();

const ALL_TAGS = [
  "Gaming", "Coffee Runs", "Study Sessions", "Hackathons", 
  "Gym & Fitness", "Anime", "Hiking", "Photography", 
  "Board Games", "Web Development", "UI/UX Design", "Food & Dining", 
  "Music Production", "Language Learning", "Volunteering", "Nightlife", 
  "Book Clubs", "Art & Drawing", "Startups", "Movies & Cinema"
];

const UNIVERSITY_MAP: Record<string, string> = {
  CPUT: "Cape Peninsula University of Technology (CPUT)",
  UCT: "University of Cape Town (UCT)",
  UWC: "University of the Western Cape (UWC)",
  SU: "Stellenbosch University (SU)"
};

function formatUniversity(codeOrName?: string | null) {
  if (!codeOrName) return "Cape Peninsula University of Technology (CPUT)";
  return UNIVERSITY_MAP[codeOrName] || codeOrName;
}

function formatYearOfStudy(year?: number | string | null) {
  if (!year) return "1st Year";
  const num = typeof year === "number" ? year : parseInt(year.toString());
  if (isNaN(num)) return year.toString();
  if (num === 1) return "1st Year";
  if (num === 2) return "2nd Year";
  if (num === 3) return "3rd Year";
  if (num === 4) return "4th Year";
  return `Year ${num}`;
}

function getInitials(name?: string | null) {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserProfile {
  studentEmail: string;
  displayName: string;
  age: number;
  university: string;
  yearOfStudy: string;
  languages: string[];
  introvertScore: number;
  socialEnergyLevel: string;
  bio: string;
  interests: string[];
  aiExtractedTags: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { totalUnreadCount } = useGlobalChat();

  const [user, setUser] = useState<UserProfile>({
    studentEmail: "",
    displayName: "",
    age: 0,
    university: "",
    yearOfStudy: "",
    languages: [],
    introvertScore: 50,
    socialEnergyLevel: "Medium",
    bio: "",
    interests: [],
    aiExtractedTags: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State (cloned from user object when editing)
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editLanguages, setEditLanguages] = useState<string[]>([]);
  const [editIntrovertScore, setEditIntrovertScore] = useState(50);
  const [editSocialEnergyLevel, setEditSocialEnergyLevel] = useState("Medium");
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);

  // Custom Language State for Edit Mode
  const [showOtherLangInput, setShowOtherLangInput] = useState(false);
  const [otherLangText, setOtherLangText] = useState("");

  // AI Extraction State for Edit Mode
  const [editAiTags, setEditAiTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load user data on mount from onboarding records
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          
          // If first login or not completed onboarding, redirect to onboarding
          if (data.isFirstLogin) {
            router.push("/onboarding");
            return;
          }

          const rawInterests = (data.interests && data.interests.length > 0) 
            ? data.interests 
            : ((data.lookingForTags && data.lookingForTags.length > 0) ? data.lookingForTags : []);

          const loadedUser: UserProfile = {
            studentEmail: data.studentEmail || "",
            displayName: data.displayName || "",
            age: data.age || 0,
            university: formatUniversity(data.university),
            yearOfStudy: formatYearOfStudy(data.yearOfStudy),
            languages: data.languages && data.languages.length > 0 ? data.languages : ["English"],
            introvertScore: typeof data.introvertExtrovertScore === "number" ? data.introvertExtrovertScore : 50,
            socialEnergyLevel: data.socialEnergyLevel || "Medium",
            bio: data.bio || "",
            interests: rawInterests,
            aiExtractedTags: data.extractedAiTags || [],
          };

          setUser(loadedUser);
          setEditDisplayName(loadedUser.displayName);
          setEditLanguages(loadedUser.languages);
          setEditIntrovertScore(loadedUser.introvertScore);
          setEditSocialEnergyLevel(loadedUser.socialEnergyLevel);
          setEditBio(loadedUser.bio);
          setEditInterests(loadedUser.interests);
          setEditAiTags(loadedUser.aiExtractedTags);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleEditClick = () => {
    setEditDisplayName(user.displayName);
    setEditLanguages(user.languages);
    setEditIntrovertScore(user.introvertScore);
    setEditSocialEnergyLevel(user.socialEnergyLevel);
    setEditBio(user.bio);
    setEditInterests(user.interests);
    setEditAiTags(user.aiExtractedTags);
    setIsAnalyzing(false);
    setSaveError(null);
    setIsEditing(true);
  };

  // AI Bio Extraction Debounced Effect in Edit Mode
  useEffect(() => {
    if (!isEditing) return;

    const trimmedBio = editBio.trim();
    // If user bio didn't change from saved profile, keep current AI tags
    if (trimmedBio === (user.bio || "").trim()) {
      setEditAiTags(user.aiExtractedTags || []);
      setIsAnalyzing(false);
      return;
    }

    if (trimmedBio.length < 10) {
      setEditAiTags([]);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const timeoutId = setTimeout(() => {
      extractTagsFromBio(trimmedBio)
        .then((tags) => {
          setEditAiTags(tags);
          setIsAnalyzing(false);
        })
        .catch((err) => {
          console.error("AI Extraction Error in profile edit", err);
          setIsAnalyzing(false);
        });
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [editBio, isEditing, user.bio, user.aiExtractedTags]);

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: editDisplayName,
          languages: editLanguages,
          introvertExtrovertScore: editIntrovertScore,
          socialEnergyLevel: editSocialEnergyLevel,
          bio: editBio,
          interests: editInterests,
          extractedAiTags: editAiTags,
        }),
      });

      if (res.ok) {
        const updatedData = await res.json();
        const updatedUser: UserProfile = {
          ...user,
          studentEmail: updatedData.studentEmail || user.studentEmail,
          displayName: updatedData.displayName || editDisplayName,
          languages: updatedData.languages || editLanguages,
          introvertScore: typeof updatedData.introvertExtrovertScore === "number" ? updatedData.introvertExtrovertScore : editIntrovertScore,
          socialEnergyLevel: updatedData.socialEnergyLevel || editSocialEnergyLevel,
          bio: updatedData.bio || editBio,
          interests: (updatedData.interests && updatedData.interests.length > 0) ? updatedData.interests : editInterests,
          aiExtractedTags: updatedData.extractedAiTags || editAiTags,
        };

        setUser(updatedUser);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        const errJson = await res.json().catch(() => null);
        setSaveError(errJson?.detail || "Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setSaveError("An unexpected error occurred while saving profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (editLanguages.includes(lang)) {
      setEditLanguages(editLanguages.filter(l => l !== lang));
    } else {
      setEditLanguages([...editLanguages, lang]);
    }
  };

  const handleAddOtherLanguage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otherLangText.trim() && !editLanguages.includes(otherLangText.trim())) {
      setEditLanguages([...editLanguages, otherLangText.trim()]);
    }
    setOtherLangText("");
    setShowOtherLangInput(false);
  };

  const toggleInterest = (tag: string) => {
    if (editInterests.includes(tag)) {
      setEditInterests(editInterests.filter(t => t !== tag));
    } else {
      setEditInterests([...editInterests, tag]);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
      <Head>
        <title>My Profile | The Quad</title>
      </Head>

      {/* Global Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-center items-center">
          <div className="flex space-x-6 text-gray-400 items-center">
            <a href="/dashboard" className="hover:text-[#444444] transition-colors p-2" title="Dashboard">
              <LayoutDashboard className="w-5 h-5" />
            </a>
            <a href="/events" className="hover:text-[#444444] transition-colors p-2" title="Activities & Events">
              <CalendarRange className="w-5 h-5" />
            </a>
            <a href="/chat" className="hover:text-[#444444] transition-colors p-2 relative" title="Chat">
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </a>
            <a href="/profile" className="text-[#444444] border-b-2 border-[#444444] pb-1 px-2 pt-2" title="Profile">
              <User className="w-5 h-5" />
            </a>
            <button 
              onClick={() => { Cookies.remove('access_token'); window.location.href = '/login'; }} 
              className="hover:text-red-500 transition-colors p-2" 
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className={`${merriweather.className} font-bold text-[32px] text-[#363636] tracking-normal`}>
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">Manage how the AI matches you with events and people.</p>
          </div>
          
          <div>
            {!isLoading && (
              !isEditing ? (
                <button 
                  onClick={handleEditClick}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 shadow-sm transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || isAnalyzing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all ${
                      isSaving || isAnalyzing
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#444444] text-white hover:bg-[#333333] cursor-pointer"
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> Analyzing Bio...
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {isAnalyzing && (
          <div className="mb-6 p-4 bg-[#444444]/5 border border-[#444444]/15 rounded-2xl flex items-center shadow-sm animate-pulse">
            <Sparkles className="w-5 h-5 mr-3 text-[#444444] animate-spin shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#444444] uppercase tracking-wider">Analyzing Bio</div>
              <div className="text-xs text-gray-600 mt-0.5">Google AI is extracting match tags from your bio. Save will be enabled as soon as analysis finishes.</div>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="mb-6 p-4 bg-[#444444]/5 border border-[#444444]/15 rounded-2xl flex items-center shadow-sm animate-pulse">
            <Loader2 className="w-5 h-5 mr-3 text-[#444444] animate-spin shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#444444] uppercase tracking-wider">Saving Changes</div>
              <div className="text-xs text-gray-600 mt-0.5">Updating your profile information and calculating recommendations in the background...</div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl flex items-center shadow-sm animate-in fade-in duration-300">
            <Check className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            <span>Your profile changes have been saved!</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center shadow-sm animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-6 w-36 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-6"></div>
                <div className="w-full h-16 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 w-28 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-16 w-full bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-24 w-full bg-gray-50 rounded-xl"></div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 w-full bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column (Avatar & Basics) */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Dynamic Initials Avatar */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#333333] to-[#555555] text-white flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md tracking-wider">
                    {getInitials(user.displayName)}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-[#444444] text-white p-2 rounded-full shadow-sm border-2 border-white">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                
                {!isEditing ? (
                  <h2 className={`${merriweather.className} text-2xl font-bold text-[#363636]`}>
                    {user.displayName || "Student"} {user.age ? <span className="text-gray-400 font-normal">, {user.age}</span> : null}
                  </h2>
                ) : (
                  <div className="w-full mt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 text-left">Display Name</label>
                    <input 
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] text-center"
                    />
                    {user.age ? <div className="text-xs text-gray-400 mt-2">Age: {user.age} (Locked)</div> : null}
                  </div>
                )}
                
                <div className="mt-4 w-full space-y-3">
                  {/* Read-Only Student Email */}
                  <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left relative group">
                    <Mail className="w-4 h-4 mr-3 mt-0.5 text-[#444444] shrink-0" />
                    <div className={`flex-1 min-w-0 ${isEditing ? 'pr-12' : ''}`}>
                      <strong className="block text-gray-900 text-xs uppercase tracking-wider font-bold mb-0.5">Student Email</strong>
                      <span className="text-gray-600 text-sm font-medium break-all select-all">
                        {user.studentEmail || "Not available"}
                      </span>
                    </div>
                    {isEditing && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded opacity-75 shrink-0">
                        Locked
                      </div>
                    )}
                  </div>

                  {/* University & Year */}
                  <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left relative group">
                    <GraduationCap className="w-4 h-4 mr-3 mt-0.5 text-[#444444] shrink-0" />
                    <span>
                      <strong className="block text-gray-900">{user.yearOfStudy}</strong>
                      {user.university}
                    </span>
                    {isEditing && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded opacity-75">
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 mr-2 text-[#444444]" /> Languages
                </h3>
                
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {user.languages && user.languages.length > 0 ? (
                      user.languages.map(lang => (
                        <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No languages added</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[...new Set([...AVAILABLE_LANGUAGES, ...editLanguages])].sort().map(lang => {
                      const isSelected = editLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={(e) => { e.preventDefault(); toggleLanguage(lang); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? "bg-[#444444] text-white border-[#444444]" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#444444] hover:text-[#444444]"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                    {!showOtherLangInput ? (
                      <button
                        onClick={(e) => { e.preventDefault(); setShowOtherLangInput(true); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-600 border border-gray-200 hover:border-[#444444] hover:text-[#444444] transition-all duration-200 border-dashed"
                      >
                        + Other
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <input 
                          type="text" 
                          value={otherLangText}
                          onChange={(e) => setOtherLangText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOtherLanguage();
                            }
                          }}
                          placeholder="Type..."
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold border border-[#444444] focus:outline-none w-24"
                          autoFocus
                        />
                        <button 
                          onClick={(e) => { e.preventDefault(); handleAddOtherLanguage(); }}
                          className="px-2 py-1.5 bg-[#444444] text-white rounded-lg text-xs font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (AI, Bio, Energy) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Bio & AI Profile Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                  <Sparkles className="w-48 h-48 text-[#444444]" />
                </div>
                
                <h3 className="font-bold text-gray-900 mb-3 text-lg">About Me</h3>
                
                {!isEditing ? (
                  <p className="text-gray-700 text-[15px] leading-relaxed mb-6 italic">
                    {user.bio ? `"${user.bio}"` : <span className="text-gray-400 not-italic">No bio provided yet. Click 'Edit Profile' to add one.</span>}
                  </p>
                ) : (
                  <div className="mb-6">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Tell us a little about your interests, favorite campus hangouts, and what you're looking for..."
                      className="w-full h-28 p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#444444] resize-none relative z-10"
                    />
                    <div className="text-xs text-gray-400 text-right mt-1">{editBio.length} characters</div>
                  </div>
                )}

                <div className="bg-[#444444]/5 rounded-2xl p-5 border border-[#444444]/10 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-[#444444] uppercase tracking-wider flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> AI Match Profile
                    </h4>
                    {isEditing && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded">
                        Live Preview
                      </span>
                    )}
                  </div>

                  {!isEditing ? (
                    <>
                      <p className="text-xs text-gray-600 mb-3">Our AI uses these hidden intents to recommend events for you:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.aiExtractedTags && user.aiExtractedTags.length > 0 ? (
                          user.aiExtractedTags.map(tag => (
                            <span key={tag} className="bg-[#444444] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No AI tags generated yet. Write a bio with at least 10 characters to extract match tags.</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {editBio.trim().length < 10 ? (
                        <p className="text-xs text-gray-500 italic">Write at least 10 characters in your bio to extract AI match tags...</p>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-700 mb-3 font-medium">Based on your bio, we'll connect you with students interested in:</p>
                          <div className="flex flex-wrap gap-2">
                            {isAnalyzing ? (
                              <>
                                <span className="bg-gray-200 text-gray-600 animate-pulse text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">ANALYZING...</span>
                                <span className="bg-gray-200 text-gray-600 animate-pulse text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm w-16 h-7 inline-block"></span>
                              </>
                            ) : editAiTags.length > 0 ? (
                              editAiTags.map((tag, idx) => (
                                <span key={idx} className="bg-[#444444] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No specific tags extracted yet. Keep writing!</span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Social Battery Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
                  <Zap className="w-5 h-5 mr-2 text-[#444444]" /> Social Battery
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Introvert/Extrovert Spectrum */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Spectrum</h4>
                    
                    {!isEditing ? (
                      <>
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative border border-gray-200">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#444444] rounded-full transition-all duration-500" 
                            style={{ width: `${user.introvertScore}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">
                          <span className={user.introvertScore < 50 ? "text-[#444444]" : ""}>Introvert</span>
                          <span className={user.introvertScore >= 50 ? "text-[#444444]" : ""}>Extrovert</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 font-medium">
                          You lean towards being an {user.introvertScore < 50 ? "Introvert" : "Extrovert"} ({user.introvertScore}/100).
                        </p>
                      </>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-600">Score</span>
                          <span className="text-xs font-bold text-[#444444]">{editIntrovertScore}/100</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={editIntrovertScore} 
                          onChange={(e) => setEditIntrovertScore(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#444444]"
                        />
                        <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider">
                          <span>Introvert</span>
                          <span>Extrovert</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Energy Level */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ideal Energy Level</h4>
                    
                    {!isEditing ? (
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mr-3">
                          {user.socialEnergyLevel === "Low" && <Headphones className="w-6 h-6 text-[#444444]" />}
                          {user.socialEnergyLevel === "Medium" && <Coffee className="w-6 h-6 text-[#444444]" />}
                          {user.socialEnergyLevel === "High" && <PartyPopper className="w-6 h-6 text-[#444444]" />}
                        </div>
                        <div>
                          <div className="font-bold text-[#444444]">{user.socialEnergyLevel} Energy</div>
                          <div className="text-xs text-gray-500">
                            {user.socialEnergyLevel === "Low" && "Quiet, relaxed, 1-on-1s."}
                            {user.socialEnergyLevel === "Medium" && "Casual hangouts & moderate crowds."}
                            {user.socialEnergyLevel === "High" && "Loud, vibrant, large crowds."}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditSocialEnergyLevel("Low")}
                          className={`p-2 rounded-xl border flex items-center transition-all ${
                            editSocialEnergyLevel === "Low" ? "border-[#444444] bg-gray-50 shadow-sm" : "border-gray-100 bg-white"
                          }`}
                        >
                          <Headphones className={`w-5 h-5 mr-3 ${editSocialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-400"}`} />
                          <span className={`text-sm font-bold ${editSocialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-700"}`}>Low Energy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditSocialEnergyLevel("Medium")}
                          className={`p-2 rounded-xl border flex items-center transition-all ${
                            editSocialEnergyLevel === "Medium" ? "border-[#444444] bg-gray-50 shadow-sm" : "border-gray-100 bg-white"
                          }`}
                        >
                          <Coffee className={`w-5 h-5 mr-3 ${editSocialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-400"}`} />
                          <span className={`text-sm font-bold ${editSocialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-700"}`}>Medium Energy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditSocialEnergyLevel("High")}
                          className={`p-2 rounded-xl border flex items-center transition-all ${
                            editSocialEnergyLevel === "High" ? "border-[#444444] bg-gray-50 shadow-sm" : "border-gray-100 bg-white"
                          }`}
                        >
                          <PartyPopper className={`w-5 h-5 mr-3 ${editSocialEnergyLevel === "High" ? "text-[#444444]" : "text-gray-400"}`} />
                          <span className={`text-sm font-bold ${editSocialEnergyLevel === "High" ? "text-[#444444]" : "text-gray-700"}`}>High Energy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interests Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  Interests & Hobbies
                </h3>
                
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.map(interest => (
                        <span key={interest} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-200 transition-colors cursor-default">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No interests selected</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map(tag => {
                      const isSelected = editInterests.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleInterest(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? "bg-[#444444] text-white border-[#444444]" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#444444] hover:text-[#444444]"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
