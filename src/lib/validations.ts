import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "CUSTOMER"]).default("CUSTOMER"),
  college: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
  college: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  academicYear: z.string().optional().nullable(),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")).nullable(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")).nullable(),
  websiteUrl: z.string().url("Invalid Website URL").optional().or(z.literal("")).nullable(),
  skills: z.array(z.string()).optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(5, "Minimum price is $5").max(10000, "Maximum price is $10,000"),
  deliveryDays: z.coerce.number().min(1, "Delivery must be at least 1 day").max(90, "Delivery cannot exceed 90 days"),
  tags: z.array(z.string()).min(1, "Add at least 1 tag").max(5, "Maximum 5 tags"),
  imageUrls: z.array(z.string().url()).min(1, "At least one service image is required"),
});

export const orderRequestSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  requirements: z.string().min(20, "Please describe your project requirements in at least 20 characters"),
  attachmentUrls: z.array(z.string().url()).optional().default([]),
  deadline: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED"]),
  reason: z.string().optional(),
});

export const deliverySchema = z.object({
  message: z.string().min(10, "Delivery note must be at least 10 characters"),
  fileUrls: z.array(z.string().url()).min(1, "Please provide at least one link or file URL for your delivered work"),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review cannot exceed 1000 characters"),
});

export const verificationSchema = z.object({
  college: z.string().min(2, "College name is required"),
  studentIdNumber: z.string().min(2, "Student ID/Roll number is required"),
  idCardUrl: z.string().url("Valid College ID card image link is required"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
});

