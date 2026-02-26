import { Image } from 'expo-image';
import { StyleSheet, View, Text, ImageBackground, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AnimeHorizontalList from '@/components/AnimeHorizontalList';

// Placeholder data for the design
const MOCK_DATA = [
  { id: '1', title: 'One Piece', image: 'https://cdn.myanimelist.net/images/anime/1244/141074l.jpg', rating: 'PG-13', quality: 'HD' },
  { id: '2', title: 'Frieren', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', rating: 'PG-13', quality: 'HD' },
  { id: '3', title: 'Fullmetal Alchemist', image: 'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg', rating: 'R', quality: 'HD' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://cdn.myanimelist.net/images/anime/1622/134449l.jpg' }} // Placeholder Hero
          style={styles.heroBackground}
        >
          {/* Top Bar Overlay */}
          <View style={styles.topBar}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logo9}>9</Text>
              </View>
              <Text style={styles.logoText}>Anime</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <IconSymbol name="magnifyingglass" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <IconSymbol name="bell.fill" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(21, 23, 30, 0.8)', '#15171E']}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>Sentenced to Be a Hero</Text>
            <Text style={styles.heroSubtitle}>Action, Adventure, Comedy, Drama, Fantasy</Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.playButton}>
                <IconSymbol name="play.fill" size={20} color="#fff" />
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.myListButton}>
                <IconSymbol name="plus" size={20} color="#fff" />
                <Text style={styles.myListButtonText}>My List</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content Sections */}
        <View style={styles.listsContainer}>
          <AnimeHorizontalList title="Top Airing" data={MOCK_DATA} />
          <AnimeHorizontalList title="New Episode Releases" data={MOCK_DATA} />
          <AnimeHorizontalList title="Most Favorite" data={MOCK_DATA} />
          <AnimeHorizontalList title="Top TV Series" data={MOCK_DATA} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15171E',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroBackground: {
    width: '100%',
    height: 480,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Safe area approx
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
    marginRight: 8,
  },
  logo9: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
    marginTop: -2,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#8E6BEB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 6,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#fff',
    gap: 6,
  },
  myListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listsContainer: {
    marginTop: -10,
  },
});
