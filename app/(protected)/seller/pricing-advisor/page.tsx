"use client";

import { useState } from "react";
import { priceAI } from "@/lib/api/extension";

export default function SellerPricingAdvisorPage() {
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<{ aiSuggestedPrice: number; confidence: number; fallbackUsed?: boolean } | null>(null);
  const [trace, setTrace] = useState<{ category: string; condition: string; location: string } | null>(null);
  const [error, setError] = useState("");

  const runAdvisor = async () => {
    try {
      setError("");
      setResult(null);
      const response = await priceAI({ category, condition, location });
      if (!response.success) {
        throw new Error(response.message || "Pricing advisor failed");
      }
      setTrace({ category, condition, location });
      setResult({
        aiSuggestedPrice: Number(response.aiSuggestedPrice || 0),
        confidence: Number(response.confidence || 0),
        fallbackUsed: Boolean(response.fallbackUsed),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pricing advisor failed");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="card">
            <h1 className="page-title">Pricing Advisor</h1>
            <p className="text-secondary">AI-assisted pricing guidance with confidence and fallback context.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="card grid grid-cols-1 gap-3">
            <input className="input-field" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className="input-field" placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
            <input className="input-field" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button className="btn-primary" onClick={runAdvisor}>Run Pricing Advisor</button>
          </div>

          {trace && (
            <div className="card">
              <h2 className="section-title mb-2">AI Input Trace</h2>
              <p className="text-sm text-secondary">Category: {trace.category}</p>
              <p className="text-sm text-secondary">Condition: {trace.condition}</p>
              <p className="text-sm text-secondary">Location: {trace.location}</p>
            </div>
          )}

          {result && (
            <div className="card">
              <h2 className="section-title mb-2">AI Output Trace</h2>
              <p className="text-sm text-secondary">Suggested Price: NPR {result.aiSuggestedPrice}</p>
              <p className="text-sm text-secondary">Confidence: {result.confidence}</p>
              {result.fallbackUsed && <p className="text-xs text-amber-300">Fallback pricing path used</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
