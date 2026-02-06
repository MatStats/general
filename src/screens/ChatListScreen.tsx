import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth } from '@/services/firebase';
import { watchConversations } from '@/services/firestore';
import type { Conversation } from '@/types/chat';
import type { RootStackParamList } from '@/App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ChatListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const currentUid = firebaseAuth.currentUser?.uid ?? '';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
          <Text style={styles.link}>Find Friends</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = watchConversations(currentUid, setConversations);
    return () => unsubscribe();
  }, [currentUid]);

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const peerUid = item.memberUids.find((uid) => uid !== currentUid) ?? '';
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  conversationId: item.id,
                  peerUid,
                  peerPhone: 'Friend',
                })
              }
            >
              <Text style={styles.emojis}>{item.lastMessage?.emojis?.join(' ') ?? '🙂'}</Text>
              <View style={styles.badge} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No chats yet.</Text>}
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
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emojis: {
    fontSize: 22,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5A4BFF',
  },
  empty: {
    color: '#666',
    marginTop: 16,
  },
  link: {
    color: '#5A4BFF',
    fontWeight: '600',
    marginRight: 12,
  },
});

export default ChatListScreen;
