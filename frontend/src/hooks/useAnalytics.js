import { useQuery } from "@tanstack/react-query";

import {
  getSummary,
  getLatency,
  getThroughput,
  getErrors,
} from "../utils/analytics";

export const useSummary = () =>
  useQuery({
    queryKey: ["summary"],

    queryFn: getSummary,
  });

export const useLatency = () =>
  useQuery({
    queryKey: ["latency"],

    queryFn: getLatency,
  });

export const useThroughput =
  () =>
    useQuery({
      queryKey: ["throughput"],

      queryFn: getThroughput,
    });

export const useErrors = () =>
  useQuery({
    queryKey: ["errors"],

    queryFn: getErrors,
  });