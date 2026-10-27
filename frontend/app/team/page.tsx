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
  Award,
  Newspaper,
  UserCheck,
  GraduationCap,
  Briefcase
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

function formatAvatarUrl(imgUrl?: string): string {
  if (!imgUrl) return "";
  let url = imgUrl.trim();
  if (url.startsWith("https//")) url = url.replace("https//", "https://");
  if (url.startsWith("http//")) url = url.replace("http//", "http://");
  if (url.includes("yellowgreen-rook-384455.hostingersite.com")) {
    const pathPart = url
      .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("//yellowgreen-rook-384455.hostingersite.com", "");
    url = `https://www.globalawaaz.com${pathPart.startsWith("/") ? pathPart : `/${pathPart}`}`;
  }
  return url;
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
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 max-w-4xl mx-auto leading-tight">
              {isHi ? (
                <>
                  GLOBAL AWAAZ की <span className="text-red-600">विश्वसनीय और निष्पक्ष</span> मीडिया टीम
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
                          src={formatAvatarUrl(member.avatar)}
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

                      {/* Bottom Social & Contact Row */}
                      {(member.phone || member.email || member.facebook || member.instagram || member.linkedin || member.twitter) && (
                        <div className="flex items-center justify-center flex-wrap gap-2.5 pt-4 mt-3 border-t border-slate-100">
                          {member.phone && (
                            <a
                              href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                              className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title={`Call ${displayName}: ${member.phone}`}
                              aria-label={`Call ${displayName}`}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}

                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                              title={`Email ${displayName}: ${member.email}`}
                              aria-label={`Email ${displayName}`}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

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
      </main>
    </div>
  );
}

