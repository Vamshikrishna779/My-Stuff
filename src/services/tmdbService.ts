import {
    TMDB_BASE_URL,
    TMDB_IMAGE_BASE_URL,
    TMDB_POSTER_SIZE,
    MEDIA_TYPES,
    ANIME_GENRE_ID,
    ORIGIN_COUNTRIES,
    LANGUAGE_CODES,
    CATEGORIES
} from '../utils/constants';

interface TMDbSearchResult {
    id: number;
    title?: string;
    name?: string;
    media_type: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
    genre_ids?: number[];
    origin_country?: string[];
    original_language?: string;
    overview?: string;
}

interface TMDbResponse {
    results: TMDbSearchResult[];
}

interface ProcessedItem {
    tmdbId: number;
    title: string;
    type: string;
    category: string;
    year: string;
    posterUrl: string;
    overview?: string;
    originCountry?: string; // Store origin for regional badge
}

class TMDbService {
    private apiKey: string = import.meta.env.VITE_TMDB_API_KEY || '';

    constructor() {
        if (!this.apiKey) {
            console.warn('TMDb API key is missing. Check your environment variables.');
        }
    }

    // Deprecated but kept for compatibility if needed, though effectively no-op or read-only
    setApiKey(): void {
        console.warn('API key is now managed globally and cannot be changed by user.');
    }

    getApiKey(): string {
        return this.apiKey;
    }

    hasApiKey(): boolean {
        return true;
    }

    async searchMulti(query: string): Promise<ProcessedItem[]> {
        if (!this.apiKey) {
            throw new Error('TMDb API key not set');
        }

        if (!query.trim()) {
            return [];
        }

        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=en-US`
            );

            if (!response.ok) {
                throw new Error('Failed to search TMDb');
            }

            const data: TMDbResponse = await response.json();

            // Filter only movies and TV shows, then process them
            const filtered = data.results.filter(
                item => item.media_type === MEDIA_TYPES.MOVIE || item.media_type === MEDIA_TYPES.TV
            );

            return filtered.map(item => this.processSearchResult(item));
        } catch (error) {
            console.error('TMDb search error:', error);
            throw error;
        }
    }

    private processSearchResult(item: TMDbSearchResult): ProcessedItem {
        const title = item.title || item.name || 'Unknown';
        const year = this.extractYear(item.release_date || item.first_air_date || '');
        const posterUrl = item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.poster_path}`
            : '';

        const category = this.categorizeByType(item);
        const originCountry = item.origin_country?.[0] || '';

        return {
            tmdbId: item.id,
            title,
            type: item.media_type,
            category,
            year,
            posterUrl,
            overview: item.overview,
            originCountry // Store for regional badge
        };
    }

    private categorizeByType(item: TMDbSearchResult): string {
        const originCountry = item.origin_country?.[0] || '';
        const originalLanguage = item.original_language || '';
        const genres = item.genre_ids || [];

        // Anime (Japanese animation)
        if (genres.includes(ANIME_GENRE_ID) &&
            (originCountry === ORIGIN_COUNTRIES.JAPAN || originalLanguage === LANGUAGE_CODES.JAPANESE)) {
            return CATEGORIES.ANIME;
        }

        // K-Drama (Korean TV shows)
        if (item.media_type === MEDIA_TYPES.TV &&
            (originCountry === ORIGIN_COUNTRIES.KOREA || originalLanguage === LANGUAGE_CODES.KOREAN)) {
            return CATEGORIES.KDRAMA;
        }

        // Cartoon (Western animation TV shows)
        if (item.media_type === MEDIA_TYPES.TV && genres.includes(ANIME_GENRE_ID)) {
            return CATEGORIES.CARTOON;
        }

        // Animated (Animation movies - non-Japanese)
        if (item.media_type === MEDIA_TYPES.MOVIE && genres.includes(ANIME_GENRE_ID)) {
            return CATEGORIES.ANIMATED;
        }

        // Movies
        if (item.media_type === MEDIA_TYPES.MOVIE) {
            return CATEGORIES.MOVIES;
        }

        // TV Shows / Web Series
        if (item.media_type === MEDIA_TYPES.TV) {
            return CATEGORIES.SHOWS;
        }

        return CATEGORIES.SHOWS;
    }

    private extractYear(dateString: string): string {
        if (!dateString) return '';
        return dateString.split('-')[0];
    }

    getPosterUrl(posterPath: string | null, size: string = TMDB_POSTER_SIZE): string {
        if (!posterPath) return '';
        return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
    }
}

export const tmdbService = new TMDbService();
export default tmdbService;
