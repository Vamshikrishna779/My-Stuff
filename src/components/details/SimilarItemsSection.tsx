import React from 'react';
import { Sparkles } from 'lucide-react';
import tmdbDetailsService, { type SimilarResults } from '../../services/tmdbDetailsService';
import './SimilarItemsSection.css';

interface SimilarItemsSectionProps {
    similar: SimilarResults;
    mediaType: 'movie' | 'tv';
    onAdd?: (item: any) => Promise<void>;
}

const SimilarItemsSection: React.FC<SimilarItemsSectionProps> = ({
    similar,
    mediaType,
    onAdd
}) => {
    const similarItems = similar.results.slice(0, 8);

    if (similarItems.length === 0) {
        return null;
    }

    const handleAdd = async (item: any) => {
        if (!onAdd) return;

        const title = item.title || item.name;
        const year = tmdbDetailsService.getYear(item.release_date || item.first_air_date || '');
        const posterUrl = tmdbDetailsService.getPosterUrl(item.poster_path);

        try {
            await onAdd({
                tmdbId: item.id,
                title,
                type: mediaType,
                year,
                posterUrl,
                category: 'movies', // Will be auto-categorized
                overview: item.overview,
                listType: 'watchlist' // Add to watchlist by default
            });
        } catch (error) {
            console.error('Error adding similar item:', error);
        }
    };

    return (
        <div className="similar-items-section">
            <h2 className="section-title">
                <Sparkles size={24} />
                Similar Titles
            </h2>

            <div className="similar-grid">
                {similarItems.map(item => {
                    const title = item.title || item.name;
                    const year = tmdbDetailsService.getYear(item.release_date || item.first_air_date || '');
                    const posterUrl = item.poster_path
                        ? tmdbDetailsService.getPosterUrl(item.poster_path, 'w342')
                        : '';

                    return (
                        <div key={item.id} className="similar-card">
                            <div className="similar-poster">
                                {posterUrl ? (
                                    <img src={posterUrl} alt={title} />
                                ) : (
                                    <div className="similar-placeholder">🎬</div>
                                )}
                                {onAdd && (
                                    <button
                                        className="similar-add-button"
                                        onClick={() => handleAdd(item)}
                                        title="Add to watchlist"
                                    >
                                        📌
                                    </button>
                                )}
                            </div>
                            <div className="similar-info">
                                <p className="similar-title">{title}</p>
                                <p className="similar-year">{year}</p>
                                {item.vote_average > 0 && (
                                    <p className="similar-rating">
                                        ⭐ {item.vote_average.toFixed(1)}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimilarItemsSection;
