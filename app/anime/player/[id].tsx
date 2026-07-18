import { View, StyleSheet, TouchableOpacity, Text, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useMemo, useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Slider from '@react-native-community/slider';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { PlaySource } from '@/src/domain/models/Anime';
import { MEDIA_REFERER } from '@/src/config/env';

export default function VideoPlayerScreen() {
    const { id, title = 'Player' } = useLocalSearchParams<{ id: string; title?: string }>();
    const router = useRouter();

    const [sources, setSources] = useState<PlaySource[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Player começa vazio; trocamos a fonte quando ela carrega da API.
    const player = useVideoPlayer(null, (p) => {
        p.loop = false;
    });

    const currentSource = useMemo(() => sources[currentIndex], [sources, currentIndex]);

    // Carrega as fontes tocáveis do episódio. Prioriza HLS, depois MP4.
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const play = await animeRepository.getEpisodePlay(id);
                const ordered = [...play.sources].sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'hls' ? -1 : 1;
                    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
                });
                if (!mounted) return;
                if (ordered.length === 0) {
                    setError('Nenhuma fonte disponível.');
                } else {
                    setSources(ordered);
                }
            } catch {
                if (mounted) setError('Não foi possível carregar o vídeo.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    // Troca a fonte do player quando muda a source selecionada.
    // O CDN exige Referer same-origin do site; sem ele responde 403 (o header
    // é aplicado também aos segmentos HLS pelo player nativo).
    useEffect(() => {
        if (!currentSource) return;
        player.replace({
            uri: currentSource.url,
            headers: { Referer: MEDIA_REFERER },
        });
        player.play();
    }, [currentSource, player]);

    // Progresso da timeline.
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(player.currentTime || 0);
            setDuration(player.duration || 0);
            setIsPlaying(player.playing);
        }, 250);
        return () => clearInterval(interval);
    }, [player]);

    // Landscape ao montar, portrait ao sair.
    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).then(() =>
                ScreenOrientation.unlockAsync()
            );
        };
    }, []);

    const togglePlayPause = () => (player.playing ? player.pause() : player.play());
    const skipForward = () => { player.currentTime += 10; };
    const skipBackward = () => { player.currentTime = Math.max(0, player.currentTime - 10); };
    const cycleServer = () => {
        if (sources.length > 1) setCurrentIndex((i) => (i + 1) % sources.length);
    };

    const formatTime = (seconds: number) => {
        const total = Math.floor(seconds);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLoaded = duration > 0;

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <StatusBar hidden />
                <ActivityIndicator size="large" color="#8E6BEB" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <StatusBar hidden />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backErrorBtn}>
                    <Text style={styles.backErrorText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <TouchableOpacity activeOpacity={1} style={styles.videoWrapper} onPress={() => setShowControls(!showControls)}>
                <VideoView player={player} style={styles.video} nativeControls={false} />
            </TouchableOpacity>

            {showControls && (
                <View style={[styles.controlsOverlay, { pointerEvents: 'box-none' as any }]}>
                    {/* Top */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <IconSymbol name="arrow.left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <View style={styles.topActions}>
                            <TouchableOpacity onPress={cycleServer} style={styles.serverBadge}>
                                <Text style={styles.serverText}>
                                    {currentSource?.label || `Server ${currentIndex + 1}`} · {currentSource?.type?.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Center */}
                    <View style={[styles.centerControls, { pointerEvents: 'box-none' as any }]}>
                        <TouchableOpacity onPress={skipBackward} style={styles.centerActionBtn}>
                            <IconSymbol name="gobackward.10" size={36} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn}>
                            <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={48} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipForward} style={styles.centerActionBtn}>
                            <IconSymbol name="goforward.10" size={36} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom */}
                    <View style={styles.bottomBar}>
                        <View style={styles.timelineRow}>
                            <Text style={styles.timeText}>{isLoaded ? formatTime(currentTime) : '00:00'}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration > 0 ? duration : 1}
                                value={currentTime}
                                minimumTrackTintColor="#8E6BEB"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#fff"
                                onSlidingComplete={(value) => { player.currentTime = value; }}
                            />
                            <Text style={styles.timeText}>{isLoaded ? formatTime(duration) : '00:00'}</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centered: { alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#fff', fontSize: 16, marginBottom: 16 },
    backErrorBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#8E6BEB', borderRadius: 24 },
    backErrorText: { color: '#fff', fontWeight: 'bold' },
    videoWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    video: { width: '100%', height: '100%' },
    controlsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', padding: 20 },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 10 },
    title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 16, flex: 1 },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    serverBadge: { borderWidth: 1, borderColor: '#fff', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
    serverText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    iconButton: { padding: 8 },
    centerControls: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 },
    centerActionBtn: { padding: 20 },
    playPauseBtn: { padding: 20 },
    bottomBar: { flexDirection: 'column', marginBottom: 10 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    slider: { flex: 1, height: 40, marginHorizontal: 10 },
    timeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', width: 45, textAlign: 'center' },
});
