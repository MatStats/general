import { createMessageData } from '@/services/firestore';

describe('message creation', () => {
  it('creates message payload with timestamp', () => {
    const data = createMessageData(
      'user-1',
      ['😀'],
      'https://example.com/audio.m4a',
      'audio/convo/message.m4a',
      1200,
      { firestore: {} as any, now: () => 1234 }
    );

    expect(data.senderUid).toBe('user-1');
    expect(data.emojis).toEqual(['😀']);
    expect(data.durationMs).toBe(1200);
    expect(data.createdAt).toBe(1234);
  });
});
