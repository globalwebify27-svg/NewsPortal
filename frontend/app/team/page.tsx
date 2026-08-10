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
  UserCheck
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
      <main className="flex-1 pb-16">
        {/* Premium Light Mode Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-slate-50 py-14 sm:py-20 border-b border-slate-200/80">
          <div className="absolute top-0 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>{isHi ? "हमारी संपादकीय टीम" : "Editorial Leadership"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 max-w-4xl mx-auto leading-tight">
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

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
              {isHi
                ? "देश-विदेश, राजनीति, खेल, और जनसरोकार की खबरों को आप तक निर्भीकता और सटीकता से पहुंचाने वाले हमारे वरिष्ठ पत्रकारों एवं संपादकों की टीम।"
                : "Our dedicated team of veteran journalists, editors, and correspondents bringing uncompromised truth, breaking news, and in-depth analysis."}
            </p>

            {/* Light Mode Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={isHi ? "नाम या पद द्वारा खोजें..." : "Search team by name or designation..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 shadow-md transition"
              />
            </div>
          </div>
        </section>

        {/* Team Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member) => {
                const displayName = isHi && member.nameHi ? member.nameHi : member.name;
                const displayRole = isHi && member.designationHi ? member.designationHi : member.designation;
                const displayBio = isHi && member.bioHi ? member.bioHi : member.bio;

                return (
                  <div
                    key={member.id}
                    className="bg-white border border-slate-200 hover:border-red-300 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo & Header */}
                      <div className="flex items-center gap-4 mb-5">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={displayName}
                            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 group-hover:ring-red-100 transition shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-red-600 shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition leading-snug">
                            {displayName}
                          </h3>
                          <p className="text-xs font-bold text-red-600 mt-1 uppercase tracking-wider bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-md inline-block">
                            {displayRole}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      {displayBio && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 border-t border-slate-100 pt-4 mb-4">
                          {displayBio}
                        </p>
                      )}
                    </div>

                    {/* Contact & Social Links */}
                    <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-600 transition truncate font-medium"
                        >
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </a>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-600 flex items-center justify-center transition border border-slate-200"
                            title="Twitter / X"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 flex items-center justify-center transition border border-slate-200"
                            title="LinkedIn"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.facebook && (
                          <a
                            href={member.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-600 flex items-center justify-center transition border border-slate-200"
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
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-600 hover:text-white text-slate-600 flex items-center justify-center transition border border-slate-200"
                            title="Instagram"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Light Mode Commitment Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white border-l-4 border-l-red-600 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{isHi ? "हमारा संकल्प" : "Our Editorial Integrity"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {isHi ? "निष्पक्ष पत्रकारिता और सत्य का प्रहरी" : "Independent Journalism You Can Trust"}
              </h2>
              <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
                {isHi
                  ? "ग्लोबल आवाज़ का हर रिपोर्टर और संपादक बिना किसी दबाव या पक्षपात के केवल तथ्यपरक समाचार आप तक पहुँचाने के लिए प्रतिबद्ध है।"
                  : "Every reporter and editor at GLOBAL AWAAZ adheres to strict editorial integrity, verified facts, and unbiased reporting."}
              </p>
            </div>

            <Link
              href="/about"
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition shadow-md shadow-red-600/20 flex items-center gap-2 shrink-0"
            >
              <span>{isHi ? "हमारे बारे में पढ़ें" : "About Our Mission"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

