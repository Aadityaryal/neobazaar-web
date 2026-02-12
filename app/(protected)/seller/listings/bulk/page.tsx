"use client";

import { useState } from "react";
import { bulkImportListings } from "@/lib/api/seller";

export default function SellerBulkUploadPage() {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      [
        {
          title: "Sample Item",
          description: "Sample description",
          category: "general",
          location: "Kathmandu",
          mode: "buy_now",
          priceListed: 100,
          images: [],
        },
      ],
      null,
      2
    )
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError("");
      setMessage("");
      const parsed = JSON.parse(jsonInput) as Array<{
        title: string;
        description: string;
        category: string;
        location: string;
        mode: "buy_now" | "auction" | "donate";
        priceListed: number;
        images?: string[];
      }>;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Provide a non-empty JSON array");
      }

      const response = await bulkImportListings(parsed);
      if (!response.success) {
        throw new Error("Bulk upload failed");
      }

      setMessage(`Created ${response.data.createdCount} listings; rejected ${response.data.rejectedCount}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk upload failed");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="card">
            <h1 className="page-title">Bulk Upload</h1>
            <p className="text-secondary">Upload and validate multiple listings in one operation.</p>
          </div>

          <form className="card space-y-3" onSubmit={submit}>
            <textarea className="input-field min-h-60" value={jsonInput} onChange={(event) => setJsonInput(event.target.value)} />
            <button className="btn-primary btn-sm" type="submit">Import listings</button>
          </form>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
        </div>
      </div>
    </div>
  );
}
