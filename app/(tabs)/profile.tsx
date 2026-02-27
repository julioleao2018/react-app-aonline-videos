import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';

export default function ProfileScreen() {
    const router = useRouter();
    const { t, toggleLanguage } = useLanguage();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logo9}>A</Text>
                    </View>
                    <Text style={styles.headerTitle}>{t('profile')}</Text>
                </View>

                {/* Sync Card */}
                <View style={styles.syncCard}>
                    <Text style={styles.cardTitle}>{t('myProfile')}</Text>
                    <Text style={styles.cardDesc}>{t('signInSync')}</Text>
                    <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/login')}>
                        <Text style={styles.continueButtonText}>{t('continue')}</Text>
                    </TouchableOpacity>
                </View>

                {/* List Items */}
                <View style={styles.listSection}>
                    <TouchableOpacity style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <IconSymbol name="text.bubble" size={24} color="#fff" />
                            <Text style={styles.listItemText}>{t('subtitleSettings')}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <IconSymbol name="info.circle" size={24} color="#fff" />
                            <Text style={styles.listItemText}>{t('helpCenter')}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={toggleLanguage}>
                        <View style={styles.listItemLeft}>
                            <IconSymbol name="globe" size={24} color="#fff" />
                            <Text style={styles.listItemText}>{t('language')}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#666" />
                    </TouchableOpacity>
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
        paddingHorizontal: 20,
        backgroundColor: '#15171E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 16,
    },
    logoCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logo9: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 20,
        marginTop: -2,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    syncCard: {
        backgroundColor: '#2C2D35',
        borderRadius: 12,
        padding: 20,
        marginBottom: 32,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDesc: {
        color: '#ccc',
        fontSize: 15,
        marginBottom: 20,
    },
    continueButton: {
        backgroundColor: '#8E6BEB',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listSection: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    listItemText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
