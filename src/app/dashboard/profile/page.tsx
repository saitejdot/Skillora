"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function ProfileManagementPage() {
  const { data: session, update } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [academicYear, setAcademicYear] = useState("3rd Year");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Verification fields
  const [userStatus, setUserStatus] = useState<any>(null);
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [idCardUrl, setIdCardUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifMessage, setVerifMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setUserStatus(u);
          setName(u.name || "");
          setBio(u.profile?.bio || "");
          setCollege(u.profile?.college || "");
          setDegree(u.profile?.degree || "");
          setAcademicYear(u.profile?.academicYear || "3rd Year");
          setGithubUrl(u.profile?.githubUrl || "");
          setLinkedinUrl(u.profile?.linkedinUrl || "");
          setWebsiteUrl(u.profile?.websiteUrl || "");
          setSkills(u.userSkills?.map((s: any) => s.skill.name) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      loadProfile();
    }
  }, [session?.user]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          college: college.trim(),
          degree: degree.trim(),
          academicYear,
          githubUrl: githubUrl.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      await update({ name });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifMessage("");

    try {
      const res = await fetch("/api/user/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college: college.trim() || "University Student",
          studentIdNumber: studentIdNumber.trim(),
          idCardUrl: idCardUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification submission failed");

      setVerifMessage("Verification request submitted! Administrators will review your ID card.");
      setUserStatus((prev: any) => ({
        ...prev,
        verificationStatus: "PENDING",
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs">Loading profile settings...</span>
      </div>
    );
  }

  const isVerified = userStatus?.isVerifiedStudent;
  const verifStatus = userStatus?.verificationStatus || "NOT_SUBMITTED";

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profile & Campus Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build a trustworthy reputation with your university credentials and skills.
          </p>
        </div>

        {session?.user?.id && (
          <Link
            href={`/students/${session.user.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* College Verification Banner / Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Official Student Verification
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Only verified university students receive the green badge across all service listings.
            </p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              isVerified
                ? "bg-emerald-100 text-emerald-800"
                : verifStatus === "PENDING"
                ? "bg-amber-100 text-amber-800"
                : verifStatus === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {isVerified ? "Verified" : verifStatus.replace("_", " ")}
          </span>
        </div>

        {verifMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
            {verifMessage}
          </div>
        )}

        {isVerified ? (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">You are an approved and verified college student.</p>
              <p className="text-[11px] text-emerald-700">
                Your profile and all your services proudly show the Verified Student badge.
              </p>
            </div>
          </div>
        ) : verifStatus === "PENDING" ? (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Your verification request is pending admin review.</p>
              <p className="text-[11px] text-amber-700">
                Our administrators review student ID uploads to prevent fraudulent listings. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2 border-t border-slate-100">
            {verifStatus === "REJECTED" && (
              <p className="text-xs text-red-600 font-semibold">
                Your previous request was declined. Please re-upload a clearer image of your College ID.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={studentIdNumber}
                  onChange={(e) => setStudentIdNumber(e.target.value)}
                  placeholder="e.g. 2024CS0892"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College ID Card Photo Link *
                </label>
                <input
                  type="url"
                  required
                  value={idCardUrl}
                  onChange={(e) => setIdCardUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or image URL"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setIdCardUrl(
                    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"
                  )
                }
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                + Fill demo student ID photo
              </button>

              <button
                type="submit"
                disabled={verifying}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                {verifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit for Verification</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          Personal & Academic Information
        </h2>

        {/* Name & Avatar Preview */}
        <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
          <Avatar
            src={session?.user?.avatar}
            fallback={name || "U"}
            size="lg"
            className="ring-2 ring-slate-200"
          />
          <div className="flex-1 max-w-sm">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
        </div>

        {/* Academic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              College / University
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Degree / Major
            </label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. B.S. Computer Science"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="4th Year">4th Year (Senior)</option>
              <option value="Graduate">Graduate / Master's</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Short Professional Bio
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell clients about your background, what projects you build, and why you love your craft..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 leading-relaxed"
          />
          <div className="text-[11px] text-slate-400 text-right">
            {bio.length} / 500 max
          </div>
        </div>

        {/* Skills Management */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Skills & Software Proficiencies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. Next.js, Figma, Premiere Pro, Calculus"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
              >
                {s}
                <X
                  className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-950"
                  onClick={() => handleRemoveSkill(s)}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio & Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub Profile
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Website / Portfolio
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
