import { logger } from "./logger";

const hasMessage = (value: unknown): value is { message: string } =>
  typeof value === "object" && value !== null && "message" in value;

const hasDetail = (value: unknown): value is { detail: string } =>
  typeof value === "object" && value !== null && "detail" in value;

export const toErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (hasMessage(error) && typeof error.message === "string") {
    return error.message;
  }
  if (hasDetail(error) && typeof error.detail === "string") {
    return error.detail;
  }
  return fallback;
};

export const handleError = (error: unknown, fallback?: string) => {
  const message = toErrorMessage(error, fallback);
  logger.error(message, error);
  return message;
};
