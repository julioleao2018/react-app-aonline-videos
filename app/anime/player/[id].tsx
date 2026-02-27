import { View, StyleSheet, TouchableOpacity, Text, Dimensions, StatusBar, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Slider from '@react-native-community/slider';

export default function VideoPlayerScreen() {
    const { id, title = 'Episode 1', url = 'https://aniplay.online/Midias/Animes/Letra-O/Omae-Gotoki-ga-Maou/08.mp4' } = useLocalSearchParams();
    const router = useRouter();

    // expo-video setup
    const player = useVideoPlayer(url as string, p => {
        p.loop = false;
        p.play();
    });

    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Track Video Progress for the Timeline
    useEffect(() => {
        if (!player) return;

        // Force play just in case the setup config was missed by native OS
        player.play();

        const interval = setInterval(() => {
            setCurrentTime(player.currentTime || 0);
            setDuration(player.duration || 0);
            setIsPlaying(player.playing);
        }, 200);

        return () => clearInterval(interval);
    }, [player]);

    // Enter Landscape on Mount, Exit on Unmount
    useEffect(() => {
        let isMounted = true;
        async function setLandscape() {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        setLandscape();

        return () => {
            isMounted = false;
            // Force portrait up when component unmounts (whether by back button or swipe gesture)
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).then(() => {
                ScreenOrientation.unlockAsync();
            });
        };
    }, []);

    const togglePlayPause = () => {
        if (!player) return;
        player.playing ? player.pause() : player.play();
    };

    const skipForward = () => {
        if (player) player.currentTime += 10;
    };

    const skipBackward = () => {
        if (player) player.currentTime = Math.max(0, player.currentTime - 10);
    };

    const formatTime = (seconds: number) => {
        const totalSeconds = Math.floor(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isLoaded = duration > 0;

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <TouchableOpacity
                activeOpacity={1}
                style={styles.videoWrapper}
                onPress={() => setShowControls(!showControls)}
            >
                <VideoView
                    player={player}
                    style={styles.video}
                    nativeControls={false}
                />
            </TouchableOpacity>

            {/* Custom Overlay Controls */}
            {showControls && (
                <View style={[styles.controlsOverlay, { pointerEvents: "box-none" as any }]}>

                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <IconSymbol name="arrow.left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>{title}</Text>

                        <View style={styles.topActions}>
                            <View style={styles.serverBadge}>
                                <Text style={styles.serverText}>Server S1</Text>
                            </View>
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="speedometer" size={20} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="text.bubble" size={20} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="gear" size={20} color="#fff" /></TouchableOpacity>
                        </View>
                    </View>

                    {/* Center Controls (Play/Pause, Skip) */}
                    <View style={[styles.centerControls, { pointerEvents: "box-none" as any }]}>
                        <TouchableOpacity onPress={skipBackward} style={styles.centerActionBtn}>
                            <IconSymbol name="gobackward.10" size={36} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn}>
                            <IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={48} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipForward} style={styles.centerActionBtn}>
                            <IconSymbol name="goforward.10" size={36} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Bar (Timeline) */}
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
                                onSlidingComplete={(value) => {
                                    if (player) {
                                        player.currentTime = value;
                                    }
                                }}
                            />

                            <Text style={styles.timeText}>{isLoaded && duration > 0 ? formatTime(duration) : '00:00'}</Text>
                        </View>

                        <View style={styles.bottomActionsRow}>
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="lock.open" size={20} color="#fff" /></TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="speaker.wave.2.fill" size={20} color="#fff" /></TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.iconButton}><IconSymbol name="arrow.up.left.and.arrow.down.right" size={20} color="#fff" /></TouchableOpacity>
                        </View>
                    </View>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        flex: 1,
    },
    topActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    serverBadge: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    serverText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 8,
    },
    centerControls: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    centerActionBtn: {
        padding: 20,
    },
    playPauseBtn: {
        padding: 20,
    },
    bottomBar: {
        flexDirection: 'column',
        marginBottom: 10,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 10,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        width: 45,
        textAlign: 'center',
    },
    bottomActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    }
});
