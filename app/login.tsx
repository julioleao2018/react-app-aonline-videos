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
    ScrollView,
} from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth, SocialProvider } from '@/hooks/useAuth';

type Mode = 'login' | 'register';

export default function LoginScreen() {
    const { t } = useLanguage();
    const { login, register, loginWithProvider } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isRegister = mode === 'register';
    const busy = submitting || socialLoading !== null;

    const canSubmit =
        email.trim().length > 0 &&
        password.length > 0 &&
        (!isRegister || (name.trim().length > 0 && passwordConfirmation.length > 0)) &&
        !busy;

    const switchMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setPassword('');
        setPasswordConfirmation('');
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setError(null);

        if (isRegister && password !== passwordConfirmation) {
            setError(t('passwordsDontMatch'));
            return;
        }

        setSubmitting(true);
        try {
            if (isRegister) {
                await register(name.trim(), email.trim(), password, passwordConfirmation);
            } else {
                await login(email.trim(), password);
            }
            // O gate em _layout redireciona para as tabs ao autenticar.
        } catch (err: any) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data?.errors?.email?.[0];
            if (isRegister) {
                setError(serverMsg || t('registerError'));
            } else {
                setError(status === 401 || status === 422 ? t('loginError') : t('connectionError'));
            }
            setSubmitting(false);
        }
    };

    const handleSocial = async (provider: SocialProvider) => {
        if (busy) return;
        setError(null);
        setSocialLoading(provider);
        try {
            await loginWithProvider(provider);
        } catch (err: any) {
            if (err?.message !== 'cancelled') {
                setError(t('socialError'));
            }
        } finally {
            setSocialLoading(null);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.logoCircle}>
                        <Text style={styles.logo9}>A</Text>
                    </View>

                    <Text style={styles.title}>{isRegister ? t('createAccount') : t('welcomeBack')}</Text>

                    {/* Botões sociais */}
                    <TouchableOpacity
                        style={[styles.socialButton, busy && styles.disabled]}
                        onPress={() => handleSocial('google')}
                        disabled={busy}
                    >
                        {socialLoading === 'google' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.googleG}>G</Text>
                                <Text style={styles.socialLabel}>{t('continueGoogle')}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, styles.discordButton, busy && styles.disabled]}
                        onPress={() => handleSocial('discord')}
                        disabled={busy}
                    >
                        {socialLoading === 'discord' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.socialLabel}>{t('continueDiscord')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>{t('or')}</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Formulário */}
                    {isRegister && (
                        <TextInput
                            style={styles.input}
                            placeholder={t('name')}
                            placeholderTextColor="#888"
                            value={name}
                            onChangeText={setName}
                            editable={!busy}
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder={t('email')}
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={setEmail}
                        editable={!busy}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('password')}
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        editable={!busy}
                    />
                    {isRegister && (
                        <TextInput
                            style={styles.input}
                            placeholder={t('confirmPassword')}
                            placeholderTextColor="#888"
                            secureTextEntry
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            editable={!busy}
                        />
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.primaryButton, !canSubmit && styles.disabled]}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>{isRegister ? t('createAccount') : t('signIn')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{isRegister ? t('haveAccount') : t('noAccount')}</Text>
                        <TouchableOpacity onPress={() => switchMode(isRegister ? 'login' : 'register')}>
                            <Text style={styles.switchLink}>{isRegister ? t('signIn') : t('signUp')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: '#15171E' },
    content: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo9: { color: '#fff', fontWeight: '900', fontSize: 44, marginTop: -4 },
    title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 28 },
    socialButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C2D35',
        paddingVertical: 15,
        borderRadius: 16,
        marginBottom: 12,
        minHeight: 52,
        gap: 12,
    },
    discordButton: { backgroundColor: '#5865F2' },
    googleG: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    socialLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 18 },
    divider: { flex: 1, height: 1, backgroundColor: '#333' },
    dividerText: { color: '#ccc', paddingHorizontal: 16, fontSize: 14 },
    input: {
        width: '100%',
        backgroundColor: '#2C2D35',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 15,
        color: '#fff',
        fontSize: 16,
        marginBottom: 14,
    },
    errorText: { color: '#ff6b6b', fontSize: 14, marginBottom: 12, textAlign: 'center' },
    primaryButton: {
        width: '100%',
        backgroundColor: '#8E6BEB',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginTop: 4,
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.5 },
    switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 6 },
    switchText: { color: '#ccc', fontSize: 14 },
    switchLink: { color: '#8E6BEB', fontSize: 14, fontWeight: 'bold' },
});
