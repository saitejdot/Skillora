"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface ServiceFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    categoryId: string;
    price: number;
    deliveryDays: number;
    tags: string[];
    images: { url: string }[];
  };
  isEdit?: boolean;
}

const SAMPLE_PRESETS = [
  {
    name: "Web / Tech",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Graphic Design",
    url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Video Editing",
    url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Tutoring & Math",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Photography",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
];

export function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState(initialData?.title || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "45");
  const [deliveryDays, setDeliveryDays] = useState(
    initialData?.deliveryDays ? String(initialData.deliveryDays) : "3"
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i) => i.url) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (!categoryId && data.categories?.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleAddImage = (urlToAdd?: string) => {
    const targetUrl = urlToAdd || imageUrl.trim();
    if (targetUrl && !images.includes(targetUrl) && images.length < 5) {
      setImages([...images, targetUrl]);
      if (!urlToAdd) setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Please add at least one showcase image for your service.");
      return;
    }

    if (tags.length === 0) {
      setError("Please add at least one tag so buyers can find your service.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price: parseFloat(price),
        deliveryDays: parseInt(deliveryDays, 10),
        tags,
        imageUrls: images,
      };

      const url = isEdit ? `/api/services/${initialData?.id}` : "/api/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save service");
      }

      router.push("/dashboard/services");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to save service");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
          Service Title *
        </label>
        <p className="text-xs text-slate-400 mb-2">
          As your service's headline, describe what you will do clearly (e.g. "I will build a responsive Next.js landing page with Tailwind").
        </p>
        <input
          type="text"
          required
          minLength={10}
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="I will..."
          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
        />
        <div className="mt-1 text-[11px] text-slate-400 text-right">
          {title.length} / 100 max
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing & Delivery */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Price ($ USD) *
            </label>
            <input
              type="number"
              required
              min={5}
              max={10000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Delivery (Days) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={90}
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
          Detailed Description *
        </label>
        <p className="text-xs text-slate-400 mb-2">
          Detail your process, deliverables, software used, and what requirements you will need from the client.
        </p>
        <textarea
          required
          rows={6}
          minLength={50}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service in detail..."
          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 leading-relaxed"
        />
        <div className="mt-1 text-[11px] text-slate-400 text-right">
          {description.length} chars (min 50)
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
          Search Tags (1 to 5) *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Type tag and press Add (e.g. logo, react, tutor)"
            className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Add Tag
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold"
            >
              #{t}
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-950"
                onClick={() => handleRemoveTag(t)}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Images & Presets */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
          Service Showcase Images (1 to 5) *
        </label>
        <p className="text-xs text-slate-400 mb-2">
          Add high-resolution image URLs or pick from high-converting campus presets.
        </p>

        {/* Custom URL Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or Cloudinary URL"
            className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
          <button
            type="button"
            onClick={() => handleAddImage()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
          >
            Add Image
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.name}
              onClick={() => handleAddImage(preset.url)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              + {preset.name}
            </button>
          ))}
        </div>

        {/* Image Previews */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group"
            >
              <img src={url} alt="Service preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isEdit ? "Update Service Listing" : "Publish Service to Marketplace"}</span>
        </button>
      </div>
    </form>
  );
}

