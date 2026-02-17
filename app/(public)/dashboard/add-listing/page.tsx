"use client";

import Link from "next/link";
import { useState } from "react";
import { createProduct } from "@/lib/api/product";
import { detectAI, priceAI } from "@/lib/api/extension";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardSection, DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type AIResult = {
  aiSuggestedPrice: number;
  condition: string;
  confidence: number;
  fallbackUsed?: boolean;
};

export default function AddListingPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    priceListed: "",
    mode: "buy_now",
    location: "",
  });
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!form.image.trim()) {
      setError("Image URL is required for AI analysis and listing creation");
      return;
    }

    setAnalyzing(true);

    try {
      const detectResponse = await detectAI({ image: form.image.trim() });
      const condition = detectResponse.condition || "good";
      const confidence = Number(detectResponse.confidence || 0);
      const inferredCategory = condition;

      if (!form.category) {
        setForm((prev) => ({ ...prev, category: inferredCategory }));
      }

      const priceResponse = await priceAI({
        category: form.category || inferredCategory,
        condition,
        location: form.location,
      });

      const response = await createProduct({
        title: form.title,
        description: form.description,
        category: form.category || inferredCategory,
        images: [form.image.trim()],
        priceListed: Number(form.priceListed || priceResponse.aiSuggestedPrice),
        mode: form.mode as "buy_now" | "auction" | "donate",
        location: form.location,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create listing");
      }

      setResult({
        aiSuggestedPrice: Number(priceResponse.aiSuggestedPrice),
        condition,
        confidence,
        fallbackUsed: Boolean(detectResponse.fallbackUsed || priceResponse.fallbackUsed),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardPageScaffold
      title="Add Listing"
      subtitle="Create a new listing with AI-assisted condition and pricing signals."
      routeLabel="Dashboard / Add Listing"
      maxWidth="max-w-3xl"
      actions={<Link href="/dashboard" className="btn-secondary btn-sm">Back to Dashboard</Link>}
    >
      {error && <DashboardStatus tone="error">{error}</DashboardStatus>}

      <DashboardSection title="Listing Form" subtitle="All fields are validated before listing creation.">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className="input-field md:col-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input-field md:col-span-2 min-h-30" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <input className="input-field md:col-span-2" placeholder="Image URL (single image)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              <option value="electronics">electronics</option>
              <option value="fashion">fashion</option>
              <option value="books">books</option>
              <option value="sports">sports</option>
            </select>
            <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <input className="input-field" placeholder="Price Listed (NPR)" type="number" value={form.priceListed} onChange={(e) => setForm({ ...form, priceListed: e.target.value })} required />
            <select className="input-field" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="buy_now">Buy Now</option>
              <option value="auction">Auction</option>
              <option value="donate">Donate</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={analyzing}>{analyzing ? "Analyzing with AI..." : "Submit"}</button>
        </form>
      </DashboardSection>

      {analyzing && (
        <DashboardSurface className="p-4">
          <p className="text-white">Analyzing with AI...</p>
          <div className="mt-3 h-2 w-full rounded-full bg-dark-border">
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-primary-600" />
          </div>
        </DashboardSurface>
      )}

      {result && (
        <DashboardSection title="AI Result" subtitle="This recommendation is generated from the uploaded listing context.">
          <p className="text-white/70">Suggested Price: NPR {result.aiSuggestedPrice}</p>
          <p className="text-white/70">Condition: {result.condition}</p>
          <div className="mt-3">
            <p className="mb-1 text-sm text-white/60">Confidence: {Math.round(result.confidence * 100)}%</p>
            <div className="h-2 w-full rounded-full bg-dark-border">
              <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.max(0, Math.min(100, Math.round(result.confidence * 100)))}%` }} />
            </div>
          </div>
          {result.fallbackUsed && <p className="mt-3 text-amber-300">AI Unavailable — Using Estimated Values</p>}
          <p className="mt-3 text-sm text-white/60">Listing is saved and visible in marketplace.</p>
        </DashboardSection>
      )}
    </DashboardPageScaffold>
  );
}
