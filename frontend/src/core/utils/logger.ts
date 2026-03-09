const LOG_PREFIX = "[frontend]";
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(LOG_PREFIX, ...args);
    }
  },
  warn: (...args: unknown[]) => console.warn(LOG_PREFIX, ...args),
  error: (...args: unknown[]) => console.error(LOG_PREFIX, ...args),
};
