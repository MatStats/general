import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { requestOtp, confirmOtp } from '@/services/auth';
import { normalizePhoneNumber } from '@/utils/phone';
import { createUserProfile } from '@/services/firestore';
import { firebaseAuth } from '@/services/firebase';

const AuthScreen = () => {
  const recaptchaVerifier = useRef(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<Awaited<
    ReturnType<typeof requestOtp>
  > | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const normalized = normalizePhoneNumber(phoneInput);
    if (!normalized) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    try {
      setLoading(true);
      const confirmation = await requestOtp(normalized, recaptchaVerifier.current);
      setVerificationId(confirmation.verificationId);
      setConfirmationResult(confirmation);
    } catch (error) {
      Alert.alert('Error', 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationId || !confirmationResult) return;
    try {
      setLoading(true);
      const result = await confirmOtp(confirmationResult, otp);
      const user = result.user;
      await createUserProfile({
        uid: user.uid,
        phoneNumber: user.phoneNumber ?? phoneInput,
        createdAt: Date.now(),
        lastSeen: Date.now(),
      });
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseAuth.app.options}
      />
      <Text style={styles.title}>Welcome to Voxmoji</Text>
      <Text style={styles.subtitle}>Sign in with your phone number.</Text>
      <TextInput
        style={styles.input}
        placeholder="+1 555 555 5555"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        value={phoneInput}
        onChangeText={setPhoneInput}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
        <Text style={styles.buttonText}>Send Code</Text>
      </TouchableOpacity>
      {verificationId ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={loading}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A0A0A0',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5A4BFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AuthScreen;
