import React, { useState } from 'react';
import { Search, Loader2, Film, WifiOff, AlertTriangle, Check, Bookmark } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { CATEGORIES, CATEGORY_LABELS } from '../utils/constants';
import './SearchBar.css';

interface SearchBarProps {
    onAddItem: (item: any) => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onAddItem }) => {
    const { query, setQuery, results, isLoading, error, isOnline, clearResults } = useSearch();
    const [showResults, setShowResults] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({});

    const handleCategoryChange = (tmdbId: number, category: string) => {
        setSelectedCategories(prev => ({
            ...prev,
            [tmdbId]: category
        }));
    };

    const handleAddClick = async (item: any, listType: 'watched' | 'watchlist' = 'watched') => {
        setAddingId(item.tmdbId);
        try {
            // Use manually selected category if available, otherwise use auto-detected category
            const categoryToUse = selectedCategories[item.tmdbId] || item.category;
            const itemToAdd = {
                ...item,
                category: categoryToUse,
                listType // Add listType to the item
            };
            await onAddItem(itemToAdd);
            clearResults();
            setShowResults(false);
            setQuery('');
            setSelectedCategories({});
        } catch (err: any) {
            alert(err.message || 'Failed to add item');
        } finally {
            setAddingId(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowResults(true);
    };

    const handleBlur = () => {
        // Delay to allow click on results
        setTimeout(() => setShowResults(false), 300);
    };

    const handleFocus = () => {
        if (results.length > 0) {
            setShowResults(true);
        }
    };

    // Get selectable categories (exclude 'all')
    const selectableCategories = Object.entries(CATEGORIES)
        .filter(([key]) => key !== 'ALL')
        .map(([key, value]) => ({ key, value, label: CATEGORY_LABELS[value] }));

    return (
        <div className="search-container">
            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">
                        <Search size={20} />
                    </span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search movies, anime, shows..."
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    {isLoading && (
                        <span className="loading-spinner">
                            <Loader2 size={20} className="animate-spin" />
                        </span>
                    )}
                </div>

                {!isOnline && (
                    <div className="search-message offline-message">
                        <WifiOff size={16} />
                        <span>You're offline. Search is unavailable.</span>
                    </div>
                )}

                {error && (
                    <div className="search-message error-message">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {showResults && results.length > 0 && (
                    <div className="search-results">
                        {results.map(item => (
                            <div key={item.tmdbId} className="search-result-item">
                                <div className="result-poster">
                                    {item.posterUrl ? (
                                        <img src={item.posterUrl} alt={item.title} />
                                    ) : (
                                        <div className="poster-placeholder">
                                            <Film size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="result-info">
                                    <div className="result-title">{item.title}</div>
                                    <div className="result-meta">
                                        {item.year && <span className="result-year">{item.year}</span>}
                                        <span className={`result-type ${item.category}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="category-selector">
                                        <select
                                            id={`category-${item.tmdbId}`}
                                            className="category-select"
                                            value={selectedCategories[item.tmdbId] || item.category}
                                            onChange={(e) => handleCategoryChange(item.tmdbId, e.target.value)}
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            {selectableCategories.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Dual Action Buttons */}
                                <div className="result-actions">
                                    <button
                                        className="add-button watched"
                                        onClick={() => handleAddClick(item, 'watched')}
                                        disabled={addingId === item.tmdbId}
                                        title="Add to Watched"
                                    >
                                        <Check size={16} />
                                        <span>Watched</span>
                                    </button>
                                    <button
                                        className="add-button watchlist"
                                        onClick={() => handleAddClick(item, 'watchlist')}
                                        disabled={addingId === item.tmdbId}
                                        title="Add to Watchlist"
                                    >
                                        <Bookmark size={16} />
                                        <span>Watchlist</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showResults && query && !isLoading && results.length === 0 && !error && (
                    <div className="search-results">
                        <div className="no-results">
                            No results found for "{query}"
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
