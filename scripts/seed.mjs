import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Skillora database...");

  // 1. Seed Categories
  const categoriesData = [
    {
      name: "Graphic Design",
      slug: "graphic-design",
      description: "Logos, brand identity, social banners, and digital illustrations.",
      icon: "Palette",
      displayOrder: 1,
    },
    {
      name: "Programming & Tech",
      slug: "programming-development",
      description: "Full-stack web apps, mobile apps, bug fixes, APIs, and scripts.",
      icon: "Code",
      displayOrder: 2,
    },
    {
      name: "Video Editing",
      slug: "video-editing",
      description: "YouTube videos, TikToks, Reels, podcast editing, and motion graphics.",
      icon: "Video",
      displayOrder: 3,
    },
    {
      name: "Photography",
      slug: "photography",
      description: "Graduation portraits, headshots, campus events, and photo editing.",
      icon: "Camera",
      displayOrder: 4,
    },
    {
      name: "Tutoring & Academics",
      slug: "tutoring",
      description: "Calculus, CS algorithms, biology, test prep, and homework mentoring.",
      icon: "GraduationCap",
      displayOrder: 5,
    },
    {
      name: "Content Creation",
      slug: "content-creation",
      description: "UGC video ads, social reels, campus reviews, and creative scripts.",
      icon: "Sparkles",
      displayOrder: 6,
    },
    {
      name: "Writing & Translation",
      slug: "writing-translation",
      description: "Resume polish, personal statements, blog articles, and editing.",
      icon: "PenTool",
      displayOrder: 7,
    },
    {
      name: "Event Support",
      slug: "event-support",
      description: "On-site tech crew, sound mixing, stage setup, and event photography.",
      icon: "Calendar",
      displayOrder: 8,
    },
    {
      name: "Marketing & Social Media",
      slug: "marketing-social-media",
      description: "Instagram growth, campus ambassadorship, SEO, and ads management.",
      icon: "Share2",
      displayOrder: 9,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log("Categories seeded.");

  // 2. Seed Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@skillora.edu" },
    create: {
      name: "Skillora Administrator",
      email: "admin@skillora.edu",
      password: adminPassword,
      role: "ADMIN",
      activeMode: "STUDENT",
      isVerifiedStudent: true,
      verificationStatus: "APPROVED",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SkilloraAdmin",
    },
    update: {
      role: "ADMIN",
    },
  });
  console.log("Admin seeded: admin@skillora.edu (pw: admin123)");

  // 3. Seed Students
  const defaultPassword = await bcrypt.hash("password123", 10);

  const studentsData = [
    {
      name: "Alex Rivera",
      email: "alex.rivera@berkeley.edu",
      college: "UC Berkeley",
      degree: "B.S. Computer Science",
      academicYear: "3rd Year",
      bio: "Full-stack developer building modern Next.js and React web applications. Passionate about clean code, UI design, and fast turnarounds.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Python"],
      isVerified: true,
      services: [
        {
          title: "I will build a modern, high-converting Next.js landing page with Tailwind",
          categorySlug: "programming-development",
          price: 65,
          deliveryDays: 3,
          description: "Need a sleek website for your startup, portfolio, or student club? I will develop a fully responsive, pixel-perfect Next.js web application using React, TypeScript, and Tailwind CSS. Includes SEO tags, mobile optimization, and fast loading performance.",
          tags: ["nextjs", "react", "tailwindcss", "web-development"],
          images: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
          ],
        },
        {
          title: "I will fix bugs and implement features in your React or Node codebase",
          categorySlug: "programming-development",
          price: 40,
          deliveryDays: 2,
          description: "Stuck with broken API calls, layout bugs, or mysterious TypeScript errors? I will debug and resolve issues cleanly in your codebase with detailed documentation.",
          tags: ["react", "nodejs", "bug-fix", "typescript"],
          images: [
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
    {
      name: "Sophia Chen",
      email: "sophia.design@stanford.edu",
      college: "Stanford University",
      degree: "B.A. Product Design & Visual Arts",
      academicYear: "4th Year",
      bio: "Visual designer crafting modern brand identities, logos, and UI prototypes. Published in campus design showcases.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      skills: ["Figma", "Logo Design", "Illustrator", "Branding", "UI/UX"],
      isVerified: true,
      services: [
        {
          title: "I will design a minimalist, memorable brand logo and vector identity",
          categorySlug: "graphic-design",
          price: 50,
          deliveryDays: 2,
          description: "Looking for an iconic logo for your startup, YouTube channel, or club? I will deliver 2 original concepts, unlimited vector SVGs, and high-res PNG/JPG files.",
          tags: ["logo-design", "branding", "figma", "minimalist"],
          images: [
            "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80",
          ],
        },
        {
          title: "I will create clickable Figma UI/UX prototypes for your app idea",
          categorySlug: "graphic-design",
          price: 85,
          deliveryDays: 4,
          description: "Turn your napkin sketch into interactive, investor-ready mobile screens using modern Figma auto-layout and component systems.",
          tags: ["ui-ux", "figma", "wireframing", "mobile-app"],
          images: [
            "https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
    {
      name: "Marcus Johnson",
      email: "marcus.video@utexas.edu",
      college: "UT Austin",
      degree: "B.S. Radio-Television-Film",
      academicYear: "2nd Year",
      bio: "Video editor & motion designer. Over 10M views generated across YouTube Shorts and TikTok accounts.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut", "Sound Design"],
      isVerified: true,
      services: [
        {
          title: "I will edit high-retention viral YouTube Shorts, Reels, and TikToks",
          categorySlug: "video-editing",
          price: 35,
          deliveryDays: 2,
          description: "Fast-paced captions, engaging sound effects, dynamic zooms, and B-roll inserts to maximize watch time and viral engagement.",
          tags: ["video-editing", "reels", "tiktok", "shorts", "premiere"],
          images: [
            "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
    {
      name: "Priya Patel",
      email: "priya.math@mit.edu",
      college: "MIT",
      degree: "B.S. Mathematics & EECS",
      academicYear: "3rd Year",
      bio: "Teaching assistant and tutor for linear algebra, multivariable calculus, and discrete mathematics.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
      skills: ["Calculus", "Linear Algebra", "Python", "Data Structures", "Statistics"],
      isVerified: true,
      services: [
        {
          title: "I will provide 1-on-1 tutoring in Calculus, Linear Algebra, or Python",
          categorySlug: "tutoring",
          price: 30,
          deliveryDays: 1,
          description: "Struggling with homework concepts or exam prep? 60-minute interactive session breaking down complex formulas with intuitive explanations and customized practice problems.",
          tags: ["tutoring", "calculus", "math", "python", "mentorship"],
          images: [
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
    {
      name: "David Kim",
      email: "david.photo@nyu.edu",
      college: "New York University",
      degree: "B.F.A. Photography & Imaging",
      academicYear: "4th Year",
      bio: "Editorial and portrait photographer specializing in LinkedIn headshots, campus graduation portraits, and Lightroom retouching.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      skills: ["Lightroom", "Photoshop", "Portrait Photography", "Color Grading", "Headshots"],
      isVerified: true,
      services: [
        {
          title: "I will professionally retouch and color-grade your portraits or headshots",
          categorySlug: "photography",
          price: 25,
          deliveryDays: 1,
          description: "Skin retouching, blemish removal, studio lighting adjustments, and natural color grading suitable for LinkedIn, modeling portfolios, and resumes.",
          tags: ["photography", "lightroom", "photoshop", "retouching"],
          images: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
  ];

  // 4. Seed Buyer User
  const buyerUser = await prisma.user.upsert({
    where: { email: "emily.buyer@gmail.com" },
    create: {
      name: "Emily Watson",
      email: "emily.buyer@gmail.com",
      password: defaultPassword,
      role: "CUSTOMER",
      activeMode: "CUSTOMER",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    },
    update: {},
  });
  console.log("Buyer seeded: emily.buyer@gmail.com (pw: password123)");

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      create: {
        name: s.name,
        email: s.email,
        password: defaultPassword,
        role: "STUDENT",
        activeMode: "STUDENT",
        isVerifiedStudent: s.isVerified,
        verificationStatus: s.isVerified ? "APPROVED" : "NOT_SUBMITTED",
        avatar: s.avatar,
      },
      update: {
        isVerifiedStudent: s.isVerified,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        college: s.college,
        degree: s.degree,
        academicYear: s.academicYear,
        bio: s.bio,
      },
      update: {
        college: s.college,
        degree: s.degree,
        academicYear: s.academicYear,
        bio: s.bio,
      },
    });

    // Seed services
    for (const serv of s.services) {
      const slug = serv.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 50);

      const categoryId = categoryMap[serv.categorySlug];

      const createdService = await prisma.service.upsert({
        where: { slug },
        create: {
          title: serv.title,
          slug,
          description: serv.description,
          price: serv.price,
          deliveryDays: serv.deliveryDays,
          tags: serv.tags,
          status: "ACTIVE",
          categoryId,
          studentId: user.id,
          averageRating: 5.0,
          totalReviews: 2,
        },
        update: {
          price: serv.price,
          status: "ACTIVE",
        },
      });

      // Images
      await prisma.serviceImage.deleteMany({ where: { serviceId: createdService.id } });
      await prisma.serviceImage.createMany({
        data: serv.images.map((url, idx) => ({
          serviceId: createdService.id,
          url,
          isPrimary: idx === 0,
        })),
      });

      // Add a realistic completed order and review
      const orderNumber = `SKL-${Math.floor(100000 + Math.random() * 900000)}`;
      const existingOrder = await prisma.order.findFirst({
        where: { serviceId: createdService.id, buyerId: buyerUser.id },
      });

      if (!existingOrder) {
        const order = await prisma.order.create({
          data: {
            orderNumber,
            serviceId: createdService.id,
            buyerId: buyerUser.id,
            studentId: user.id,
            price: createdService.price,
            status: "COMPLETED",
          },
        });

        await prisma.orderRequirement.create({
          data: {
            orderId: order.id,
            description: "Here are my project requirements. Looking for clean work!",
          },
        });

        await prisma.delivery.create({
          data: {
            orderId: order.id,
            message: "Completed all project deliverables! Let me know if you need any adjustments.",
            fileUrls: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"],
          },
        });

        await prisma.review.create({
          data: {
            orderId: order.id,
            buyerId: buyerUser.id,
            studentId: user.id,
            serviceId: createdService.id,
            rating: 5,
            comment: "Outstanding work! Delivered ahead of schedule with top-notch attention to detail. Highly recommend this student!",
          },
        });
      }
    }
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

