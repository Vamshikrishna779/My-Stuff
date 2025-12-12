import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import tmdbDetailsService, { type RecommendationResults } from '../../services/tmdbDetailsService';
import storageService from '../../services/storageService';
import './SimilarItemsSection.css';

interface SimilarItemsSectionProps {
    recommendations: RecommendationResults;
    mediaType: 'movie' | 'tv';
    onAdd?: (item: any) => Promise<void>;
    onCardClick?: (id: number, type: 'movie' | 'tv') => void;
}

const SimilarItemsSection: React.FC<SimilarItemsSectionProps> = ({
    recommendations,
    mediaType,
    onAdd,
    onCardClick
}) => {
    const [addedItems, setAddedItems] = useState<Record<number, 'watched' | 'watchlist'>>({});
    const items = recommendations.results.slice(0, 8);

    useEffect(() => {
        const checkExistingItems = async () => {
            const statusMap: Record<number, 'watched' | 'watchlist'> = {};

            for (const item of items) {
                const existingItem = await storageService.findByTmdbId(item.id);
                if (existingItem) {
                    statusMap[item.id] = existingItem.listType;
                }
            }

            setAddedItems(statusMap);
        };

        checkExistingItems();
    }, [items]);

    if (items.length === 0) {
        return null;
    }

    const handleAdd = async (item: any, listType: 'watched' | 'watchlist') => {
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
                listType: listType
            });

            // Show success state
            setAddedItems(prev => ({ ...prev, [item.id]: listType }));

            // Optional: Clear success state after a delay if you want to allow re-adding or just as a momentary feedback
            // setTimeout(() => {
            //     setAddedItems(prev => {
            //         const newState = { ...prev };
            //         delete newState[item.id];
            //         return newState;
            //     });
            // }, 2000);

        } catch (error) {
            console.error('Error adding similar item:', error);
        }
    };

    return (
        <div className="similar-items-section">
            <h2 className="section-title">
                <Sparkles size={24} />
                Recommendations
            </h2>

            <div className="similar-grid">
                {items.map(item => {
                    const title = item.title || item.name;
                    const year = tmdbDetailsService.getYear(item.release_date || item.first_air_date || '');
                    const posterUrl = item.poster_path
                        ? tmdbDetailsService.getPosterUrl(item.poster_path, 'w342')
                        : '';

                    const addedType = addedItems[item.id];

                    return (
                        <motion.div
                            key={item.id}
                            className="similar-card"
                            onClick={() => onCardClick?.(item.id, mediaType)}
                            style={{ cursor: onCardClick ? 'pointer' : 'default' }}
                            whileHover={{ y: -5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="similar-poster">
                                {posterUrl ? (
                                    <img src={posterUrl} alt={title} />
                                ) : (
                                    <div className="similar-placeholder">🎬</div>
                                )}
                                {onAdd && (
                                    <div className="similar-actions">
                                        <motion.button
                                            className={`similar-action-button watched ${addedType === 'watched' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAdd(item, 'watched');
                                            }}
                                            title="Mark as Watched"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {addedType === 'watched' ? <Check size={16} /> : <Check size={16} />}
                                        </motion.button>
                                        <motion.button
                                            className={`similar-action-button watchlist ${addedType === 'watchlist' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAdd(item, 'watchlist');
                                            }}
                                            title="Add to Watchlist"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {addedType === 'watchlist' ? <Check size={16} /> : <Plus size={16} />}
                                        </motion.button>
                                    </div>
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
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimilarItemsSection;
