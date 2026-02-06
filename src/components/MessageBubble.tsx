import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { VoiceMessage } from '@/types/chat';

const MessageBubble = ({ message, onPlay }: { message: VoiceMessage; onPlay: () => void }) => {
  return (
    <TouchableOpacity style={styles.bubble} onPress={onPlay}>
      <Text style={styles.emojis}>{message.emojis.join(' ')}</Text>
      <View style={styles.indicator} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emojis: {
    fontSize: 22,
  },
  indicator: {
    marginTop: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5A4BFF',
    opacity: 0.6,
  },
});

export default MessageBubble;
