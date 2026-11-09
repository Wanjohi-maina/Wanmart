import { createContext, useContext } from "react";

export type ReviewCounts = {
  needsDecision: number;
  refundPending: number;
  total: number;
};

export type ReviewCountValue = {
  counts: ReviewCounts | null;
  refresh: () => void;
};

export const ReviewCountContext = createContext<ReviewCountValue>({
  counts: null,
  refresh: () => {},
});

export function useReviewCount() {
  return useContext(ReviewCountContext);
}