import { ReactNode, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    FlatList,
    Image,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { MyListFilters, MyListItem, MyListSort } from '@/src/domain/models/Anime';

const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;
const ACCENT = '#8E6BEB'; // roxo padrão do app

type Tab = 'queue' | 'history' | 'favorites';

const SORT_OPTIONS: { value: MyListSort; labelKey: string }[] = [
    { value: 'activity', labelKey: 'sortActivity' },
    { value: 'updated', labelKey: 'sortUpdated' },
    { value: 'watched', labelKey: 'sortWatched' },
    { value: 'added', labelKey: 'sortAdded' },
    { value: 'alpha', labelKey: 'sortAlpha' },
];

export default function MyListScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const library = useLibrary();

    const [tab, setTab] = useState<Tab>('queue');
    const [sort, setSort] = useState<MyListSort>('activity');
    const [filters, setFilters] = useState<MyListFilters>({});

    const [items, setItems] = useState<MyListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [actionItem, setActionItem] = useState<MyListItem | null>(null);

    const fetchList = useCallback(
        (nextTab: Tab, nextSort: MyListSort, nextFilters: MyListFilters) => {
            if (nextTab === 'history') return animeRepository.getHistory(nextSort, nextFilters);
            if (nextTab === 'favorites') return animeRepository.getFavorites(nextSort, nextFilters);
            return animeRepository.getWatchlist(nextSort, nextFilters);
        },
        []
    );

    const load = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            setError(false);
            const data = await fetchList(tab, sort, filters);
            setItems(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthenticated, fetchList, tab, sort, filters]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            load();
        }, [load])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        load();
    }, [load]);

    const openAnime = (slug: string) => router.push({ pathname: '/anime/[id]', params: { id: slug } });

    // Toggle favorito otimista na linha (via contexto global -> sincroniza tudo).
    const toggleFavorite = useCallback(async (item: MyListItem) => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i)));
        const result = await library.toggleFavorite(item.slug);
        setItems((prev) => {
            let next = prev.map((i) => (i.id === item.id ? { ...i, is_favorite: result } : i));
            if (tab === 'favorites' && !result) next = next.filter((i) => i.id !== item.id);
            return next;
        });
    }, [tab, library]);

    // Ações do menu (kebab): adicionar/remover da fila (via contexto global).
    const toggleWatchlist = useCallback(async (item: MyListItem) => {
        const result = await library.toggleSaved(item.slug);
        setItems((prev) => {
            let next = prev.map((i) => (i.id === item.id ? { ...i, in_watchlist: result } : i));
            if (tab === 'queue' && !result) next = next.filter((i) => i.id !== item.id);
            return next;
        });
    }, [tab, library]);

    const changeTab = (next: Tab) => {
        if (next === tab) return;
        setTab(next);
        setLoading(true);
        // load() dispara pelo useFocusEffect? Não — só no foco. Recarrega manualmente.
        (async () => {
            try {
                setError(false);
                const data = await fetchList(next, sort, filters);
                setItems(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    const applySort = (value: MyListSort) => {
        setSort(value);
        setSortOpen(false);
        setLoading(true);
        (async () => {
            try {
                const data = await fetchList(tab, value, filters);
                setItems(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    const applyFilters = (next: MyListFilters) => {
        setFilters(next);
        setFilterOpen(false);
        setLoading(true);
        (async () => {
            try {
                const data = await fetchList(tab, sort, next);
                setItems(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    const currentSortLabel = t(SORT_OPTIONS.find((o) => o.value === sort)?.labelKey ?? 'sortActivity');

    // ---- Render helpers ----
    const Header = (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}><Text style={styles.logo9}>A</Text></View>
                <Text style={styles.headerTitle}>{t('myLists')}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
                <IconSymbol name="magnifyingglass" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const Tabs = (
        <View style={styles.tabs}>
            {(['queue', 'history', 'favorites'] as Tab[]).map((key) => {
                const active = tab === key;
                const label = key === 'queue' ? t('tabQueue') : key === 'history' ? t('tabHistory') : t('tabFavorites');
                return (
                    <TouchableOpacity key={key} style={styles.tabItem} onPress={() => changeTab(key)}>
                        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                        {active && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const SubHeader = (
        <View style={styles.subHeader}>
            <Text style={styles.sortLabel} numberOfLines={1}>{currentSortLabel}</Text>
            <View style={styles.subHeaderActions}>
                <TouchableOpacity style={styles.subIcon} onPress={() => setSortOpen(true)}>
                    <IconSymbol name="line.3.horizontal.decrease" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.subIcon} onPress={() => setFilterOpen(true)}>
                    <IconSymbol name="slider.horizontal.3" size={22} color={hasActiveFilters(filters) ? ACCENT : '#fff'} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRow = ({ item }: { item: MyListItem }) => {
        const contNum = item.continue?.number;
        return (
            <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => openAnime(item.slug)}>
                <View style={styles.thumbWrap}>
                    {item.cover_url ? (
                        <Image source={{ uri: item.cover_url }} style={styles.thumb} />
                    ) : (
                        <View style={[styles.thumb, styles.thumbPlaceholder]} />
                    )}
                </View>
                <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
                    {contNum != null && (
                        <Text style={styles.rowContinue}>{t('continueLabel')}: E{contNum}</Text>
                    )}
                    <View style={styles.langRow}>
                        {item.languages?.includes('dublado') && (
                            <View style={styles.langBadge}><Text style={styles.langText}>DUB</Text></View>
                        )}
                        {item.languages?.includes('legendado') && (
                            <View style={styles.langBadge}><Text style={styles.langText}>LEG</Text></View>
                        )}
                    </View>
                </View>
                <View style={styles.rowActions}>
                    <TouchableOpacity hitSlop={8} onPress={() => toggleFavorite(item)}>
                        <IconSymbol
                            name={item.is_favorite ? 'heart.fill' : 'heart'}
                            size={22}
                            color={item.is_favorite ? ACCENT : '#fff'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={8} onPress={() => setActionItem(item)}>
                        <IconSymbol name="ellipsis" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const emptyContent = () => {
        if (error) {
            return (
                <TouchableOpacity style={styles.errorBox} onPress={load}>
                    <Text style={styles.errorText}>{t('loadError')}</Text>
                </TouchableOpacity>
            );
        }
        const title = tab === 'history' ? t('emptyHistoryTitle') : tab === 'favorites' ? t('emptyFavoritesTitle') : t('emptyWatchlistTitle');
        const desc = tab === 'history' ? t('emptyHistoryDesc') : tab === 'favorites' ? t('emptyFavoritesDesc') : t('emptyWatchlistDesc');
        return (
            <View style={styles.emptyBox}>
                <IconSymbol name={tab === 'favorites' ? 'heart' : 'bookmark'} size={44} color="#3A3B45" />
                <Text style={styles.emptyTitle}>{title}</Text>
                <Text style={styles.emptyDesc}>{desc}</Text>
            </View>
        );
    };

    // Fallback defensivo (app é auth-gated).
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor="#15171E" />
                <View style={[styles.container, { paddingTop: TOP_INSET }]}>
                    {Header}
                    <View style={styles.syncCard}>
                        <Text style={styles.cardTitle}>{t('myProfile')}</Text>
                        <Text style={styles.cardDesc}>{t('signInSync')}</Text>
                        <TouchableOpacity style={styles.continueButton} onPress={() => router.replace('/login')}>
                            <Text style={styles.continueButtonText}>{t('continue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#15171E" />
            <View style={[styles.container, { paddingTop: TOP_INSET }]}>
                {Header}
                {Tabs}
                {SubHeader}

                {loading ? (
                    <View style={styles.centered}><ActivityIndicator size="large" color={ACCENT} /></View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderRow}
                        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
                        ListEmptyComponent={emptyContent()}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </View>

            {/* Sheet: Ordenar (montado só quando aberto → reinicia do estado atual) */}
            {sortOpen && (
                <SortSheet current={sort} onClose={() => setSortOpen(false)} onApply={applySort} t={t} />
            )}

            {/* Sheet: Filtrar */}
            {filterOpen && (
                <FilterSheet current={filters} onClose={() => setFilterOpen(false)} onApply={applyFilters} t={t} />
            )}

            {/* Sheet: Ações da linha (kebab) */}
            <ActionSheet
                item={actionItem}
                tab={tab}
                onClose={() => setActionItem(null)}
                onToggleFavorite={(i: MyListItem) => { toggleFavorite(i); setActionItem(null); }}
                onToggleWatchlist={(i: MyListItem) => { toggleWatchlist(i); setActionItem(null); }}
                t={t}
            />
        </SafeAreaView>
    );
}

function hasActiveFilters(f: MyListFilters): boolean {
    return !!(f.favoritesOnly || f.type || f.language);
}

// ---------- Bottom sheets ----------

function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    return (
        <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.sheetBackdrop} onPress={onClose} />
            <View style={styles.sheet}>{children}</View>
        </Modal>
    );
}

function RadioRow({ selected, title, desc, onPress }: { selected: boolean; title: string; desc?: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.optRow} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.radio, selected && styles.radioOn]}>
                {selected && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>{title}</Text>
                {!!desc && <Text style={styles.optDesc}>{desc}</Text>}
            </View>
        </TouchableOpacity>
    );
}

function SortSheet({ current, onClose, onApply, t }: any) {
    const [sel, setSel] = useState<MyListSort>(current);
    return (
        <BottomSheet open onClose={onClose}>
            <Text style={styles.sheetTitle}>{t('sortByTitle')}</Text>
            {SORT_OPTIONS.map((o) => (
                <RadioRow key={o.value} selected={sel === o.value} title={t(o.labelKey)} onPress={() => setSel(o.value)} />
            ))}
            <TouchableOpacity style={styles.sheetBtn} onPress={() => onApply(sel)}>
                <Text style={styles.sheetBtnText}>{t('applySort')}</Text>
            </TouchableOpacity>
        </BottomSheet>
    );
}

function FilterSheet({ current, onClose, onApply, t }: any) {
    const [favOnly, setFavOnly] = useState<boolean>(!!current.favoritesOnly);
    const [type, setType] = useState<'series' | 'movie' | null>(current.type ?? null);
    const [language, setLanguage] = useState<'legendado' | 'dublado' | null>(current.language ?? null);

    return (
        <BottomSheet open onClose={onClose}>
            <Text style={styles.sheetTitle}>{t('filterTitle')}</Text>

            <TouchableOpacity style={styles.checkRow} onPress={() => setFavOnly((v) => !v)} activeOpacity={0.7}>
                <View style={[styles.checkbox, favOnly && styles.checkboxOn]}>
                    {favOnly && <IconSymbol name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.optTitle}>{t('onlyFavorites')}</Text>
            </TouchableOpacity>

            <Text style={styles.sheetSection}>{t('seriesAndMovies')}</Text>
            <RadioRow selected={type === null} title={t('typeAll')} onPress={() => setType(null)} />
            <RadioRow selected={type === 'series'} title={t('typeSeries')} onPress={() => setType('series')} />
            <RadioRow selected={type === 'movie'} title={t('typeMovies')} onPress={() => setType('movie')} />

            <Text style={styles.sheetSection}>{t('languageSection')}</Text>
            <RadioRow selected={language === null} title={t('langAll')} onPress={() => setLanguage(null)} />
            <RadioRow selected={language === 'legendado'} title={t('langSubbed')} onPress={() => setLanguage('legendado')} />
            <RadioRow selected={language === 'dublado'} title={t('langDubbed')} onPress={() => setLanguage('dublado')} />

            <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => onApply({ favoritesOnly: favOnly, type, language })}
            >
                <Text style={styles.sheetBtnText}>{t('applyFilter')}</Text>
            </TouchableOpacity>
        </BottomSheet>
    );
}

function ActionSheet({ item, tab, onClose, onToggleFavorite, onToggleWatchlist, t }: any) {
    if (!item) return null;
    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.sheetBackdrop} onPress={onClose} />
            <View style={styles.actionSheet}>
                <Text style={styles.actionTitle} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity style={styles.actionRow} onPress={() => onToggleFavorite(item)}>
                    <IconSymbol name={item.is_favorite ? 'heart.fill' : 'heart'} size={20} color={item.is_favorite ? ACCENT : '#fff'} />
                    <Text style={styles.actionText}>{item.is_favorite ? t('tabFavorites') + ' ✓' : t('tabFavorites')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => onToggleWatchlist(item)}>
                    <IconSymbol name="bookmark" size={20} color={item.in_watchlist ? ACCENT : '#fff'} />
                    <Text style={styles.actionText}>{item.in_watchlist ? t('tabQueue') + ' ✓' : t('tabQueue')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#15171E' },
    container: { flex: 1, backgroundColor: '#15171E' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
    },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8E6BEB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logo9: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: -2 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    iconButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2C2D35' },
    tabItem: { marginRight: 28, paddingBottom: 10 },
    tabText: { color: '#9A9AA5', fontSize: 15, fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, backgroundColor: ACCENT, borderRadius: 2 },
    subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    sortLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
    subHeaderActions: { flexDirection: 'row', gap: 18 },
    subIcon: { padding: 2 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listContent: { paddingBottom: 24 },
    emptyList: { flexGrow: 1 },
    separator: { height: 1, backgroundColor: '#22232C', marginLeft: 84 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
    thumbWrap: { width: 52, height: 72, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1A1A24' },
    thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    thumbPlaceholder: { backgroundColor: '#2F3142' },
    rowInfo: { flex: 1 },
    rowTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    rowContinue: { color: '#B7B7C0', fontSize: 13, marginBottom: 6 },
    langRow: { flexDirection: 'row', gap: 6 },
    langBadge: { borderWidth: 1, borderColor: '#4A4B57', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
    langText: { color: '#B7B7C0', fontSize: 10, fontWeight: 'bold' },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptyDesc: { color: '#A0A0B0', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    errorBox: { margin: 20, padding: 16, backgroundColor: '#2C2D35', borderRadius: 12 },
    errorText: { color: '#ff6b6b', textAlign: 'center' },
    // sheets
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { backgroundColor: '#1B1C24', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
    sheetTitle: { color: '#9A9AA5', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
    sheetSection: { color: '#9A9AA5', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginTop: 16, marginBottom: 6 },
    optRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 14 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#6A6B78', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    radioOn: { borderColor: ACCENT },
    radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: ACCENT },
    optTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
    optDesc: { color: '#8A8A95', fontSize: 12, marginTop: 2, lineHeight: 16 },
    checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
    checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: '#6A6B78', alignItems: 'center', justifyContent: 'center' },
    checkboxOn: { backgroundColor: ACCENT, borderColor: ACCENT },
    sheetBtn: { marginTop: 20, backgroundColor: ACCENT, borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
    sheetBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    actionSheet: { backgroundColor: '#1B1C24', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
    actionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
    actionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    // sync card (fallback)
    syncCard: { marginHorizontal: 20, backgroundColor: '#2C2D35', borderRadius: 12, padding: 20 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    cardDesc: { color: '#ccc', fontSize: 15, marginBottom: 20 },
    continueButton: { backgroundColor: '#8E6BEB', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
    continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
