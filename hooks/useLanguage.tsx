import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    home: { en: 'Home', pt: 'Início' },
    schedule: { en: 'Schedule', pt: 'Agenda' },
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
