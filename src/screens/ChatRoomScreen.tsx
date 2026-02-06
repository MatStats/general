import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { firebaseAuth } from '@/services/firebase';
import { sendVoiceMessage, watchMessages } from '@/services/firestore';
import { uploadAudioAsync } from '@/services/storage';
import { cacheAudioAsync, playAudioAsync } from '@/services/audio';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiComposer from '@/components/EmojiComposer';
import MessageBubble from '@/components/MessageBubble';
import type { RootStackParamList } from '@/App';
import type { VoiceMessage } from '@/types/chat';
import { validateEmojiSelection } from '@/utils/emoji';

const ChatRoomScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatRoom'>>();
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchMessages(conversationId, (items) => {
      setMessages(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const handleSendRecording = async ({ uri, durationMs }: { uri: string; durationMs: number }) => {
    const validation = validateEmojiSelection(emojis);
    if (!validation.valid) {
      return;
    }
    setSending(true);
    try {
      const messageId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { url, path } = await uploadAudioAsync(conversationId, messageId, uri);
      const senderUid = firebaseAuth.currentUser?.uid ?? '';
      const message: VoiceMessage = {
        id: messageId,
        senderUid,
        emojis,
        audioUrl: url,
        audioPath: path,
        durationMs,
        createdAt: Date.now(),
        status: 'sent',
      };
      await sendVoiceMessage(conversationId, message);
      setEmojis([]);
    } finally {
      setSending(false);
    }
  };

  const handlePlay = async (message: VoiceMessage) => {
    const cachedUri = await cacheAudioAsync(message.audioUrl, message.id);
    await playAudioAsync(cachedUri);
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color="#5A4BFF" /> : null}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} onPlay={() => handlePlay(item)} />}
        contentContainerStyle={styles.list}
        inverted
      />
      <View style={styles.composer}>
        <EmojiPicker selected={emojis} onChange={setEmojis} />
        <EmojiComposer emojis={emojis} onSend={handleSendRecording} disabled={sending} />
        {sending ? <Text style={styles.sending}>Sending…</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  list: {
    padding: 16,
  },
  composer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  sending: {
    marginTop: 8,
    color: '#666',
  },
});

export default ChatRoomScreen;
