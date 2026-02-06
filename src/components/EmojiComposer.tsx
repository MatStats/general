import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { startRecordingAsync, stopRecordingAsync } from '@/services/audio';
import { validateEmojiSelection } from '@/utils/emoji';

const CANCEL_THRESHOLD = -50;

type Props = {
  emojis: string[];
  onSend: (payload: { uri: string; durationMs: number }) => Promise<void>;
  disabled?: boolean;
};

const EmojiComposer = ({ emojis, onSend, disabled }: Props) => {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [startY, setStartY] = useState(0);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (!recording) {
      setStatus('');
    }
  }, [recording]);

  const handlePressIn = async (event: any) => {
    if (disabled || recording) return;
    const validation = validateEmojiSelection(emojis);
    if (!validation.valid) {
      setStatus(validation.reason ?? 'Select emojis first.');
      return;
    }
    setStartY(event.nativeEvent.pageY ?? 0);
    setCanceled(false);
    const rec = await startRecordingAsync();
    recordingRef.current = rec;
    setRecording(true);
    setStatus('Recording…');
  };

  const handlePressOut = async () => {
    if (!recordingRef.current) return;
    const rec = recordingRef.current;
    recordingRef.current = null;
    setRecording(false);
    if (canceled) {
      await rec.stopAndUnloadAsync();
      setStatus('Canceled');
      return;
    }
    const result = await stopRecordingAsync(rec);
    await onSend({ uri: result.uri, durationMs: result.durationMs });
  };

  const handleTouchMove = (event: any) => {
    const delta = (event.nativeEvent.pageY ?? 0) - startY;
    if (delta < CANCEL_THRESHOLD) {
      setCanceled(true);
      setStatus('Release to cancel');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.pad, disabled && styles.disabled]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onTouchMove={handleTouchMove}
      >
        <Text style={styles.emojis}>{emojis.join(' ') || '😀'}</Text>
        <Text style={styles.hint}>
          {recording ? status : 'Press & hold to record'}
        </Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  pad: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  emojis: {
    fontSize: 32,
  },
  hint: {
    color: '#A0A0A0',
    marginTop: 8,
  },
  status: {
    color: '#666',
    marginTop: 4,
  },
});

export default EmojiComposer;
