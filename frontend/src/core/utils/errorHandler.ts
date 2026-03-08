import { logger } from "./logger";

export const toErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
};

export const handleError = (error: unknown, fallback?: string) => {
  const message = toErrorMessage(error, fallback);
  logger.error(message, error);
  return message;
};
