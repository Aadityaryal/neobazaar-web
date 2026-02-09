"use client";

import { useEffect, useMemo, useState } from "react";
import { createAdminExportJob, getAdminExportJob, getAdminExportUrl } from "@/lib/api/admin";

type ExportJob = {
  exportJobId: string;
  format: "csv" | "pdf";
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  artifactPath?: string;
  errorMessage?: string;
};

export default function AdminExportReportingCenterPage() {
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<ExportJob | null>(null);
  const [error, setError] = useState("");
  const [pollError, setPollError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loadingJob, setLoadingJob] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const artifactUrl = useMemo(() => {
    if (!job?.artifactPath) {
      return "";
    }
    if (job.artifactPath.startsWith("http://") || job.artifactPath.startsWith("https://")) {
      return job.artifactPath;
    }
    return `${apiBaseUrl}${job.artifactPath}`;
  }, [apiBaseUrl, job?.artifactPath]);

  const createJob = async (format: "csv" | "pdf") => {
    try {
      setError("");
      setPollError("");
      setActionMessage("");
      const response = await createAdminExportJob(format);
      if (!response.success) {
        throw new Error(response.message || "Failed to create export job");
      }
      const nextId = response.data.exportJobId as string;
      setJobId(nextId);
      setJob(response.data as ExportJob);
      setLastUpdatedAt(new Date().toISOString());
      setActionMessage(`Created ${format.toUpperCase()} export job ${nextId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create export job");
    }
  };

  const fetchJob = async (inputJobId = jobId, silent = false) => {
    const normalizedJobId = inputJobId.trim();
    if (!normalizedJobId) {
      setError("Export job ID is required");
      return;
    }

    try {
      if (!silent) {
        setError("");
        setPollError("");
        setActionMessage("");
        setLoadingJob(true);
      }
      const response = await getAdminExportJob(normalizedJobId);
      if (!response.success) {
        throw new Error(response.message || "Failed to load export job");
      }
      setJob(response.data as ExportJob);
      setLastUpdatedAt(new Date().toISOString());
      if (silent) {
        setPollError("");
      }
      if (!silent) {
        setActionMessage(`Loaded export job ${normalizedJobId}`);
      }
    } catch (err) {
      if (silent) {
        setPollError(err instanceof Error ? err.message : "Auto-poll failed");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load export job");
      }
    } finally {
      if (!silent) {
        setLoadingJob(false);
      }
    }
  };

  useEffect(() => {
    if (!autoPoll || !jobId.trim()) {
      return;
    }

    if (job && (job.status === "completed" || job.status === "failed")) {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchJob(jobId, true);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [autoPoll, job, jobId]);

  const statusBadgeClass =
    job?.status === "completed"
      ? "text-emerald-300"
      : job?.status === "failed"
        ? "text-red-300"
        : job?.status === "processing"
          ? "text-cyan-300"
          : "text-yellow-300";

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card space-y-2">
            <h1 className="page-title">Export/Reporting Center</h1>
            <p className="text-secondary">Manage asynchronous exports and reporting artifacts.</p>
            <div className="flex flex-wrap gap-2">
              <a className="btn-secondary btn-sm" href={getAdminExportUrl("csv")}>Download CSV now</a>
              <a className="btn-secondary btn-sm" href={getAdminExportUrl("pdf")}>Download PDF now</a>
              <button className="btn-primary btn-sm" onClick={() => createJob("csv")}>Create CSV export job</button>
              <button className="btn-primary btn-sm" onClick={() => createJob("pdf")}>Create PDF export job</button>
            </div>
          </div>

          <div className="card flex flex-wrap items-center gap-2">
            <input className="input-field max-w-lg" value={jobId} onChange={(event) => setJobId(event.target.value)} placeholder="Export job ID" />
            <button className="btn-secondary btn-sm" onClick={() => void fetchJob()} disabled={loadingJob}>{loadingJob ? "Loading..." : "Fetch job status"}</button>
            <button className="btn-secondary btn-sm" onClick={() => setAutoPoll((previous) => !previous)}>
              {autoPoll ? "Disable auto-poll" : "Enable auto-poll"}
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {pollError && <div className="alert-error">Auto-poll warning: {pollError}</div>}
          {actionMessage && <div className="alert-success">{actionMessage}</div>}

          {job && (
            <div className="card space-y-1">
              <p className="text-sm text-primary">Job: {job.exportJobId}</p>
              <p className="text-sm text-secondary">Format: {job.format}</p>
              <p className="text-sm text-secondary">Status: <span className={`rounded-full border border-dark-border px-2 py-0.5 text-xs ${statusBadgeClass}`}>{job.status}</span></p>
              <p className="text-sm text-secondary">Progress: {job.progress}%</p>
              <div className="h-2 w-full overflow-hidden rounded-full border border-dark-border bg-dark-card">
                <div className="h-full bg-primary-500 transition-all" style={{ width: `${Math.min(Math.max(job.progress, 0), 100)}%` }} />
              </div>
              <p className="text-xs text-muted">
                Auto-poll: {autoPoll ? "On" : "Off"} (3s interval){lastUpdatedAt ? ` · Last refresh: ${new Date(lastUpdatedAt).toLocaleTimeString()}` : ""}
              </p>
              {job.artifactPath && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <p className="text-xs text-secondary">Artifact: {job.artifactPath}</p>
                  <a className="btn-secondary btn-sm" href={artifactUrl} target="_blank" rel="noreferrer">Open artifact</a>
                </div>
              )}
              {job.errorMessage && <p className="text-xs text-red-300">Error: {job.errorMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
