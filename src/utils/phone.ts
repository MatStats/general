import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const normalizePhoneNumber = (input: string, defaultCountry?: string): string | null => {
  try {
    const phone = parsePhoneNumberFromString(input, defaultCountry);
    if (!phone || !phone.isValid()) {
      return null;
    }
    return phone.number;
  } catch (error) {
    return null;
  }
};

export const formatNational = (input: string, defaultCountry?: string): string => {
  const phone = parsePhoneNumberFromString(input, defaultCountry);
  return phone?.formatNational() ?? input;
};
