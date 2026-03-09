type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean | null | undefined>;

const toClassNames = (value: ClassValue) => {
  if (!value) {
    return [];
  }
  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([className]) => className);
  }
  return [];
};

export const cn = (...values: ClassValue[]) => values.flatMap(toClassNames).join(" ");
