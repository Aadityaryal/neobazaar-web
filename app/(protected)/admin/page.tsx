"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { getMe } from "@/lib/api/auth";
import { getAdminExportUrl, getAdminFlags, getAdminHeatmap, resolveAdminFlag, undoAdminModeration } from "@/lib/api/admin";

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

type HeatPoint = { location: string; lat: number; lng: number; count: number };
type AdminFlag = {
  flagId: string;
  productId: string;
  sellerId: string;
  reason: "duplicate_image" | "transaction_dispute";
  detectedAt: string;
  resolved: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [flags, setFlags] = useState<AdminFlag[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [latestActionId, setLatestActionId] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await getMe();
        if (!me.success || me.data?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        const response = await getAdminHeatmap();
        if (response.success) {
          setPoints(response.data);
        }

        const flagsResponse = await getAdminFlags();
        if (flagsResponse.success) {
          setFlags(flagsResponse.data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load admin data");
      }
    };

    bootstrap();
  }, [router]);

  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return [27.7172, 85.3240];
    return [points[0].lat, points[0].lng];
  }, [points]);

  const resolveFlag = async (flagId: string) => {
    try {
      const response = await resolveAdminFlag(flagId);
      if (!response.success) {
        throw new Error(response.message || "Failed to resolve flag");
      }
      const moderationActionId = response?.meta?.moderationActionId;
      if (typeof moderationActionId === "string" && moderationActionId.trim()) {
        setLatestActionId(moderationActionId);
      }
      setFlags((prev) => prev.filter((item) => item.flagId !== flagId));
      setNotice("Flag resolved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resolve flag");
    }
  };

  const undoLatestModeration = async () => {
    if (!latestActionId) {
      setError("No moderation action available to undo yet. Resolve a flag first.");
      return;
    }
    try {
      setError("");
      const response = await undoAdminModeration(latestActionId);
      if (!response.success) {
        throw new Error(response.message || "Failed to undo moderation action");
      }
      setLatestActionId("");
      setNotice("Moderation action undone.");
      const flagsResponse = await getAdminFlags();
      if (flagsResponse.success) {
        setFlags(flagsResponse.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to undo moderation action");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="page-title">Admin Dashboard</h1>
        {notice && <div className="alert-success">{notice}</div>}
        {error && <div className="alert-error">{error}</div>}

        <div className="card">
          <h2 className="section-title mb-3">Admin Navigation</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users" className="btn-secondary btn-sm">Users</Link>
            <Link href="/admin/disputes" className="btn-secondary btn-sm">Disputes</Link>
            <Link href="/admin/audit" className="btn-secondary btn-sm">Audit Logs</Link>
            <Link href="/admin/exports" className="btn-secondary btn-sm">Export Center</Link>
            <Link href="/admin/campaigns" className="btn-secondary btn-sm">Campaigns</Link>
            <Link href="/admin/risk" className="btn-secondary btn-sm">Risk Scoring</Link>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-3">Heatmap View</h2>
          <div className="h-[380px] overflow-hidden rounded-xl border border-dark-border md:h-[420px]">
            <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {points.map((point) => (
                <CircleMarker
                  key={`${point.location}-${point.lat}-${point.lng}`}
                  center={[point.lat, point.lng]}
                  pathOptions={{ color: "red" }}
                  radius={Math.max(4, point.count * 2)}
                >
                  <Popup>{point.location}: {point.count}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="card flex flex-wrap items-center gap-3">
          <a className="btn-primary btn-sm" href={getAdminExportUrl("csv")}>Export CSV</a>
          <a className="btn-secondary btn-sm" href={getAdminExportUrl("pdf")}>Export PDF</a>
          <button className="btn-secondary btn-sm" onClick={undoLatestModeration}>Undo Last Moderation</button>
        </div>

        <div className="card space-y-3">
          <h2 className="section-title">Unresolved Flags</h2>
          {flags.map((flag) => (
            <div key={flag.flagId} className="rounded-lg border border-dark-border p-3">
              <p className="text-sm text-primary">Reason: {flag.reason}</p>
              <p className="text-xs text-secondary">Product: {flag.productId}</p>
              <p className="text-xs text-secondary">Seller: {flag.sellerId}</p>
              <p className="text-xs text-muted">Detected: {new Date(flag.detectedAt).toLocaleString()}</p>
              <button className="btn-secondary btn-sm mt-2" onClick={() => resolveFlag(flag.flagId)}>
                Resolve
              </button>
            </div>
          ))}
          {flags.length === 0 && <p className="empty-state">No unresolved flags.</p>}
        </div>
      </div>
      </div>
    </div>
  );
}
