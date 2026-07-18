import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    home: { en: 'Home', pt: 'Início' },
    myList: { en: 'My List', pt: 'Minha Lista' },
    profile: { en: 'Profile', pt: 'Perfil' },
    topAiring: { en: 'Top Airing', pt: 'Em Alta' },
    newEpisodes: { en: 'New Episode Releases', pt: 'Novos Episódios' },
    mostFavorite: { en: 'Most Favorite', pt: 'Mais Favoritos' },
    topTvSeries: { en: 'Top TV Series', pt: 'Melhores Séries' },
    seeAll: { en: 'See all', pt: 'Ver todos' },
    play: { en: 'Play', pt: 'Assistir' },
    signInSync: { en: 'Sign in to synchronize your anime', pt: 'Entre para sincronizar seus animes' },
    continue: { en: 'Continue', pt: 'Continuar' },
    subtitleSettings: { en: 'Subtitle settings', pt: 'Configurações de legenda' },
    helpCenter: { en: 'Help center', pt: 'Central de ajuda' },
    letYouIn: { en: 'Let you in', pt: 'Entrar' },
    continueGoogle: { en: 'Continue with Google', pt: 'Continuar com Google' },
    or: { en: 'or', pt: 'ou' },
    signInPassword: { en: 'Sign in with password', pt: 'Entrar com senha' },
    noAccount: { en: "Don't have an account? ", pt: 'Não tem uma conta? ' },
    signUp: { en: 'Sign up', pt: 'Cadastre-se' },
    myProfile: { en: 'My profile', pt: 'Meu perfil' },
    animesBR: { en: 'nimesBR', pt: 'nimesBR' },
    sentencedToBeAHero: { en: 'Sentenced to Be a Hero', pt: 'Sentenced to Be a Hero' },
    heroSubtitleCategories: { en: 'Action, Adventure, Comedy, Drama, Fantasy', pt: 'Ação, Aventura, Comédia, Drama, Fantasia' },
    language: { en: 'Language (EN)', pt: 'Idioma (PT)' },
    download: { en: 'Download', pt: 'Baixar' },
    genreLabel: { en: 'Genre', pt: 'Gênero' },
    viewMore: { en: 'View More', pt: 'Ver Mais' },
    episodes: { en: 'Episodes', pt: 'Episódios' },
    searchEpisode: { en: 'Search episode', pt: 'Buscar episódio' },
    moreLikeThis: { en: 'More like this', pt: 'Títulos Semelhantes' },
    comments: { en: 'Comments', pt: 'Comentários' },
    viewAllComments: { en: 'View All Comments', pt: 'Ver Todos os Comentários' },
    giveRating: { en: 'Give Rating', pt: 'Avaliar' },
    users: { en: 'users', pt: 'usuários' },
    cancel: { en: 'Cancel', pt: 'Cancelar' },
    submit: { en: 'Submit', pt: 'Enviar' },
    loadingComments: { en: 'Loading comments...', pt: 'Carregando comentários...' },
    email: { en: 'Email', pt: 'E-mail' },
    password: { en: 'Password', pt: 'Senha' },
    signIn: { en: 'Sign in', pt: 'Entrar' },
    signingIn: { en: 'Signing in...', pt: 'Entrando...' },
    loginError: { en: 'Invalid email or password.', pt: 'E-mail ou senha inválidos.' },
    connectionError: { en: 'Cannot reach the server. Check your connection / API URL.', pt: 'Não foi possível conectar ao servidor. Verifique a conexão / URL da API.' },
    welcomeBack: { en: 'Welcome back', pt: 'Bem-vindo de volta' },
    signUpHint: { en: 'Create your account on the website.', pt: 'Crie sua conta pelo site.' },
    loadError: { en: 'Could not load. Pull to retry.', pt: 'Não foi possível carregar. Puxe para tentar de novo.' },
    noEpisodes: { en: 'No episodes available yet.', pt: 'Nenhum episódio disponível ainda.' },
    loadingMore: { en: 'Loading more…', pt: 'Carregando mais…' },
    emptyWatchlistTitle: { en: 'Your list is empty', pt: 'Sua lista está vazia' },
    emptyWatchlistDesc: { en: 'Tap the bookmark on an anime to save it here.', pt: 'Toque no marcador de um anime para salvá-lo aqui.' },
    exploreAnimes: { en: 'Explore animes', pt: 'Explorar animes' },
    // Minha Lista (estilo CR)
    myLists: { en: 'My Lists', pt: 'Minhas Listas' },
    tabQueue: { en: 'Queue', pt: 'Fila' },
    tabHistory: { en: 'History', pt: 'Histórico' },
    tabFavorites: { en: 'Favorites', pt: 'Favoritos' },
    continueLabel: { en: 'Continue', pt: 'Continuar' },
    sortActivity: { en: 'Most Recent Activity', pt: 'Atividade Mais Recente' },
    sortUpdated: { en: 'Recently Updated', pt: 'Atualização Mais Recente' },
    sortWatched: { en: 'Recently Watched', pt: 'Visualização Mais Recente' },
    sortAdded: { en: 'Recently Added', pt: 'Adição Mais Recente' },
    sortAlpha: { en: 'Alphabetical', pt: 'Ordem Alfabética' },
    sortByTitle: { en: 'SORT BY', pt: 'ORDENAR POR' },
    applySort: { en: 'Sort', pt: 'Ordenar' },
    filterTitle: { en: 'FILTER', pt: 'FILTRAR' },
    applyFilter: { en: 'Filter', pt: 'Filtrar' },
    onlyFavorites: { en: 'Favorites only', pt: 'Apenas Favoritos' },
    seriesAndMovies: { en: 'SERIES & MOVIES', pt: 'SÉRIES & FILMES' },
    typeAll: { en: 'All', pt: 'Todos' },
    typeSeries: { en: 'Series only', pt: 'Apenas Séries' },
    typeMovies: { en: 'Movies only', pt: 'Apenas Filmes' },
    languageSection: { en: 'LANGUAGE', pt: 'IDIOMA' },
    langAll: { en: 'All', pt: 'Todos' },
    langSubbed: { en: 'Subbed only', pt: 'Apenas Legendado' },
    langDubbed: { en: 'Dubbed only', pt: 'Apenas Dublado' },
    emptyHistoryTitle: { en: 'No history yet', pt: 'Sem histórico ainda' },
    emptyHistoryDesc: { en: 'Episodes you watch will show up here.', pt: 'Os episódios que você assistir aparecem aqui.' },
    emptyFavoritesTitle: { en: 'No favorites yet', pt: 'Nenhum favorito ainda' },
    emptyFavoritesDesc: { en: 'Tap the heart to favorite an anime.', pt: 'Toque no coração para favoritar um anime.' },
    logout: { en: 'Log out', pt: 'Sair' },
    reply: { en: 'Reply', pt: 'Responder' },
    replyingTo: { en: 'Replying to', pt: 'Respondendo a' },
    viewReplies: { en: 'View replies', pt: 'Ver respostas' },
    hideReplies: { en: 'Hide replies', pt: 'Ocultar respostas' },
    addComment: { en: 'Add comment...', pt: 'Adicionar comentário...' },
    writeReply: { en: 'Write a reply...', pt: 'Escreva uma resposta...' },
    noComments: { en: 'No comments yet. Be the first!', pt: 'Sem comentários ainda. Seja o primeiro!' },
    name: { en: 'Name', pt: 'Nome' },
    confirmPassword: { en: 'Confirm password', pt: 'Confirmar senha' },
    createAccount: { en: 'Create account', pt: 'Criar conta' },
    haveAccount: { en: 'Already have an account?', pt: 'Já tem uma conta?' },
    continueDiscord: { en: 'Continue with Discord', pt: 'Continuar com Discord' },
    registerError: { en: 'Could not create account. Check the fields.', pt: 'Não foi possível criar a conta. Verifique os campos.' },
    passwordsDontMatch: { en: 'Passwords do not match.', pt: 'As senhas não coincidem.' },
    socialError: { en: 'Social sign-in failed.', pt: 'Falha no login social.' },
};

interface LanguageContextProps {
    language: Language;
    toggleLanguage: () => void;
    t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('pt'); // Default to Portuguese

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'pt' : 'en'));
    };

    const t = (key: keyof typeof translations): string => {
        return translations[key]?.[language] || (key as string);
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
