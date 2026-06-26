import { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/hooks/useLanguage';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { CommentItem } from '@/src/domain/models/Anime';

const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 50;
const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

function Avatar({ name, url, size = 40 }: { name: string; url: string | null; size?: number }) {
    if (url) {
        return <Image source={{ uri: url }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
    }
    return (
        <View style={[styles.avatar, styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={styles.avatarLetter}>{(name?.[0] ?? '?').toUpperCase()}</Text>
        </View>
    );
}

export default function CommentsScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [comments, setComments] = useState<CommentItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<CommentItem | null>(null);

    const [repliesByParent, setRepliesByParent] = useState<Record<number, CommentItem[]>>({});
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const inputRef = useRef<TextInput>(null);

    // Inicia uma resposta: marca o alvo e foca o input (abre o teclado), senão
    // parece que "nada acontece" ao tocar em Responder.
    const startReply = useCallback((comment: CommentItem) => {
        setReplyTo(comment);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            setError(false);
            setLoading(true);
            const result = await animeRepository.getComments(id);
            setComments(result.comments);
            setTotal(result.total);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Atualiza um comentário (de topo ou resposta) por id, em qualquer lista.
    const patchComment = useCallback((commentId: number, patch: Partial<CommentItem>) => {
        setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...patch } : c)));
        setRepliesByParent((prev) => {
            const next: Record<number, CommentItem[]> = {};
            for (const [pid, list] of Object.entries(prev)) {
                next[Number(pid)] = list.map((c) => (c.id === commentId ? { ...c, ...patch } : c));
            }
            return next;
        });
    }, []);

    const toggleLike = useCallback(
        async (comment: CommentItem) => {
            // Otimista
            const optimistic = {
                liked_by_me: !comment.liked_by_me,
                likes_count: comment.likes_count + (comment.liked_by_me ? -1 : 1),
            };
            patchComment(comment.id, optimistic);
            try {
                const state = await animeRepository.toggleCommentLike(comment.id);
                patchComment(comment.id, { liked_by_me: state.liked, likes_count: state.likes_count });
            } catch {
                // Reverte
                patchComment(comment.id, { liked_by_me: comment.liked_by_me, likes_count: comment.likes_count });
            }
        },
        [patchComment]
    );

    const toggleReplies = useCallback(
        async (comment: CommentItem) => {
            const isOpen = expanded[comment.id];
            setExpanded((prev) => ({ ...prev, [comment.id]: !isOpen }));
            if (!isOpen && !repliesByParent[comment.id]) {
                try {
                    const replies = await animeRepository.getReplies(comment.id);
                    setRepliesByParent((prev) => ({ ...prev, [comment.id]: replies }));
                } catch {
                    setRepliesByParent((prev) => ({ ...prev, [comment.id]: [] }));
                }
            }
        },
        [expanded, repliesByParent]
    );

    const submit = useCallback(async () => {
        const body = text.trim();
        if (!body || submitting) return;
        setSubmitting(true);
        try {
            if (replyTo) {
                const reply = await animeRepository.replyToComment(replyTo.id, body);
                // Anexa à lista de respostas (se carregada) e incrementa o contador.
                setRepliesByParent((prev) => ({
                    ...prev,
                    [replyTo.id]: [...(prev[replyTo.id] ?? []), reply],
                }));
                setExpanded((prev) => ({ ...prev, [replyTo.id]: true }));
                patchComment(replyTo.id, { replies_count: replyTo.replies_count + 1 });
                setReplyTo(null);
            } else {
                const comment = await animeRepository.postComment(id, body);
                setComments((prev) => [comment, ...prev]);
                setTotal((prev) => prev + 1);
            }
            setText('');
        } catch (err: any) {
            // Mantém o texto e mostra o motivo (ex.: limite/spam vindos do backend).
            const msg = err?.response?.data?.message || err?.response?.data?.errors?.body?.[0];
            Alert.alert('Erro', msg || t('connectionError'));
        } finally {
            setSubmitting(false);
        }
    }, [text, submitting, replyTo, id, patchComment, t]);

    const renderComment = (item: CommentItem, isReply = false) => (
        <View style={[styles.commentItem, isReply && styles.replyItem]}>
            <Avatar name={item.author.name} url={item.author.avatar_url} size={isReply ? 32 : 40} />
            <View style={styles.commentBody}>
                <View style={styles.usernameRow}>
                    <Text style={styles.username}>{item.author.name}</Text>
                    {item.author.is_admin && (
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.commentText}>{item.body}</Text>
                <View style={styles.commentFooter}>
                    <TouchableOpacity style={styles.likeButton} onPress={() => toggleLike(item)}>
                        <IconSymbol
                            name={item.liked_by_me ? 'heart.fill' : 'heart'}
                            size={16}
                            color={item.liked_by_me ? '#8E6BEB' : '#aaa'}
                        />
                        <Text style={[styles.likesCount, item.liked_by_me && { color: '#8E6BEB' }]}>{item.likes_count}</Text>
                    </TouchableOpacity>
                    {!isReply && (
                        <TouchableOpacity onPress={() => startReply(item)}>
                            <Text style={styles.replyBtn}>{t('reply')}</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>

                {!isReply && item.replies_count > 0 && (
                    <TouchableOpacity onPress={() => toggleReplies(item)} style={styles.repliesToggle}>
                        <Text style={styles.repliesToggleText}>
                            {expanded[item.id] ? t('hideReplies') : `${t('viewReplies')} (${item.replies_count})`}
                        </Text>
                    </TouchableOpacity>
                )}

                {!isReply && expanded[item.id] && (
                    <View style={styles.repliesContainer}>
                        {(repliesByParent[item.id] ?? []).map((r) => (
                            <View key={r.id}>{renderComment(r, true)}</View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: TOP_INSET + 8 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="arrow.left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {total} {t('comments')}
                </Text>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#8E6BEB" />
                </View>
            ) : error ? (
                <TouchableOpacity style={styles.centered} onPress={load}>
                    <Text style={styles.errorText}>{t('loadError')}</Text>
                </TouchableOpacity>
            ) : (
                <FlatList
                    data={comments}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    extraData={{ expanded, repliesByParent }}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('noComments')}</Text>}
                    renderItem={({ item }) => renderComment(item)}
                />
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
                {replyTo && (
                    <View style={styles.replyingBanner}>
                        <Text style={styles.replyingText} numberOfLines={1}>
                            {t('replyingTo')} {replyTo.author.name}
                        </Text>
                        <TouchableOpacity onPress={() => setReplyTo(null)}>
                            <Text style={styles.replyingCancel}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder={replyTo ? t('writeReply') : t('addComment')}
                            placeholderTextColor="#888"
                            value={text}
                            onChangeText={setText}
                            multiline
                            editable={!submitting}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendButton, (!text.trim() || submitting) && styles.sendButtonDisabled]}
                        onPress={submit}
                        disabled={!text.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1B22' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#ff6b6b' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    commentItem: { flexDirection: 'row', marginBottom: 24 },
    replyItem: { marginBottom: 16, marginTop: 16 },
    avatar: { marginRight: 12, backgroundColor: '#333' },
    avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#8E6BEB' },
    avatarLetter: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    commentBody: { flex: 1 },
    usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    username: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    adminBadge: { backgroundColor: '#8E6BEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    adminBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    commentText: { color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    commentFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    likeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    likesCount: { color: '#ccc', fontSize: 12 },
    replyBtn: { color: '#8E6BEB', fontSize: 12, fontWeight: 'bold' },
    dateText: { color: '#888', fontSize: 12 },
    repliesToggle: { marginTop: 12 },
    repliesToggleText: { color: '#8E6BEB', fontSize: 13, fontWeight: '600' },
    repliesContainer: { marginTop: 4, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#2C2D35' },
    inputContainer: {
        padding: 16,
        paddingBottom: 28,
        backgroundColor: '#15171E',
        borderTopWidth: 1,
        borderTopColor: '#2C2D35',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    replyingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    replyingText: { color: '#aaa', fontSize: 13, flex: 1 },
    replyingCancel: { color: '#8E6BEB', fontSize: 13, fontWeight: 'bold', marginLeft: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        maxHeight: 120,
    },
    input: { color: '#fff', fontSize: 14 },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8E6BEB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: { opacity: 0.5 },
});
