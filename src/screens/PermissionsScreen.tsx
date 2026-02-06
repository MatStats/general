import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import * as Contacts from 'expo-contacts';

type Props = {
  onComplete: () => void;
};

const PermissionsScreen = ({ onComplete }: Props) => {
  const [microphoneGranted, setMicrophoneGranted] = useState(false);
  const [contactsGranted, setContactsGranted] = useState(false);

  const requestMicrophone = async () => {
    const response = await Audio.requestPermissionsAsync();
    setMicrophoneGranted(response.granted);
  };

  const requestContacts = async () => {
    const response = await Contacts.requestPermissionsAsync();
    setContactsGranted(response.granted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.subtitle}>We need your microphone to send voice emojis.</Text>
      <TouchableOpacity style={styles.button} onPress={requestMicrophone}>
        <Text style={styles.buttonText}>
          {microphoneGranted ? 'Microphone Granted' : 'Grant Microphone'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Find friends by syncing contacts (optional).</Text>
      <TouchableOpacity style={styles.button} onPress={requestContacts}>
        <Text style={styles.buttonText}>
          {contactsGranted ? 'Contacts Granted' : 'Grant Contacts'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.primary]}
        onPress={onComplete}
        disabled={!microphoneGranted}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0A0A0A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#A0A0A0',
    marginBottom: 12,
  },
  button: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#5A4BFF',
    borderColor: '#5A4BFF',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default PermissionsScreen;
