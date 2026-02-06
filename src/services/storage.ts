import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadAudioAsync = async (
  conversationId: string,
  messageId: string,
  fileUri: string,
  contentType = 'audio/m4a'
) => {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const path = `audio/${conversationId}/${messageId}.m4a`;
  const audioRef = ref(storage, path);
  await uploadBytes(audioRef, blob, { contentType });
  const url = await getDownloadURL(audioRef);
  return { url, path };
};
