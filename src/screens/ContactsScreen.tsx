import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth } from '@/services/firebase';
import { findUsersByPhoneNumbers, getOrCreateConversation } from '@/services/firestore';
import { normalizePhoneNumber } from '@/utils/phone';
import type { UserProfile } from '@/types/chat';
import type { RootStackParamList } from '@/App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ContactsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [manualNumber, setManualNumber] = useState('');

  const currentUid = firebaseAuth.currentUser?.uid ?? '';

  useEffect(() => {
    const loadContacts = async () => {
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== 'granted') return;

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const numbers = data
        .flatMap((contact) => contact.phoneNumbers ?? [])
        .map((phone) => normalizePhoneNumber(phone.number))
        .filter((num): num is string => Boolean(num));

      const uniqueNumbers = Array.from(new Set(numbers));
      const matches = await findUsersByPhoneNumbers(uniqueNumbers);
      setContacts(matches.filter((user) => user.uid !== currentUid));
    };

    loadContacts();
  }, [currentUid]);

  const openChat = async (user: UserProfile) => {
    const conversation = await getOrCreateConversation(currentUid, user.uid);
    navigation.navigate('ChatRoom', {
      conversationId: conversation.id,
      peerUid: user.uid,
      peerPhone: user.phoneNumber,
    });
  };

  const handleManualAdd = async () => {
    const normalized = normalizePhoneNumber(manualNumber);
    if (!normalized) return;
    const matches = await findUsersByPhoneNumbers([normalized]);
    if (matches[0]) {
      await openChat(matches[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.manualContainer}>
        <Text style={styles.sectionTitle}>Add by phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="+1 555 555 5555"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={manualNumber}
          onChangeText={setManualNumber}
        />
        <TouchableOpacity style={styles.button} onPress={handleManualAdd}>
          <Text style={styles.buttonText}>Start chat</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Registered contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactRow} onPress={() => openChat(item)}>
            <Text style={styles.contactText}>{item.phoneNumber}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No friends yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A0A0A',
  },
  manualContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#5A4BFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  contactText: {
    color: '#FFFFFF',
  },
  empty: {
    color: '#666',
    marginTop: 16,
  },
});

export default ContactsScreen;
