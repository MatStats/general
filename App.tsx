import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase';
import AuthScreen from '@/screens/AuthScreen';
import PermissionsScreen from '@/screens/PermissionsScreen';
import ChatListScreen from '@/screens/ChatListScreen';
import ContactsScreen from '@/screens/ContactsScreen';
import ChatRoomScreen from '@/screens/ChatRoomScreen';

export type RootStackParamList = {
  Auth: undefined;
  Permissions: undefined;
  Chats: undefined;
  Contacts: undefined;
  ChatRoom: { conversationId: string; peerUid: string; peerPhone: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: '#0A0A0A' },
      headerTintColor: '#FFFFFF',
      contentStyle: { backgroundColor: '#0A0A0A' },
    }),
    []
  );

  if (checkingAuth) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Voxmoji' }} />
        ) : !permissionsGranted ? (
          <Stack.Screen name="Permissions">
            {(props) => (
              <PermissionsScreen
                {...props}
                onComplete={() => setPermissionsGranted(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Chats" component={ChatListScreen} options={{ title: 'Chats' }} />
            <Stack.Screen
              name="Contacts"
              component={ContactsScreen}
              options={{ title: 'Find Friends' }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={{ title: 'Voxmoji' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
