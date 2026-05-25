import { api } from "./client";

export const getSummary =
  async () => {
    const { data } = await api.get(
      "/analytics/summary"
    );

    return data;
  };

export const getLatency =
  async () => {
    const { data } = await api.get(
      "/analytics/latency"
    );

    return data;
  };

export const getThroughput =
  async () => {
    const { data } = await api.get(
      "/analytics/throughput"
    );

    return data;
  };

export const getErrors =
  async () => {
    const { data } = await api.get(
      "/analytics/errors"
    );

    return data;
  };

export const getLogDetail =
  async (id) => {
    const { data } = await api.get(
      `/analytics/logs/${id}`
    );

    return data;
  };