import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <View style={styles.container}>

                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Logo */}
                    <View style={styles.logoCircle}>
                        <Text style={styles.logo9}>A</Text>
                    </View>

                    <Text style={styles.title}>{t('letYouIn')}</Text>

                    {/* Spacer */}
                    <View style={{ flex: 1 }} />

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.googleButton}>
                            <Text style={styles.googleButtonText}>G</Text>
                            <Text style={styles.googleButtonLabel}>{t('continueGoogle')}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{t('or')}</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.passwordButton}>
                            <Text style={styles.passwordButtonText}>{t('signInPassword')}</Text>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>{t('noAccount')}</Text>
                            <TouchableOpacity>
                                <Text style={styles.signupLink}>{t('signUp')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#15171E',
    },
    container: {
        flex: 1,
        backgroundColor: '#15171E',
    },
    backButton: {
        padding: 20,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    logo9: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 50,
        marginTop: -4,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    actionsContainer: {
        width: '100%',
        paddingBottom: 40,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C2D35',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 12,
    },
    googleButtonLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#fff',
        paddingHorizontal: 16,
        fontSize: 16,
    },
    passwordButton: {
        backgroundColor: '#8E6BEB',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 32,
    },
    passwordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#ccc',
        fontSize: 14,
    },
    signupLink: {
        color: '#8E6BEB',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
