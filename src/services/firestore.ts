import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Conversation, UserProfile, VoiceMessage } from '@/types/chat';

const usersCollection = collection(firestore, 'users');
const conversationsCollection = collection(firestore, 'conversations');

export const createUserProfile = async (profile: UserProfile) => {
  const ref = doc(usersCollection, profile.uid);
  await setDoc(ref, profile, { merge: true });
};

export const findUsersByPhoneNumbers = async (numbers: string[]) => {
  if (!numbers.length) return [];
  const q = query(usersCollection, where('phoneNumber', 'in', numbers.slice(0, 10)));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data() as UserProfile);
};

export const getOrCreateConversation = async (uidA: string, uidB: string) => {
  const q = query(
    conversationsCollection,
    where('memberUids', 'array-contains', uidA)
  );
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find((docSnap) => {
    const data = docSnap.data() as Conversation;
    return data.memberUids.includes(uidB);
  });

  if (existing) {
    return { id: existing.id, ...(existing.data() as Conversation) } as Conversation;
  }

  const now = Date.now();
  const newConversation = {
    memberUids: [uidA, uidB],
    createdAt: now,
    updatedAt: now,
  };
  const newRef = await addDoc(conversationsCollection, newConversation);
  return { id: newRef.id, ...(newConversation as Conversation) } as Conversation;
};

export const watchConversations = (
  uid: string,
  callback: (items: Conversation[]) => void
) => {
  const q = query(conversationsCollection, where('memberUids', 'array-contains', uid));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Conversation),
    }));
    callback(items);
  });
};

export type CreateMessageDependencies = {
  firestore: Firestore;
  now: () => number;
};

export const createMessageData = (
  senderUid: string,
  emojis: string[],
  audioUrl: string,
  audioPath: string,
  durationMs: number,
  deps: CreateMessageDependencies
) => {
  return {
    senderUid,
    emojis,
    audioUrl,
    audioPath,
    durationMs,
    createdAt: deps.now(),
    status: 'sent' as const,
  };
};

export const sendVoiceMessage = async (
  conversationId: string,
  message: VoiceMessage
) => {
  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const messageDoc = doc(messagesRef, message.id);
  await setDoc(messageDoc, message);

  const conversationRef = doc(conversationsCollection, conversationId);
  await updateDoc(conversationRef, {
    updatedAt: serverTimestamp(),
    lastMessage: {
      emojis: message.emojis,
      createdAt: message.createdAt,
    },
  });
};

export const watchMessages = (
  conversationId: string,
  callback: (items: VoiceMessage[]) => void
) => {
  const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as VoiceMessage),
    }));
    callback(items);
  });
};

export const getConversationById = async (conversationId: string) => {
  const ref = doc(conversationsCollection, conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Conversation) } as Conversation;
};
