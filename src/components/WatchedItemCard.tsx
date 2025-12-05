import React, { useState } from 'react';
import { Check, X, Film } from 'lucide-react';
import { type WatchedItem } from '../services/storageService';
import './WatchedItemCard.css';

interface WatchedItemCardProps {
    item: WatchedItem;
    onRemove: (id: number) => Promise<void>;
    onCardClick?: () => void;
    onMoveToWatched?: (id: number) => Promise<void>; // NEW: Move from watchlist to watched
}

const WatchedItemCard: React.FC<WatchedItemCardProps> = ({ item, onRemove, onCardClick, onMoveToWatched }) => {
    const [isRemoving, setIsRemoving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRemoveClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmRemove = async () => {
        setIsRemoving(true);
        try {
            await onRemove(item.id!);
        } catch (err) {
            alert('Failed to remove item');
            setIsRemoving(false);
            setShowConfirm(false);
        }
    };

    const handleCancelRemove = () => {
        setShowConfirm(false);
    };

    const handleMoveToWatched = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!item.id || !onMoveToWatched) return;

        try {
            await onMoveToWatched(item.id);
        } catch (error) {
            console.error('Failed to move item:', error);
        }
    };

    return (
        <div
            className={`watched-item-card ${isRemoving ? 'removing' : ''}`}
            onClick={onCardClick}
            style={{ cursor: onCardClick ? 'pointer' : 'default' }}
        >
            <div className="item-poster">
                {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title} loading="lazy" />
                ) : (
                    <div className="poster-placeholder-large">
                        <Film size={48} />
                    </div>
                )}

                {/* Regional Badge */}
                {item.originCountry && (
                    <div className="regional-badge" data-region={item.originCountry}>
                        {item.originCountry === 'US' && 'Hollywood'}
                        {item.originCountry === 'IN' && 'Indian'}
                        {item.originCountry === 'KR' && 'Korean'}
                        {item.originCountry === 'JP' && 'Japanese'}
                        {item.originCountry === 'CN' && 'Chinese'}
                        {item.originCountry === 'HK' && 'Hong Kong'}
                        {item.originCountry === 'TW' && 'Taiwan'}
                        {item.originCountry === 'FR' && 'French'}
                        {item.originCountry === 'ES' && 'Spanish'}
                        {item.originCountry === 'MX' && 'Mexican'}
                        {item.originCountry === 'TH' && 'Thai'}
                        {item.originCountry === 'TR' && 'Turkish'}
                        {item.originCountry === 'GB' && 'British'}
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
                        onClick={(e) => { e.stopPropagation(); handleRemoveClick(); }}
                        disabled={isRemoving}
                        title="Remove from list"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
            <div className="item-details">
                <div className="item-title" title={item.title}>
                    {item.title}
                </div>
                <div className="item-meta">
                    {item.year && <span className="item-year">{item.year}</span>}
                    <span className={`item-category ${item.category}`}>
                        {item.category}
                    </span>
                </div>
            </div>

            {showConfirm && (
                <div className="confirm-dialog">
                    <div className="confirm-content">
                        <p className="confirm-text">Remove this item?</p>
                        <div className="confirm-actions">
                            <button
                                className="confirm-button cancel"
                                onClick={handleCancelRemove}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-button remove"
                                onClick={handleConfirmRemove}
                                disabled={isRemoving}
                            >
                                {isRemoving ? '...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchedItemCard;
