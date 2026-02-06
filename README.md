# Voxmoji

Voxmoji is an MVP voice-first chat app where every message is a short voice clip attached to 1–10 emojis. There is **no text chat UI** anywhere in the product.

## Stack
- React Native (Expo, TypeScript)
- Firebase Auth (phone/SMS OTP)
- Firestore (metadata)
- Firebase Storage (audio files)
- Expo AV (record + playback)
- Expo Notifications (push)

## Project structure
```
src/
  components/
  screens/
  services/
  types/
  utils/
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an `.env` file from `.env.example` and fill in Firebase config values.
3. Start the app:
   ```bash
   npm run start
   ```

## Firebase configuration steps
1. Create a Firebase project.
2. Enable **Phone** authentication in Firebase Auth.
3. Create Firestore in production or test mode.
4. Enable Firebase Storage.
5. Add iOS and Android apps in Firebase console.
6. Copy config values into `.env`.
7. Apply security rules:
   - Firestore rules: `firestore.rules`
   - Storage rules: `storage.rules`

## Features implemented
- Phone OTP onboarding and profile creation in Firestore.
- Microphone + contacts permissions flow.
- Contact discovery and manual add by phone number.
- 1:1 conversations with emoji-only last preview.
- Emoji-only chat room with press-and-hold voice recording.
- Tap emojis to play audio; concurrent playback stops previous.
- Basic local caching of audio files.

## Implementation decisions
- **Audio format**: `m4a` with Expo AV preset (good compression).
- **Max duration**: 60 seconds, enforced in recording service.
- **Emoji limit**: 1–10 emojis enforced client-side and in Firestore rules.
- **Phone normalization**: `libphonenumber-js` with E.164 formatting.
- **Realtime updates**: Firestore real-time listeners for messages and chats.

## Scripts
- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run test`

## Known limitations
- Emoji picker is a lightweight horizontal picker, not a native system picker.
- Push notifications are wired for token registration only; server-side push not included.
- Playback does not support background audio yet.

## Next steps
- Add background audio playback and playback progress UI.
- Improve emoji picker with a full emoji library.
- Add delivery/play receipts and message status indicators.
- Add retry queue UI for failed uploads.
