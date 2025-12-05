// Category constants - Type-based
export const CATEGORIES = {
    ALL: 'all',
    MOVIES: 'movies',
    ANIMATED: 'animated',
    CARTOON: 'cartoon',
    ANIME: 'anime',
    KDRAMA: 'kdrama',
    SHOWS: 'shows'
};

export const CATEGORY_LABELS = {
    [CATEGORIES.ALL]: 'All',
    [CATEGORIES.MOVIES]: 'Movies',
    [CATEGORIES.ANIMATED]: 'Animated',
    [CATEGORIES.CARTOON]: 'Cartoon',
    [CATEGORIES.ANIME]: 'Anime',
    [CATEGORIES.KDRAMA]: 'K-Drama',
    [CATEGORIES.SHOWS]: 'Shows/Web Series'
};

export const CATEGORY_COLORS: Record<string, string> = {
    movies: '#ef4444',      // Red
    animated: '#22c55e',    // Green
    cartoon: '#f59e0b',     // Amber
    anime: '#a855f7',       // Purple
    kdrama: '#ec4899',      // Pink
    shows: '#3b82f6',       // Blue
};

// Regional labels for display
export const REGIONS: Record<string, string> = {
    US: '🇺🇸 Hollywood',
    IN: '🇮🇳 Bollywood',
    KR: '🇰🇷 Korean',
    JP: '🇯🇵 Japanese',
    CN: '🇨🇳 Chinese',
    HK: '🇭🇰 Hong Kong',
    TW: '🇹🇼 Taiwan',
    FR: '🇫🇷 French',
    ES: '🇪🇸 Spanish',
    MX: '🇲🇽 Mexican',
    TH: '🇹🇭 Thai',
    TR: '🇹🇷 Turkish',
    GB: '🇬🇧 British',
};

// TMDb API configuration
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_POSTER_SIZE = 'w500';
export const TMDB_BACKDROP_SIZE = 'w1280';

// LocalStorage keys
export const STORAGE_KEYS = {
    API_KEY: 'tmdb_api_key',
    THEME: 'app_theme',
    WATCHED_ITEMS: 'watched_items'
};

// IndexedDB configuration
export const DB_NAME = 'MyStuffDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'watchedItems';

// Media types
export const MEDIA_TYPES = {
    MOVIE: 'movie',
    TV: 'tv'
};

// Anime genre ID in TMDb
export const ANIME_GENRE_ID = 16; // Animation

// Origin country codes
export const ORIGIN_COUNTRIES = {
    KOREA: 'KR',
    JAPAN: 'JP',
    CHINA: 'CN',
    HONG_KONG: 'HK',
    TAIWAN: 'TW',
    INDIA: 'IN',
    USA: 'US',
    FRANCE: 'FR',
    SPAIN: 'ES',
    MEXICO: 'MX',
    THAILAND: 'TH',
    TURKEY: 'TR',
    UK: 'GB'
};

// Language codes
export const LANGUAGE_CODES = {
    KOREAN: 'ko',
    JAPANESE: 'ja',
    CHINESE: 'zh',
    HINDI: 'hi',
    TAMIL: 'ta',
    TELUGU: 'te',
    ENGLISH: 'en',
    FRENCH: 'fr',
    SPANISH: 'es',
    THAI: 'th',
    TURKISH: 'tr'
};
