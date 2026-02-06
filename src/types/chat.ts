export type UserProfile = {
  uid: string;
  phoneNumber: string;
  createdAt: number;
  lastSeen: number;
  contactHash?: string;
  displayName?: string;
};

export type Conversation = {
  id: string;
  memberUids: [string, string];
  createdAt: number;
  updatedAt: number;
  lastMessage?: {
    emojis: string[];
    createdAt: number;
  };
};

export type VoiceMessage = {
  id: string;
  senderUid: string;
  emojis: string[];
  audioUrl: string;
  audioPath: string;
  durationMs: number;
  createdAt: number;
  status?: 'sent' | 'delivered' | 'played';
};
