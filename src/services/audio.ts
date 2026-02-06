import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MAX_VOICE_DURATION_SECONDS } from '@/utils/constants';

let activePlayback: Audio.Sound | null = null;

export const prepareAudioModeAsync = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  });
};

export const startRecordingAsync = async () => {
  await prepareAudioModeAsync();
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();
  return recording;
};

export const stopRecordingAsync = async (recording: Audio.Recording) => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  const status = await recording.getStatusAsync();
  if (!uri) {
    throw new Error('Recording URI missing');
  }
  if (status.durationMillis && status.durationMillis > MAX_VOICE_DURATION_SECONDS * 1000) {
    throw new Error('Recording too long');
  }
  return { uri, durationMs: status.durationMillis ?? 0 };
};

export const playAudioAsync = async (uri: string) => {
  if (activePlayback) {
    await activePlayback.stopAsync();
    await activePlayback.unloadAsync();
    activePlayback = null;
  }
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
  activePlayback = sound;
  sound.setOnPlaybackStatusUpdate((status) => {
    if ('didJustFinish' in status && status.didJustFinish) {
      sound.unloadAsync();
      if (activePlayback === sound) {
        activePlayback = null;
      }
    }
  });
};

export const cacheAudioAsync = async (remoteUrl: string, cacheKey: string) => {
  const cacheDir = `${FileSystem.cacheDirectory}voxmoji/`;
  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  const fileUri = `${cacheDir}${cacheKey}.m4a`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    return fileUri;
  }
  const result = await FileSystem.downloadAsync(remoteUrl, fileUri);
  return result.uri;
};
