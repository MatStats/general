import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clampEmojis } from '@/utils/emoji';
import { MAX_EMOJIS } from '@/utils/constants';

const emojiSet = ['😀', '🥳', '😂', '😍', '😎', '🤩', '🤯', '😭', '😡', '🤔', '👍', '👏', '🔥', '🎉', '💯', '❤️', '🫶', '🙏', '🎵', '🎤', '🫡', '🚀', '✨'];

type Props = {
  selected: string[];
  onChange: (emojis: string[]) => void;
};

const EmojiPicker = ({ selected, onChange }: Props) => {
  const toggleEmoji = (emoji: string) => {
    if (selected.includes(emoji)) {
      onChange(selected.filter((item) => item !== emoji));
      return;
    }
    const next = clampEmojis([...selected, emoji]);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pick up to {MAX_EMOJIS} emojis</Text>
      <FlatList
        data={emojiSet}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.emojiButton, selected.includes(item) && styles.selected]}
            onPress={() => toggleEmoji(item)}
          >
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#A0A0A0',
    marginBottom: 8,
  },
  emojiButton: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    marginRight: 8,
  },
  selected: {
    borderColor: '#5A4BFF',
  },
  emoji: {
    fontSize: 22,
  },
});

export default EmojiPicker;
