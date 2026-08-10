"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Mail,
  Phone,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Award,
  Newspaper,
  UserCheck,
  GraduationCap,
  Briefcase,
  Clock,
  Globe,
  Lock,
  Send
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  nameHi?: string;
  designation: string;
  designationHi?: string;
  bio?: string;
  bioHi?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  education?: string;
  experience?: string;
  order: number;
}

export default function PublicTeamPage() {
  const { lang } = useLanguage();
  const isHi = lang === "HI";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch("/api/v1/team");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setMembers(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.nameHi && m.nameHi.toLowerCase().includes(q)) ||
      m.designation.toLowerCase().includes(q) ||
      (m.designationHi && m.designationHi.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <main className="flex-1 pb-10">
        {/* Premium Light Mode Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-slate-50 py-8 sm:py-10 border-b border-slate-200/80">
          <div className="absolute top-0 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>{isHi ? "हमारी संपादकीय टीम" : "Editorial Leadership"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 max-w-4xl mx-auto leading-tight">
              {isHi ? (
                <>
                  ग्लोबल आवाज़ की <span className="text-red-600">विश्वसनीय और निष्पक्ष</span> मीडिया टीम
                </>
              ) : (
                <>
                  Meet the Editorial Team Behind <span className="text-red-600">GLOBAL AWAAZ</span>
                </>
              )}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
              {isHi
                ? "देश-विदेश, राजनीति, खेल, और जनसरोकार की खबरों को आप तक निर्भीकता और सटीकता से पहुंचाने वाले हमारे वरिष्ठ पत्रकारों एवं संपादकों की टीम।"
                : "Our dedicated team of veteran journalists, editors, and correspondents bringing uncompromised truth, breaking news, and in-depth analysis."}
            </p>
          </div>
        </section>

        {/* Team Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">{isHi ? "टीम सदस्यों को लोड किया जा रहा है..." : "Loading editorial team..."}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                {isHi ? "कोई सदस्य नहीं मिला" : "No Team Members Found"}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery
                  ? isHi ? "आपकी खोज के अनुसार कोई सदस्य उपलब्ध नहीं है।" : "No members match your search criteria."
                  : isHi ? "जल्द ही हमारी टीम की सूची अपडेट की जाएगी।" : "Team members list will be updated shortly."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
              {filteredMembers.map((member) => {
                const displayName = isHi && member.nameHi ? member.nameHi : member.name;
                const displayRole = isHi && member.designationHi ? member.designationHi : member.designation;

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Flush Full-Width Photo Frame */}
                    <div className="relative w-full aspect-[4/3.8] overflow-hidden bg-slate-100">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={displayName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center text-4xl font-black text-emerald-500/30">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Middle Content Section */}
                    <div className="pt-5 pb-4 px-4 text-center flex-1 flex flex-col justify-between">
                      <div>
                        {/* Black Name */}
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-red-600 transition leading-snug tracking-tight mb-1">
                          {displayName}
                        </h3>

                        {/* Slate Uppercase Designation */}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {displayRole}
                        </p>

                        {/* Education & Experience Pills if present */}
                        {(member.education || member.experience) && (
                          <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                            {member.education && (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100/80">
                                {member.education}
                              </span>
                            )}
                            {member.experience && (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100/80">
                                {member.experience}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Social Icons Row */}
                      {(member.facebook || member.instagram || member.linkedin || member.twitter) && (
                        <div className="flex items-center justify-center gap-3 pt-4 mt-3 border-t border-slate-100">
                          {member.facebook && (
                            <a
                              href={member.facebook}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-600 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title="Facebook"
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}

                          {member.instagram && (
                            <a
                              href={member.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-600 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-transparent hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title="Instagram"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}

                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-600 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}

                          {member.twitter && (
                            <a
                              href={member.twitter}
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-600 hover:text-white hover:bg-slate-900 hover:border-slate-900 hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title="Twitter / X"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Compact Horizontal Newsletter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#1d080a] text-white rounded-[24px] p-5 sm:p-7 shadow-2xl border border-red-900/30 overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-80 h-full bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-red-600/10 blur-2xl pointer-events-none rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10">
              {/* Left Graphic Badge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-4 border-red-950/60 shadow-xl flex items-center justify-center text-white relative">
                  <Mail className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white/20" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md">
                    <Send className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Right Content & Form */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1 tracking-tight">
                  {isHi ? (
                    <>
                      ग्लोबल मॉर्निंग ब्रीफिंग के साथ <span className="text-red-500">आगे रहें</span>
                    </>
                  ) : (
                    <>
                      Stay Ahead with <span className="text-red-500">Global Morning Briefing</span>
                    </>
                  )}
                </h2>

                <p className="text-slate-400 text-xs sm:text-sm mb-4 max-w-2xl leading-relaxed font-normal">
                  {isHi
                    ? "हर सुबह अपने इनबॉक्स में संपादकीय विश्लेषण, बाजार की जानकारी और ताज़ा अंतरराष्ट्रीय अपडेट प्राप्त करें।"
                    : "Get editorial analysis, market insights, and fresh international updates delivered to your inbox every morning."}
                </p>

                {/* Integrated Pill Form Input Bar */}
                <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg border border-slate-200/50 max-w-lg mx-auto md:mx-0">
                  <Mail className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
                  <input
                    type="email"
                    placeholder={isHi ? "अपना ईमेल पता दर्ज करें..." : "Enter your email address..."}
                    className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none flex-1 min-w-0 pr-2"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0">
                    <span>{isHi ? "निःशुल्क सदस्यता लें" : "Subscribe Free"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 mt-3.5 font-medium">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                    {isHi ? "विश्वसनीय समाचार" : "Trusted Journalism"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    {isHi ? "हर सुबह अपडेट" : "Daily Morning Updates"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-red-500" />
                    {isHi ? "स्थानीय से वैश्विक कवरेज" : "Global & Local Coverage"}
                  </span>
                </div>

                {/* Privacy Note */}
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-center md:justify-start gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>{isHi ? "आपकी जानकारी सुरक्षित है। हम स्पैम नहीं भेजते।" : "Your information is 100% secure. We never spam."}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

