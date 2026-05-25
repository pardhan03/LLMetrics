import { useQuery } from "@tanstack/react-query";

import { getMessages } from "../utils/";

export const useMessages = (
  sessionId
) => {
  return useQuery({
    queryKey: [
      "messages",
      sessionId,
    ],

    queryFn: () =>
      getMessages(sessionId),

    enabled: !!sessionId,
  });
};