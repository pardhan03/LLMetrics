import { useQuery } from "@tanstack/react-query";

import {  } from "../utils/chat";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],

    queryFn: getSessions,
  });
};