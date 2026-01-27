import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

// Returns E.164 normalized phone or null
export const normalizePhone = (
  value?: string,
  defaultCountry?: CountryCode,
): string | null => {
  if (!value) return null;
  const parsed = parsePhoneNumberFromString(value, defaultCountry);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164
};

// Returns formatted national or international string, or the original input
export const formatPhoneForDisplay = (
  value?: string,
  defaultCountry?: CountryCode,
): string => {
  if (!value) return "";
  // If it's already E.164, parse as such
  const parsed = parsePhoneNumberFromString(value, defaultCountry);
  if (!parsed) return value;
  try {
    return parsed.formatInternational();
  } catch (e) {
    return value;
  }
};

export const isValidPhone = (
  value?: string,
  defaultCountry?: CountryCode,
): boolean => {
  return normalizePhone(value, defaultCountry) !== null;
};
