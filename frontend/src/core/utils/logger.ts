export const logger = {
  info: (...args: unknown[]) => console.info("[frontend]", ...args),
  warn: (...args: unknown[]) => console.warn("[frontend]", ...args),
  error: (...args: unknown[]) => console.error("[frontend]", ...args),
};
