import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
    const { t } = useLanguage();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

    const handleLogin = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        try {
            await login(email.trim(), password);
            // O gate em _layout redireciona para as tabs ao autenticar.
        } catch (err: any) {
            // 401/422 = credenciais inválidas; sem `response` = falha de conexão
            // (API inacessível / URL errada).
            const status = err?.response?.status;
            setError(status === 401 || status === 422 ? t('loginError') : t('connectionError'));
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logo9}>A</Text>
                        </View>

                        <Text style={styles.title}>{t('welcomeBack')}</Text>

                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('email')}
                                placeholderTextColor="#888"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={email}
                                onChangeText={setEmail}
                                editable={!submitting}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('password')}
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!submitting}
                                onSubmitEditing={handleLogin}
                                returnKeyType="go"
                            />

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <TouchableOpacity
                                style={[styles.passwordButton, !canSubmit && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={!canSubmit}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.passwordButtonText}>{t('signIn')}</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.signupHint}>{t('signUpHint')}</Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    safeArea: {
        flex: 1,
        backgroundColor: '#15171E',
    },
    container: {
        flex: 1,
        backgroundColor: '#15171E',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 80,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo9: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 50,
        marginTop: -4,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#2C2D35',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    passwordButton: {
        backgroundColor: '#8E6BEB',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    passwordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupHint: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
    },
});
