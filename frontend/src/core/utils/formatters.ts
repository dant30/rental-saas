const numberFormatterCache = new Map<string, Intl.NumberFormat>();

const getNumberFormatter = (currency: string) => {
  if (!numberFormatterCache.has(currency)) {
    numberFormatterCache.set(
      currency,
      new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    );
  }
  return numberFormatterCache.get(currency)!;
};

export const formatCurrency = (value: number | string, currency = "KES") => {
  const numericValue = Number(value);
  return getNumberFormatter(currency).format(Number.isFinite(numericValue) ? numericValue : 0);
};

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
});

export const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return "--";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return dateFormatter.format(date);
};
