import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

const MOCK_COMMENTS = [
    {
        id: 'c1',
        user: 'Yor Forger Hot Clips',
        avatar: 'https://i.pravatar.cc/100?img=12', // placeholder
        text: 'THOSE WHO LOVE INDIA WILL LIKE MY COMMENT ❤️✌️😎',
        likes: 144,
        date: '1 de jan de 2026'
    },
    {
        id: 'c2',
        user: 'Nagi',
        avatar: 'https://i.pravatar.cc/100?img=33',
        text: "Like this if you aren't gay 🥵",
        likes: 132,
        date: '10 de jan de 2026'
    },
    {
        id: 'c3',
        user: 'i love althia sm',
        avatar: 'https://i.pravatar.cc/100?img=47',
        text: '1st season was heaven-sent, and now a season 2?! lestzzgoo!!',
        likes: 107,
        date: '1 de jan de 2026'
    },
    {
        id: 'c4',
        user: 'Fuck Jiraiya',
        avatar: 'https://i.pravatar.cc/100?img=68',
        text: 'INDIA IS THE BEST COUNTRY IN THE WORLD AND FUCK YOU HATERS',
        likes: 68,
        date: '1 de jan de 2026'
    }
];

export default function CommentsScreen() {
    const router = useRouter();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="arrow.left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>454 Comments</Text>
            </View>

            {/* List */}
            <FlatList
                data={MOCK_COMMENTS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={styles.commentBody}>
                            <Text style={styles.username}>{item.user}</Text>
                            <Text style={styles.commentText}>{item.text}</Text>
                            <View style={styles.commentFooter}>
                                <TouchableOpacity style={styles.likeButton}>
                                    <IconSymbol name="heart" size={16} color="#aaa" />
                                    <Text style={styles.likesCount}>{item.likes}</Text>
                                </TouchableOpacity>
                                <Text style={styles.dateText}>{item.date}</Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add comment..."
                        placeholderTextColor="#888"
                    />
                </View>
                <TouchableOpacity style={styles.sendButton}>
                    <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1B22', // Dark background matching the screenshot
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50, // rough safe area
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#333',
    },
    commentBody: {
        flex: 1,
    },
    username: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
    },
    commentText: {
        color: '#E0E0E0',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    commentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    likesCount: {
        color: '#ccc',
        fontSize: 12,
    },
    dateText: {
        color: '#888',
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 32, // extra bottom padding for home indicator
        backgroundColor: '#15171E',
        borderTopWidth: 1,
        borderTopColor: '#2C2D35',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
    },
    input: {
        color: '#fff',
        fontSize: 14,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
