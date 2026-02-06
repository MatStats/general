import { MAX_EMOJIS, MIN_EMOJIS } from './constants';

const emojiRegex = /\p{Extended_Pictographic}/u;

export const isSingleEmoji = (value: string): boolean => {
  if (!value) return false;
  return emojiRegex.test(value);
};

export const validateEmojiSelection = (emojis: string[]): { valid: boolean; reason?: string } => {
  if (emojis.length < MIN_EMOJIS) {
    return { valid: false, reason: 'Select at least one emoji.' };
  }
  if (emojis.length > MAX_EMOJIS) {
    return { valid: false, reason: `You can select up to ${MAX_EMOJIS} emojis.` };
  }
  if (!emojis.every(isSingleEmoji)) {
    return { valid: false, reason: 'Invalid emoji selection.' };
  }
  return { valid: true };
};

export const clampEmojis = (emojis: string[]): string[] => emojis.slice(0, MAX_EMOJIS);
