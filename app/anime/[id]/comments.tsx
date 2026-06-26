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

interface ReplyTarget {
    target: CommentItem;
    rootId: number;
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
    const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

    const [repliesByRoot, setRepliesByRoot] = useState<Record<number, CommentItem[]>>({});
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const inputRef = useRef<TextInput>(null);

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

    // Atualiza um comentário (raiz ou resposta) por id em qualquer lista.
    const patchComment = useCallback((commentId: number, patch: Partial<CommentItem>) => {
        setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...patch } : c)));
        setRepliesByRoot((prev) => {
            const next: Record<number, CommentItem[]> = {};
            for (const [rid, list] of Object.entries(prev)) {
                next[Number(rid)] = list.map((c) => (c.id === commentId ? { ...c, ...patch } : c));
            }
            return next;
        });
    }, []);

    const toggleLike = useCallback(
        async (comment: CommentItem) => {
            const optimistic = {
                liked_by_me: !comment.liked_by_me,
                likes_count: comment.likes_count + (comment.liked_by_me ? -1 : 1),
            };
            patchComment(comment.id, optimistic);
            try {
                const state = await animeRepository.toggleCommentLike(comment.id);
                patchComment(comment.id, { liked_by_me: state.liked, likes_count: state.likes_count });
            } catch {
                patchComment(comment.id, { liked_by_me: comment.liked_by_me, likes_count: comment.likes_count });
            }
        },
        [patchComment]
    );

    const loadReplies = useCallback(async (rootId: number) => {
        try {
            const replies = await animeRepository.getReplies(rootId);
            setRepliesByRoot((prev) => ({ ...prev, [rootId]: replies }));
            patchComment(rootId, { replies_count: replies.length });
        } catch {
            setRepliesByRoot((prev) => ({ ...prev, [rootId]: [] }));
        }
    }, [patchComment]);

    const toggleReplies = useCallback(
        (rootId: number) => {
            const isOpen = expanded[rootId];
            setExpanded((prev) => ({ ...prev, [rootId]: !isOpen }));
            if (!isOpen && !repliesByRoot[rootId]) {
                loadReplies(rootId);
            }
        },
        [expanded, repliesByRoot, loadReplies]
    );

    const startReply = useCallback((target: CommentItem, rootId: number) => {
        setReplyTo({ target, rootId });
        requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    const submit = useCallback(async () => {
        const body = text.trim();
        if (!body || submitting) return;
        setSubmitting(true);
        try {
            if (replyTo) {
                await animeRepository.replyToComment(replyTo.target.id, body);
                // Recarrega o thread achatado da raiz (cobre resposta-de-resposta).
                await loadReplies(replyTo.rootId);
                setExpanded((prev) => ({ ...prev, [replyTo.rootId]: true }));
                setTotal((prev) => prev + 1);
                setReplyTo(null);
            } else {
                const comment = await animeRepository.postComment(id, body);
                setComments((prev) => [comment, ...prev]);
                setTotal((prev) => prev + 1);
            }
            setText('');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.errors?.body?.[0];
            Alert.alert('Erro', msg || t('connectionError'));
        } finally {
            setSubmitting(false);
        }
    }, [text, submitting, replyTo, id, loadReplies, t]);

    const renderComment = (item: CommentItem, rootId: number, isReply = false) => (
        <View style={[styles.commentItem, isReply && styles.replyItem]}>
            {/* Linha de cabeçalho: avatar + nome lado a lado */}
            <View style={styles.headerRow}>
                <Avatar name={item.author.name} url={item.author.avatar_url} size={isReply ? 32 : 40} />
                <Text style={styles.username}>{item.author.name}</Text>
                {item.author.is_admin && (
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                )}
            </View>

            {/* Marca a quem está respondendo */}
            {item.reply_to_name && (
                <Text style={styles.replyingToMark}>
                    {t('replyingTo')} <Text style={styles.replyingToName}>@{item.reply_to_name}</Text>
                </Text>
            )}

            {/* Texto full-width */}
            <Text style={styles.commentText}>{item.body}</Text>

            {/* Footer: curtir + responder + data */}
            <View style={styles.commentFooter}>
                <TouchableOpacity style={styles.likeButton} onPress={() => toggleLike(item)}>
                    <IconSymbol
                        name={item.liked_by_me ? 'heart.fill' : 'heart'}
                        size={18}
                        color={item.liked_by_me ? '#8E6BEB' : '#aaa'}
                    />
                    <Text style={[styles.likesCount, item.liked_by_me && { color: '#8E6BEB' }]}>{item.likes_count}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => startReply(item, rootId)}>
                    <Text style={styles.replyBtn}>{t('reply')}</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>

            {/* Toggle + lista achatada de respostas (só na raiz) */}
            {!isReply && item.replies_count > 0 && (
                <TouchableOpacity onPress={() => toggleReplies(item.id)} style={styles.repliesToggle}>
                    <Text style={styles.repliesToggleText}>
                        {expanded[item.id] ? t('hideReplies') : `${t('viewReplies')} (${item.replies_count})`}
                    </Text>
                </TouchableOpacity>
            )}

            {!isReply && expanded[item.id] && (
                <View style={styles.repliesContainer}>
                    {(repliesByRoot[item.id] ?? []).map((r) => (
                        <View key={r.id}>{renderComment(r, item.id, true)}</View>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                    extraData={{ expanded, repliesByRoot }}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('noComments')}</Text>}
                    renderItem={({ item }) => renderComment(item, item.id)}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
                {replyTo && (
                    <View style={styles.replyingBanner}>
                        <Text style={styles.replyingText} numberOfLines={1}>
                            {t('replyingTo')} {replyTo.target.author.name}
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
    separator: { height: 1, backgroundColor: '#23242E', marginVertical: 20 },
    commentItem: {},
    replyItem: { marginTop: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    avatar: { backgroundColor: '#333' },
    avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#8E6BEB' },
    avatarLetter: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    username: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    adminBadge: { backgroundColor: '#8E6BEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    adminBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    replyingToMark: { color: '#888', fontSize: 12, marginBottom: 6 },
    replyingToName: { color: '#8E6BEB', fontWeight: '600' },
    commentText: { color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    commentFooter: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    likeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    likesCount: { color: '#ccc', fontSize: 13 },
    replyBtn: { color: '#8E6BEB', fontSize: 13, fontWeight: 'bold' },
    dateText: { color: '#888', fontSize: 12, marginLeft: 'auto' },
    repliesToggle: { marginTop: 14 },
    repliesToggleText: { color: '#8E6BEB', fontSize: 13, fontWeight: '600' },
    repliesContainer: { marginTop: 6, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#2C2D35' },
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
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8E6BEB', justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { opacity: 0.5 },
});
