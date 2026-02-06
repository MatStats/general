import { validateEmojiSelection, clampEmojis } from '@/utils/emoji';

describe('emoji utils', () => {
  it('validates emoji selection count', () => {
    expect(validateEmojiSelection([]).valid).toBe(false);
    expect(validateEmojiSelection(['😀']).valid).toBe(true);
    expect(validateEmojiSelection(new Array(11).fill('😀')).valid).toBe(false);
  });

  it('clamps emoji selection', () => {
    const emojis = new Array(12).fill('😀');
    expect(clampEmojis(emojis)).toHaveLength(10);
  });
});
