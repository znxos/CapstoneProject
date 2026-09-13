"use client";

import React, { useState } from "react";
import Head from "next/head";
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
  LogOut
} from "lucide-react";
import { useGlobalChat } from "@/app/providers/GlobalChatProvider";

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

// Initial Mock Data representing a completed onboarding profile
const initialMockUser = {
  displayName: "Alex Carter",
  age: 20,
  university: "Cape Peninsula University of Technology (CPUT)",
  yearOfStudy: "2nd Year",
  languages: ["English", "isiXhosa"],
  introvertScore: 35, // 0-100 (Leans Introvert)
  socialEnergyLevel: "Medium", // Low, Medium, High
  bio: "I'm a second-year IT student who loves building mechanical keyboards, exploring Cape Town cafes, and late-night coding sessions.",
  interests: ["Coffee Runs", "Web Development", "Photography", "Gaming"],
  aiExtractedTags: ["CAFE HOPPING", "CODING", "TECH HARDWARE", "GAMING"],
  avatarUrl: "https://i.pravatar.cc/150?img=11"
};

export default function ProfilePage() {
  const [user, setUser] = useState(initialMockUser);
  const [isEditing, setIsEditing] = useState(false);
  const { totalUnreadCount } = useGlobalChat();
  
  // Form State (cloned from user object when editing)
  const [editDisplayName, setEditDisplayName] = useState(user.displayName);
  const [editLanguages, setEditLanguages] = useState<string[]>(user.languages);
  const [editIntrovertScore, setEditIntrovertScore] = useState(user.introvertScore);
  const [editSocialEnergyLevel, setEditSocialEnergyLevel] = useState(user.socialEnergyLevel);
  const [editBio, setEditBio] = useState(user.bio);
  const [editInterests, setEditInterests] = useState<string[]>(user.interests);

  // Custom Language State for Edit Mode
  const [showOtherLangInput, setShowOtherLangInput] = useState(false);
  const [otherLangText, setOtherLangText] = useState("");

  const handleEditClick = () => {
    // Reset edit state to current user data
    setEditDisplayName(user.displayName);
    setEditLanguages(user.languages);
    setEditIntrovertScore(user.introvertScore);
    setEditSocialEnergyLevel(user.socialEnergyLevel);
    setEditBio(user.bio);
    setEditInterests(user.interests);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setUser({
      ...user,
      displayName: editDisplayName,
      languages: editLanguages,
      introvertScore: editIntrovertScore,
      socialEnergyLevel: editSocialEnergyLevel,
      bio: editBio,
      interests: editInterests,
      // Note: aiExtractedTags would normally be re-fetched from backend on save.
    });
    setIsEditing(false);
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
            <button onClick={() => { Cookies.remove('access_token'); window.location.href = '/login'; }} className="hover:text-red-500 transition-colors p-2" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        
        {/* Page Title & Actions */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className={`${merriweather.className} font-bold text-[32px] text-[#363636] tracking-normal`}>
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">Manage how the AI matches you with events and people.</p>
          </div>
          
          <div>
            {!isEditing ? (
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
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 shadow-sm transition-all"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#444444] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#333333] shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column (Avatar & Basics) */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mb-4"
                />
                <div className="absolute bottom-4 right-1 bg-[#444444] text-white p-1.5 rounded-full shadow-sm border-2 border-white">
                  <User className="w-4 h-4" />
                </div>
              </div>
              
              {!isEditing ? (
                <h2 className={`${merriweather.className} text-2xl font-bold text-[#363636]`}>
                  {user.displayName} <span className="text-gray-400 font-normal">, {user.age}</span>
                </h2>
              ) : (
                <div className="w-full mt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 text-left">Display Name</label>
                  <input 
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] text-center"
                  />
                  <div className="text-xs text-gray-400 mt-2">Age: {user.age} (Locked)</div>
                </div>
              )}
              
              <div className="mt-4 w-full space-y-3">
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
                  {user.languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                      {lang}
                    </span>
                  ))}
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
                <p className="text-gray-700 text-[15px] leading-relaxed mb-6">
                  "{user.bio}"
                </p>
              ) : (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full h-28 p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#444444] mb-6 resize-none relative z-10"
                />
              )}

              <div className="bg-[#444444]/5 rounded-2xl p-5 border border-[#444444]/10 relative z-10">
                <h4 className="text-xs font-bold text-[#444444] uppercase tracking-wider mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Match Profile
                </h4>
                {isEditing ? (
                  <p className="text-xs text-gray-600 mb-3">AI Tags will be regenerated when you save changes.</p>
                ) : (
                  <p className="text-xs text-gray-600 mb-3">Our AI uses these hidden intents to recommend events for you:</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {user.aiExtractedTags.map(tag => (
                    <span key={tag} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm ${isEditing ? 'bg-gray-300 text-gray-500' : 'bg-[#444444] text-white'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
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
                          className="absolute top-0 left-0 h-full bg-[#444444] rounded-full transition-all" 
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
                        onClick={() => setEditSocialEnergyLevel("Low")}
                        className={`p-2 rounded-xl border flex items-center transition-all ${
                          editSocialEnergyLevel === "Low" ? "border-[#444444] bg-gray-50 shadow-sm" : "border-gray-100 bg-white"
                        }`}
                      >
                        <Headphones className={`w-5 h-5 mr-3 ${editSocialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-400"}`} />
                        <span className={`text-sm font-bold ${editSocialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-700"}`}>Low Energy</span>
                      </button>
                      <button
                        onClick={() => setEditSocialEnergyLevel("Medium")}
                        className={`p-2 rounded-xl border flex items-center transition-all ${
                          editSocialEnergyLevel === "Medium" ? "border-[#444444] bg-gray-50 shadow-sm" : "border-gray-100 bg-white"
                        }`}
                      >
                        <Coffee className={`w-5 h-5 mr-3 ${editSocialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-400"}`} />
                        <span className={`text-sm font-bold ${editSocialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-700"}`}>Medium Energy</span>
                      </button>
                      <button
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
                  {user.interests.map(interest => (
                    <span key={interest} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-200 transition-colors cursor-default">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => {
                    const isSelected = editInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={(e) => { e.preventDefault(); toggleInterest(tag); }}
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
      </main>
    </div>
  );
}
