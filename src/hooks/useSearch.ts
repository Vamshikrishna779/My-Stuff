import { useState, useEffect, useCallback } from 'react';
import tmdbService from '../services/tmdbService';

interface SearchResult {
    tmdbId: number;
    title: string;
    type: string;
    category: string;
    year: string;
    posterUrl: string;
    overview?: string;
}

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const search = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        if (!tmdbService.hasApiKey()) {
            setError('Please set your TMDb API key in settings');
            setResults([]);
            return;
        }

        if (!isOnline) {
            setError('You are offline. Search is unavailable.');
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const searchResults = await tmdbService.searchMulti(searchQuery);
            setResults(searchResults);
        } catch (err) {
            setError('Failed to search. Please try again.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [isOnline]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            search(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search]);

    const clearResults = () => {
        setResults([]);
        setQuery('');
        setError(null);
    };

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        isOnline,
        clearResults
    };
};
