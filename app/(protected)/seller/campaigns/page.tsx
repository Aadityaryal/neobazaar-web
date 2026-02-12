"use client";

import { useEffect, useState } from "react";
import { createCampaign, listCampaigns, updateCampaignStatus, type CampaignRecord, type CampaignStatus } from "@/lib/api/campaign";

export default function SellerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [budgetTokens, setBudgetTokens] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await listCampaigns();
      if (!response.success) {
        throw new Error("Failed to load campaigns");
      }
      setCampaigns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !startsAt || !endsAt || !budgetTokens.trim()) {
      setError("Title, dates, and budget are required");
      return;
    }

    try {
      setError("");
      const response = await createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        budgetTokens: Number(budgetTokens),
      });
      if (!response.success) {
        throw new Error("Failed to create campaign");
      }
      setCampaigns((prev) => [response.data, ...prev]);
      setTitle("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
      setBudgetTokens("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  const changeStatus = async (campaignId: string, status: CampaignStatus) => {
    try {
      setError("");
      const response = await updateCampaignStatus(campaignId, status);
      if (!response.success) {
        throw new Error("Failed to update campaign status");
      }
      setCampaigns((prev) => prev.map((item) => (item.campaignId === campaignId ? response.data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign status");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Campaigns & Promotions</h1>
            <p className="text-secondary">Create, track, and manage campaign lifecycle states.</p>
          </div>

          <form className="card grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={submit}>
            <input className="input-field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Campaign title" />
            <input className="input-field" type="number" value={budgetTokens} onChange={(event) => setBudgetTokens(event.target.value)} placeholder="Budget tokens" />
            <input className="input-field" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            <input className="input-field" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            <textarea className="input-field md:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" />
            <button className="btn-primary btn-sm md:col-span-2" type="submit">Create campaign</button>
          </form>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <div className="card empty-state">No campaigns available.</div>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.campaignId} className="card">
                  <p className="text-sm text-primary">{campaign.title}</p>
                  <p className="text-xs text-secondary">Status: {campaign.status}</p>
                  <p className="text-xs text-secondary">Budget: {campaign.budgetTokens} tokens</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["draft", "active", "paused", "ended"] as CampaignStatus[]).map((status) => (
                      <button key={status} className={status === campaign.status ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => changeStatus(campaign.campaignId, status)}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
