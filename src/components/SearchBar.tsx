import React, { useState } from 'react';
import { Search, Loader2, Film, WifiOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import './SearchBar.css';

interface SearchBarProps {
    onItemClick?: (item: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onItemClick }) => {
    const { query, setQuery, results, isLoading, error, isOnline, clearResults } = useSearch();
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const handleSelectClick = (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        clearResults();
        setQuery('');
        setShowResults(false);
        navigate('/assign-item', { state: { item } });
    };

    const handleRowClick = (item: any) => {
        if (onItemClick) {
            onItemClick(item);
            clearResults();
            setQuery('');
            setShowResults(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowResults(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowResults(false), 300);
    };

    const handleFocus = () => {
        if (results.length > 0) {
            setShowResults(true);
        }
    };

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
                            <div
                                key={item.tmdbId}
                                className="search-result-item"
                                onClick={() => handleRowClick(item)}
                            >
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
                                </div>

                                <div className="result-actions">
                                    <button
                                        className="select-button"
                                        onClick={(e) => handleSelectClick(e, item)}
                                        title="Select Item"
                                    >
                                        <span>Select</span>
                                        <ArrowRight size={16} />
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
