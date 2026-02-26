import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MyListScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logo9}>9</Text>
                        </View>
                        <Text style={styles.headerTitle}>My List</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <IconSymbol name="magnifyingglass" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Sync Card */}
                <View style={styles.syncCard}>
                    <Text style={styles.cardTitle}>My profile</Text>
                    <Text style={styles.cardDesc}>Sign in to synchronize your anime</Text>
                    <TouchableOpacity style={styles.continueButton}>
                        <Text style={styles.continueButtonText}>Continue</Text>
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
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    iconButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncCard: {
        backgroundColor: '#2C2D35',
        borderRadius: 12,
        padding: 20,
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
});
