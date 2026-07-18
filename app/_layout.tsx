import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LibraryProvider } from '@/hooks/useLibrary';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Gate de autenticação: como a API exige token em TODAS as rotas (não há
 * endpoint anônimo), o app precisa estar logado antes de navegar. Redireciona
 * para /login quando não há sessão e para as tabs quando há.
 */
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inLogin = segments[0] === 'login';
    if (!isAuthenticated && !inLogin) {
      router.replace('/login');
    } else if (isAuthenticated && inLogin) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#15171E' }}>
        <ActivityIndicator size="large" color="#8E6BEB" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="anime/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="anime/[id]/comments" options={{ headerShown: false }} />
      <Stack.Screen name="anime/player/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <AuthProvider>
          <LibraryProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </LibraryProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
