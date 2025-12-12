import {
    TMDB_BASE_URL,
    TMDB_IMAGE_BASE_URL
} from '../utils/constants';

// Interfaces for TMDb API responses
export interface Genre {
    id: number;
    name: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export interface Image {
    file_path: string;
    aspect_ratio: number;
    height: number;
    width: number;
}

export interface MovieDetails {
    id: number;
    title: string;
    tagline: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    runtime: number;
    genres: Genre[];
    status: string;
    original_language: string;
    vote_average: number;
    vote_count: number;
    budget: number;
    revenue: number;
}

export interface TVDetails {
    id: number;
    name: string;
    tagline: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    last_air_date: string;
    episode_run_time: number[];
    number_of_seasons: number;
    number_of_episodes: number;
    genres: Genre[];
    status: string;
    original_language: string;
    vote_average: number;
    vote_count: number;
    in_production: boolean;
    type: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface Videos {
    results: Video[];
}

export interface Images {
    backdrops: Image[];
    posters: Image[];
}

export interface RecommendationItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    overview: string;
    media_type?: string;
}

export interface RecommendationResults {
    results: RecommendationItem[];
}

export interface DetailedItemData {
    details: MovieDetails | TVDetails;
    credits: Credits;
    videos: Videos;
    images: Images;
    recommendations: RecommendationResults;
}

class TMDbDetailsService {
    private apiKey: string = 'ad2987c3763f78fc22d170d0baedbfc3';

    constructor() {
        // API key is now hardcoded
    }

    private getApiKey(): string {
        return this.apiKey;
    }

    /**
     * Fetch complete details for a movie including credits, videos, images, and similar items
     */
    async getMovieDetails(id: number): Promise<DetailedItemData> {
        const apiKey = this.getApiKey();

        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos,images,recommendations`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movie details');
            }

            const data = await response.json();

            return {
                details: data,
                credits: data.credits,
                videos: data.videos,
                images: data.images,
                recommendations: data.recommendations
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            throw error;
        }
    }

    /**
     * Fetch complete details for a TV show including credits, videos, images, and recommendations
     */
    async getTVDetails(id: number): Promise<DetailedItemData> {
        const apiKey = this.getApiKey();

        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos,images,recommendations`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch TV details');
            }

            const data = await response.json();

            return {
                details: data,
                credits: data.credits,
                videos: data.videos,
                images: data.images,
                recommendations: data.recommendations
            };
        } catch (error) {
            console.error('Error fetching TV details:', error);
            throw error;
        }
    }

    /**
     * Get details based on media type
     */
    async getDetails(id: number, mediaType: 'movie' | 'tv'): Promise<DetailedItemData> {
        if (mediaType === 'movie') {
            return this.getMovieDetails(id);
        } else {
            return this.getTVDetails(id);
        }
    }

    /**
     * Get the main trailer (YouTube) from videos
     */
    getMainTrailer(videos: Videos): Video | null {
        const youtubeVideos = videos.results.filter(v => v.site === 'YouTube');

        // Prefer official trailers
        const officialTrailer = youtubeVideos.find(
            v => v.type === 'Trailer' && v.official
        );

        if (officialTrailer) return officialTrailer;

        // Fallback to any trailer
        const anyTrailer = youtubeVideos.find(v => v.type === 'Trailer');
        if (anyTrailer) return anyTrailer;

        // Fallback to any video
        return youtubeVideos[0] || null;
    }

    /**
     * Get top cast members (limit to specified count)
     */
    getTopCast(credits: Credits, limit: number = 10): CastMember[] {
        return credits.cast
            .sort((a, b) => a.order - b.order)
            .slice(0, limit);
    }

    /**
     * Get director(s) from crew
     */
    getDirectors(credits: Credits): CrewMember[] {
        return credits.crew.filter(member => member.job === 'Director');
    }

    /**
     * Get writer(s) from crew
     */
    getWriters(credits: Credits): CrewMember[] {
        return credits.crew.filter(
            member => member.job === 'Writer' || member.job === 'Screenplay'
        );
    }

    /**
     * Get profile image URL
     */
    getProfileImageUrl(path: string | null, size: string = 'w185'): string {
        if (!path) return '';
        return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }

    /**
     * Get backdrop image URL
     */
    getBackdropUrl(path: string | null, size: string = 'w1280'): string {
        if (!path) return '';
        return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }

    /**
     * Get poster URL
     */
    getPosterUrl(path: string | null, size: string = 'w500'): string {
        if (!path) return '';
        return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }

    /**
     * Format runtime to hours and minutes
     */
    formatRuntime(minutes: number): string {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    }

    /**
     * Get year from date string
     */
    getYear(dateString: string): string {
        if (!dateString) return '';
        return dateString.split('-')[0];
    }

    /**
     * Get title from details (handles both movie and TV)
     */
    getTitle(details: MovieDetails | TVDetails): string {
        return 'title' in details ? details.title : details.name;
    }

    /**
     * Get release year from details (handles both movie and TV)
     */
    getReleaseYear(details: MovieDetails | TVDetails): string {
        const date = 'release_date' in details
            ? details.release_date
            : details.first_air_date;
        return this.getYear(date);
    }
}

export const tmdbDetailsService = new TMDbDetailsService();
export default tmdbDetailsService;
