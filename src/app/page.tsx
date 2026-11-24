import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { HeroSearch } from "@/components/marketplace/hero-search";
import { CategoryCard } from "@/components/marketplace/category-card";
import { ServiceCard } from "@/components/marketplace/service-card";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { CtaBanner } from "@/components/marketplace/cta-banner";
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react";

export const revalidate = 60; // ISR cache 60s

async function getData() {
  try {
    const [categories, featuredServices, recentServices] = await Promise.all([
      prisma.category.findMany({
        take: 8,
        orderBy: { displayOrder: "asc" },
        include: {
          _count: { select: { services: { where: { status: "ACTIVE" } } } },
        },
      }),
      prisma.service.findMany({
        where: { status: "ACTIVE" },
        take: 8,
        orderBy: [{ totalReviews: "desc" }, { averageRating: "desc" }],
        include: {
          category: { select: { name: true, slug: true } },
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerifiedStudent: true,
              profile: { select: { college: true } },
            },
          },
          images: { orderBy: { isPrimary: "desc" } },
        },
      }),
      prisma.service.findMany({
        where: { status: "ACTIVE" },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerifiedStudent: true,
              profile: { select: { college: true } },
            },
          },
          images: { orderBy: { isPrimary: "desc" } },
        },
      }),
    ]);

    return { categories, featuredServices, recentServices };
  } catch (err) {
    console.error("Homepage data fetch fallback:", err);
    return {
      categories: [],
      featuredServices: [],
      recentServices: [],
    };
  }
}

export default async function HomePage() {
  const { categories, featuredServices, recentServices } = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSearch />

      {/* 2. Popular Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Explore Fields
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Popular Service Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(categories.length > 0 ? categories : fallbackCategories).map((cat: any) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              slug={cat.slug}
              description={cat.description}
              count={cat._count?.services ?? 0}
            />
          ))}
        </div>
      </section>

      {/* 3. Featured Student Services */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Top Rated by Clients</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Featured Student Services
              </h2>
            </div>
            <Link
              href="/explore?sort=rating"
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              See more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredServices.length > 0 ? featuredServices : fallbackServices).map((service: any) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                slug={service.slug}
                price={service.price}
                deliveryDays={service.deliveryDays}
                averageRating={service.averageRating}
                totalReviews={service.totalReviews}
                category={service.category}
                student={service.student}
                images={service.images}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Recently Added Student Services */}
      {recentServices.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Clock className="w-3.5 h-3.5" />
                <span>Fresh from Campus</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Recently Added Services
              </h2>
            </div>
            <Link
              href="/explore?sort=newest"
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              View newest <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentServices.map((service: any) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                slug={service.slug}
                price={service.price}
                deliveryDays={service.deliveryDays}
                averageRating={service.averageRating}
                totalReviews={service.totalReviews}
                category={service.category}
                student={service.student}
                images={service.images}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. How It Works */}
      <HowItWorks />

      {/* 6. Become a Provider CTA */}
      <CtaBanner />
    </div>
  );
}

const fallbackCategories = [
  { name: "Graphic Design", slug: "graphic-design", description: "Logos, brand identity, and illustrations." },
  { name: "Programming & Tech", slug: "programming-development", description: "Web apps, APIs, scripts, and bug fixes." },
  { name: "Video Editing", slug: "video-editing", description: "Shorts, Reels, YouTube cuts, and effects." },
  { name: "Photography", slug: "photography", description: "Portraits, headshots, and photo retouching." },
  { name: "Tutoring & Academics", slug: "tutoring", description: "Calculus, algorithms, and exam prep." },
  { name: "Content Creation", slug: "content-creation", description: "UGC ads, reels, and video hooks." },
  { name: "Writing & Translation", slug: "writing-translation", description: "Resume polish and article writing." },
  { name: "Marketing & Social Media", slug: "marketing-social-media", description: "Campus growth, ads, and engagement." },
];

const fallbackServices = [
  {
    id: "sample-1",
    title: "I will build a modern, high-converting Next.js landing page with Tailwind",
    slug: "modern-nextjs-landing-page",
    price: 65,
    deliveryDays: 3,
    averageRating: 5.0,
    totalReviews: 12,
    category: { name: "Programming & Tech", slug: "programming-development" },
    student: {
      id: "stud-1",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      isVerifiedStudent: true,
      profile: { college: "UC Berkeley" },
    },
    images: [{ url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
  },
  {
    id: "sample-2",
    title: "I will design a minimalist, memorable brand logo and vector identity",
    slug: "minimalist-brand-logo",
    price: 50,
    deliveryDays: 2,
    averageRating: 4.9,
    totalReviews: 18,
    category: { name: "Graphic Design", slug: "graphic-design" },
    student: {
      id: "stud-2",
      name: "Sophia Chen",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      isVerifiedStudent: true,
      profile: { college: "Stanford University" },
    },
    images: [{ url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
  },
  {
    id: "sample-3",
    title: "I will edit high-retention viral YouTube Shorts, Reels, and TikToks",
    slug: "viral-youtube-shorts-editing",
    price: 35,
    deliveryDays: 2,
    averageRating: 5.0,
    totalReviews: 9,
    category: { name: "Video Editing", slug: "video-editing" },
    student: {
      id: "stud-3",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      isVerifiedStudent: true,
      profile: { college: "UT Austin" },
    },
    images: [{ url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
  },
  {
    id: "sample-4",
    title: "I will provide 1-on-1 tutoring in Calculus, Linear Algebra, or Python",
    slug: "calculus-math-tutoring",
    price: 30,
    deliveryDays: 1,
    averageRating: 5.0,
    totalReviews: 15,
    category: { name: "Tutoring & Academics", slug: "tutoring" },
    student: {
      id: "stud-4",
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
      isVerifiedStudent: true,
      profile: { college: "MIT" },
    },
    images: [{ url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
  },
];

