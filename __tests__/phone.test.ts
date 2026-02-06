import { normalizePhoneNumber } from '@/utils/phone';

describe('phone utils', () => {
  it('normalizes valid numbers', () => {
    expect(normalizePhoneNumber('+14155552671')).toBe('+14155552671');
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhoneNumber('123')).toBeNull();
  });
});
