"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { listOrders } from "@/lib/api/order";
import { createReview, listProductReviews, type ReviewItem } from "@/lib/api/review";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type ReviewableOrder = {
  orderId: string;
  transactionId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: string;
};

export default function BuyerReviewsRatingsPage() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const contextQuery = useQuery<{
    myUserId: string;
    reviewableOrders: ReviewableOrder[];
    latestProductId?: string;
  }>({
    queryKey: ["dashboard", "reviews", "context"],
    queryFn: async () => {
      const [meResponse, ordersResponse] = await Promise.all([getMe(), listOrders()]);

      if (!meResponse.success) {
        throw new Error(meResponse.message || "Failed to load profile");
      }
      if (!ordersResponse.success) {
        throw new Error(ordersResponse.message || "Failed to load orders");
      }

      const meUserId = meResponse.data.userId as string;
      const orders = (ordersResponse.data ?? []) as ReviewableOrder[];
      const reviewableOrders = orders.filter(
        (order) => order.status === "completed" && order.buyerId === meUserId,
      );

      return {
        myUserId: meUserId,
        reviewableOrders,
        latestProductId: reviewableOrders[0]?.productId,
      };
    },
  });

  const selectedOrder = useMemo(
    () => contextQuery.data?.reviewableOrders.find((order) => order.orderId === selectedOrderId),
    [contextQuery.data?.reviewableOrders, selectedOrderId],
  );

  const fallbackProductId = contextQuery.data?.latestProductId;
  const activeProductId = selectedOrder?.productId ?? fallbackProductId;

  const reviewsQuery = useQuery<ReviewItem[]>({
    queryKey: ["dashboard", "reviews", "product", activeProductId],
    enabled: Boolean(activeProductId),
    queryFn: async () => {
      const response = await listProductReviews(activeProductId as string);
      if (!response.success) {
        throw new Error(response.message || "Failed to load product reviews");
      }
      return response.data ?? [];
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder) {
        throw new Error("Select an eligible completed order first");
      }
      const response = await createReview({
        transactionId: selectedOrder.transactionId,
        productId: selectedOrder.productId,
        revieweeId: selectedOrder.sellerId,
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to submit review");
      }
      return response.data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reviews", "product", activeProductId] });
    },
  });

  return (
    <DashboardPageScaffold
      title="Reviews + Ratings"
      subtitle="Submit and manage product/seller feedback after transactions."
      routeLabel="Dashboard / Reviews"
      actions={
        <>
          <Link href="/dashboard/orders" className="btn-secondary btn-sm">Eligible orders</Link>
          <Link href="/dashboard/rewards" className="btn-primary btn-sm">Earn rewards</Link>
        </>
      }
    >
      {contextQuery.isLoading && (
        <DashboardSurface className="p-4">
          <div className="skeleton h-5 w-1/3 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-4/5" />
        </DashboardSurface>
      )}

      {contextQuery.isError && (
        <DashboardStatus tone="error">
          {contextQuery.error instanceof Error ? contextQuery.error.message : "Failed to load review context"}
        </DashboardStatus>
      )}

      {!contextQuery.isLoading && !contextQuery.isError && (
        <div className="space-y-4">
          <DashboardSurface className="p-4 space-y-3">
            <p className="text-sm font-semibold text-white">Create Review</p>

            {contextQuery.data?.reviewableOrders.length ? (
              <>
                <select
                  className="input-field"
                  value={selectedOrderId}
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                >
                  <option value="">Select completed order</option>
                  {contextQuery.data.reviewableOrders.map((order) => (
                    <option key={order.orderId} value={order.orderId}>
                      #{order.orderId.slice(0, 8)} · Product {order.productId}
                    </option>
                  ))}
                </select>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-sm text-white/80">
                    Rating (1-5)
                    <input
                      className="input-field mt-1"
                      type="number"
                      min={1}
                      max={5}
                      value={rating}
                      onChange={(event) => setRating(Math.max(1, Math.min(5, Number(event.target.value) || 1)))}
                    />
                  </label>
                </div>

                <textarea
                  className="input-field min-h-24"
                  placeholder="Share your experience (optional)"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />

                <button
                  type="button"
                  className="btn-primary btn-sm"
                  disabled={submitReviewMutation.isPending}
                  onClick={() => submitReviewMutation.mutate()}
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit review"}
                </button>

                {submitReviewMutation.isError && (
                  <DashboardStatus tone="error">
                    {submitReviewMutation.error instanceof Error ? submitReviewMutation.error.message : "Failed to submit review"}
                  </DashboardStatus>
                )}
                {submitReviewMutation.isSuccess && (
                  <DashboardStatus tone="success">Review submitted successfully.</DashboardStatus>
                )}
              </>
            ) : (
              <p className="text-sm text-white/65">No completed buyer orders are eligible for review yet.</p>
            )}
          </DashboardSurface>

          <DashboardSurface className="p-4 space-y-3">
            <p className="text-sm font-semibold text-white">Recent Product Reviews</p>

            {reviewsQuery.isLoading && (
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
            )}

            {reviewsQuery.isError && (
              <DashboardStatus tone="error">
                {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Failed to load reviews"}
              </DashboardStatus>
            )}

            {!reviewsQuery.isLoading && !reviewsQuery.isError && (reviewsQuery.data?.length ?? 0) === 0 && (
              <p className="text-sm text-white/65">No visible reviews for the selected product yet.</p>
            )}

            {(reviewsQuery.data ?? []).map((review) => (
              <div key={review.reviewId} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">
                  {"★".repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}
                  <span className="ml-2 text-white/80">{review.rating}/5</span>
                </p>
                {review.comment && <p className="mt-1 text-sm text-white/75">{review.comment}</p>}
                <p className="mt-1 text-xs text-white/50">Review #{review.reviewId.slice(0, 8)}</p>
              </div>
            ))}
          </DashboardSurface>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
