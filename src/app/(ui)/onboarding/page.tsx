"use client";

import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Search, X, Check, GraduationCap, Zap, Headphones, Coffee, PartyPopper, Target, PenTool, Sparkles, ChevronDown } from "lucide-react";
import { getSession } from "next-auth/react";
import { completeUserOnboarding } from "@/app/actions/onboarding-engine";
import { extractTagsFromBio } from "@/lib/ai/onboarding";

const AVAILABLE_LANGUAGES = [
  "English", "Afrikaans", "isiZulu", "isiXhosa", "Sepedi", 
  "Sesotho", "Setswana", "Xitsonga", "siSwati", "Tshivenda", 
  "isiNdebele", "French", "Spanish", "German", "Mandarin", 
  "Swahili", "Portuguese", "Arabic", "Hindi"
].sort();

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  id 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder: string;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left rounded-xl border transition-all shadow-sm flex justify-between items-center text-sm ${
          isOpen ? "border-[#444444] ring-2 ring-[#444444] ring-opacity-20 bg-white" : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-200 p-1">
          <ul className="space-y-0.5">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                    value === option.value 
                      ? "bg-gray-50 text-[#444444] font-semibold" 
                      : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-[#444444]" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form State
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [university, setUniversity] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  
  const [introvertScore, setIntrovertScore] = useState(50);
  const [socialEnergyLevel, setSocialEnergyLevel] = useState<"Low" | "Medium" | "High" | "">("");
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Extraction State
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [userEmail, setUserEmail] = useState<string>("");
  const [universityError, setUniversityError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(session => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  // AI Bio Extraction Debounced Effect
  useEffect(() => {
    if (bio.length < 10) {
      setAiTags([]);
      setIsAnalyzing(false);
      return;
    }
    
    setIsAnalyzing(true);
    const timeoutId = setTimeout(() => {
      extractTagsFromBio(bio).then((tags) => {
        setAiTags(tags);
        setIsAnalyzing(false);
      }).catch(err => {
        console.error("AI Extraction Error", err);
        setIsAnalyzing(false);
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [bio]);

  // Custom Language State
  const [showOtherLangInput, setShowOtherLangInput] = useState(false);
  const [otherLangText, setOtherLangText] = useState("");

  const handleAddOtherLanguage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otherLangText.trim() && !languages.includes(otherLangText.trim())) {
      setLanguages([...languages, otherLangText.trim()]);
    }
    setOtherLangText("");
    setShowOtherLangInput(false);
  };

  // Language Dropdown State
  const [langSearch, setLangSearch] = useState("");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const filteredLanguages = AVAILABLE_LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase()));

  const ALL_TAGS = [
    "Gaming", "Coffee Runs", "Study Sessions", "Hackathons", 
    "Gym & Fitness", "Anime", "Hiking", "Photography", 
    "Board Games", "Web Development", "UI/UX Design", "Food & Dining", 
    "Music Production", "Language Learning", "Volunteering", "Nightlife", 
    "Book Clubs", "Art & Drawing", "Startups", "Movies & Cinema"
  ];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const nextStep = () => {
    if (step === 1 && userEmail && university) {
      const domain = userEmail.split("@")[1]?.toLowerCase() || "";
      let expectedDomain = "";
      if (university === "CPUT") expectedDomain = "cput.ac.za";
      if (university === "UCT") expectedDomain = "uct.ac.za";
      if (university === "UWC") expectedDomain = "uwc.ac.za";
      if (university === "SU") expectedDomain = "sun.ac.za";
      
      if (expectedDomain && !domain.includes(expectedDomain)) {
        setUniversityError("The university you selected does not match your university email address. Did you select the correct university?");
        return;
      }
    }
    setUniversityError(null);
    setStep(prev => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const completeOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await completeUserOnboarding({
        displayName,
        age: parseInt(age),
        university,
        yearOfStudy: parseInt(yearOfStudy),
        languages,
        introvertExtrovertScore: introvertScore,
        socialEnergyLevel,
        lookingForTags: selectedTags,
        bio,
        extractedAiTags: aiTags,
      });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        window.location.href = "/events";
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = displayName.trim() !== "" && age !== "" && university !== "" && yearOfStudy !== "" && languages.length > 0;
  const isStep2Valid = socialEnergyLevel !== "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      <Head>
        <title>Setup Your Profile | The Quad</title>
      </Head>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar Header */}
        <div className="bg-gray-50/80 px-6 sm:px-8 py-5 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-[#444444]">Build Your Profile</h1>
            <span className="text-sm font-semibold text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#444444] rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto chat-scrollbar">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">The Basics <GraduationCap className="w-6 h-6 text-[#444444]" /></h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Let us know a bit about who you are and where you study.
                </p>
              </div>

              <div className="max-w-md mx-auto w-full space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="displayName">Display Name</label>
                  <input 
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="What should we call you? (e.g. John Doe)."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-all shadow-sm bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="age">Age</label>
                    <input 
                      id="age"
                      type="number"
                      min="16"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 19"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-all shadow-sm bg-white"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="yearOfStudy">Year of Study</label>
                    <CustomSelect 
                      id="yearOfStudy"
                      value={yearOfStudy}
                      onChange={setYearOfStudy}
                      placeholder="Select..."
                      options={[
                        { value: "1", label: "1st Year" },
                        { value: "2", label: "2nd Year" },
                        { value: "3", label: "3rd Year" },
                        { value: "4", label: "4th Year / Hons" },
                        { value: "5", label: "Masters" },
                        { value: "6", label: "PhD" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">University</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "CPUT", label: "Cape Peninsula University of Technology" },
                      { value: "UCT", label: "University of Cape Town" },
                      { value: "UWC", label: "University of the Western Cape" },
                      { value: "SU", label: "Stellenbosch University" }
                    ].map(uni => {
                      const isSelected = university === uni.value;
                      return (
                        <button
                          key={uni.value}
                          onClick={(e) => { e.preventDefault(); setUniversity(uni.value); setUniversityError(null); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? "bg-[#444444] text-white border-[#444444]" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#444444] hover:text-[#444444]"
                          }`}
                        >
                          {uni.label}
                        </button>
                      );
                    })}
                    

                    {universityError && (
                      <div className="w-full mt-2 text-[13px] font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        {universityError}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set([...AVAILABLE_LANGUAGES, ...languages])].sort().map(lang => {
                      const isSelected = languages.includes(lang);
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
                      <div className="flex items-center gap-1">
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
                          placeholder="Type language..."
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#444444] focus:outline-none w-32"
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
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: SOCIAL ENERGY */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">Your Social Battery <Zap className="w-6 h-6 text-[#444444]" /></h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  We use this to match you with events that fit your vibe—whether you want a massive party or a quiet study session.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-8">
                
                {/* Introvert/Extrovert Score */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-8 text-center">
                    Where do you fall on the spectrum?
                  </label>
                  
                  {/* Value bubble */}
                  <div className="relative w-full mb-6">
                    <div 
                      className="absolute top-0 -mt-8 text-xs font-bold text-white bg-[#444444] px-2 py-1 rounded shadow-sm transform -translate-x-1/2 transition-all"
                      style={{ left: `${introvertScore}%` }}
                    >
                      {introvertScore}
                      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#444444]"></div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={introvertScore} 
                      onChange={(e) => setIntrovertScore(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#444444]"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Introvert</span>
                    <span>Extrovert</span>
                  </div>
                </div>

                {/* Social Energy Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 text-center">
                    What is your ideal event energy level?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setSocialEnergyLevel("Low")}
                      className={`p-4 rounded-xl border-2 text-left flex items-center transition-all ${
                        socialEnergyLevel === "Low" 
                          ? "border-[#444444] bg-gray-50 shadow-sm" 
                          : "border-gray-100 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Headphones className={`w-8 h-8 mr-4 ${socialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-400"}`} />
                      <div>
                        <div className={`font-bold ${socialEnergyLevel === "Low" ? "text-[#444444]" : "text-gray-700"}`}>Low Energy</div>
                        <div className="text-xs text-gray-500 mt-0.5">Quiet, relaxed, 1-on-1s, small intimate groups.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSocialEnergyLevel("Medium")}
                      className={`p-4 rounded-xl border-2 text-left flex items-center transition-all ${
                        socialEnergyLevel === "Medium" 
                          ? "border-[#444444] bg-gray-50 shadow-sm" 
                          : "border-gray-100 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Coffee className={`w-8 h-8 mr-4 ${socialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-400"}`} />
                      <div>
                        <div className={`font-bold ${socialEnergyLevel === "Medium" ? "text-[#444444]" : "text-gray-700"}`}>Medium Energy</div>
                        <div className="text-xs text-gray-500 mt-0.5">Moderate crowds, casual hangouts, workshops.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSocialEnergyLevel("High")}
                      className={`p-4 rounded-xl border-2 text-left flex items-center transition-all ${
                        socialEnergyLevel === "High" 
                          ? "border-[#444444] bg-gray-50 shadow-sm" 
                          : "border-gray-100 bg-white hover:border-gray-300"
                      }`}
                    >
                      <PartyPopper className={`w-8 h-8 mr-4 ${socialEnergyLevel === "High" ? "text-[#444444]" : "text-gray-400"}`} />
                      <div>
                        <div className={`font-bold ${socialEnergyLevel === "High" ? "text-[#444444]" : "text-gray-700"}`}>High Energy</div>
                        <div className="text-xs text-gray-500 mt-0.5">Loud, vibrant, large crowds, parties, concerts.</div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">What are you into? <Target className="w-6 h-6 text-[#444444]" /></h2>
                <p className="text-gray-500 text-sm">Select a few tags so we can find people with similar hobbies.</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto pb-4">
                {ALL_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border ${
                        isSelected 
                          ? "bg-[#444444] text-white border-[#444444] transform scale-105" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#444444] hover:text-[#444444]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: BIO & AI EXTRACTION */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">Tell us about yourself <PenTool className="w-6 h-6 text-[#444444]" /></h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">Write a short bio. Our AI will analyze this to find your perfect matches.</p>
              </div>

              <div className="max-w-lg mx-auto">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I'm a first-year IT student who loves building mechanical keyboards and exploring Cape Town cafes..."
                  className="w-full h-32 p-4 bg-white border border-gray-300 rounded-xl text-gray-800 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent transition-all shadow-sm resize-none mb-6"
                />

                {/* AI Extraction Preview */}
                <div className="bg-[#444444]/5 border border-[#444444]/10 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Sparkles className="w-16 h-16 text-[#444444]" />
                  </div>
                  <h4 className="text-xs font-bold text-[#444444] uppercase tracking-wider mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> AI Match Profile Preview
                  </h4>
                  
                  {bio.length < 10 ? (
                    <p className="text-sm text-gray-500 italic">Start typing your bio to see how our AI categorizes your profile...</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-700 mb-3 font-medium">Based on your bio, we'll connect you with students interested in:</p>
                      <div className="flex flex-wrap gap-2">
                        {isAnalyzing ? (
                          <>
                            <span className="bg-gray-200 text-gray-600 animate-pulse text-[11px] font-bold px-2 py-1.5 rounded">ANALYZING...</span>
                            <span className="bg-gray-200 text-gray-600 animate-pulse text-[11px] font-bold px-2 py-1.5 rounded w-16 h-6 inline-block"></span>
                          </>
                        ) : (
                          aiTags.length > 0 ? (
                            aiTags.map((tag, idx) => (
                              <span key={idx} className="bg-[#444444] text-white text-[11px] font-bold px-2 py-1.5 rounded">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">No specific tags extracted yet. Keep writing!</span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              step === 1 
                ? "opacity-0 cursor-default" 
                : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
            }`}
          >
            Back
          </button>

          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center ${
                (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "text-white bg-[#444444] hover:bg-[#333333]"
              }`}
            >
              Next Step
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          ) : (
            <button 
              onClick={completeOnboarding}
              disabled={bio.length < 10 || isSubmitting}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center ${
                bio.length < 10 || isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "text-white bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Complete Profile
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
