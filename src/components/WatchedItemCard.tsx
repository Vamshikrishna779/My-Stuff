import React, { useState } from 'react';
import { Check, X, Film } from 'lucide-react';
import { type WatchedItem } from '../services/storageService';
import './WatchedItemCard.css';

interface WatchedItemCardProps {
    item: WatchedItem;
    onRemove: (id: number) => Promise<void>;
    onCardClick?: () => void;
    onMoveToWatched?: (id: number) => Promise<void>;
}

const WatchedItemCard: React.FC<WatchedItemCardProps> = ({ item, onRemove, onCardClick, onMoveToWatched }) => {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveClick = async () => {
        setIsRemoving(true);
        try {
            await onRemove(item.id!);
        } catch (err) {
            console.error('Failed to remove item', err);
            setIsRemoving(false);
        }
    };

    const handleMoveToWatched = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!item.id || !onMoveToWatched) return;

        try {
            await onMoveToWatched(item.id);
        } catch (error) {
            console.error('Failed to move item:', error);
        }
    };

    return (
        <div className={`watched-item-card ${isRemoving ? 'removing' : ''}`}>
            <div className="item-poster">
                {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title} loading="lazy" />
                ) : (
                    <div className="poster-placeholder-large">
                        <Film size={48} />
                    </div>
                )}

                {/* Regional Badge */}
                {/* Regional Badge */}
                {item.originCountry && (
                    <div className="regional-badge" data-region={item.originCountry}>
                        {(() => {
                            const regionNames: Record<string, string> = {
                                'US': 'Hollywood',
                                'GB': 'British',
                                'IN': 'Indian',
                                'KR': 'Korean',
                                'JP': 'Japanese',
                                'CN': 'Chinese',
                                'HK': 'Hong Kong',
                                'TW': 'Taiwan',
                                'FR': 'French',
                                'ES': 'Spanish',
                                'MX': 'Mexican',
                                'TH': 'Thai',
                                'TR': 'Turkish',
                                'TE': 'Telugu',
                                'TA': 'Tamil',
                                'HI': 'Hindi',
                                'KN': 'Kannada',
                                'ML': 'Malayalam'
                            };
                            return regionNames[item.originCountry] || item.originCountry;
                        })()}
                    </div>
                )}

                <div className="item-overlay">
                    {item.listType === 'watchlist' && onMoveToWatched && (
                        <button
                            className="move-to-watched-button"
                            onClick={handleMoveToWatched}
                            title="Mark as watched"
                        >
                            <Check size={20} />
                        </button>
                    )}
                    <button
                        className="remove-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClick();
                        }}
                        disabled={isRemoving}
                        title="Remove from list"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div
                className="item-details"
                onClick={onCardClick}
                title="View Details"
            >
                <div className="item-title">
                    {item.title}
                </div>
                <div className="item-meta">
                    {item.year && <span className="item-year">{item.year}</span>}
                    <span className={`item-category ${item.category}`}>
                        {item.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WatchedItemCard;
