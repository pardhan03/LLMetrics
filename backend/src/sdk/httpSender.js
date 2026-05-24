import axios from "axios";

import { logger } from "../utils/logger.js";

export class HttpSender {
    constructor(url) {
        this.url = url;
    }

    async send(batch, retries = 3) {
        try {
            await axios.post(this.url, {
                logs: batch,
            });

            logger.info(
                `Sent ${batch.length} inference logs`
            );
        } catch (error) {
            const status = error.response?.status;

            // 4xx → don't retry
            if (status >= 400 && status < 500) {
                logger.error(
                    `Dropping logs due to client error ${status}`
                );

                return;
            }

            if (retries > 0) {
                const delay =
                    (4 - retries) * 1000;

                logger.warn(
                    `Retrying log batch in ${delay}ms`
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );

                return this.send(batch, retries - 1);
            }

            logger.error(
                `Failed to send logs permanently`
            );
        }
    }
}