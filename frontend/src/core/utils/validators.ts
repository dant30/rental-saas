const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const isEmail = (value: string) => EMAIL_REGEX.test(value.trim());
export const isPhone = (value: string) => PHONE_REGEX.test(value.trim());
