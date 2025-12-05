import React from 'react';
import { Tv, Loader2 } from 'lucide-react';
import { type WatchedItem } from '../services/storageService';
import WatchedItemCard from './WatchedItemCard';
import './WatchedList.css';

interface WatchedListProps {
    items: WatchedItem[];
    isLoading: boolean;
    onRemove: (id: number) => Promise<void>;
    onItemClick?: (item: WatchedItem) => void;
    onMoveToWatched?: (id: number) => Promise<void>;
}

const WatchedList: React.FC<WatchedListProps> = ({ items, isLoading, onRemove, onItemClick, onMoveToWatched }) => {
    if (isLoading) {
        return (
            <div className="watched-list-container">
                <div className="loading-state">
                    <div className="loading-spinner-large">
                        <Loader2 size={48} className="animate-spin" />
                    </div>
                    <p>Loading your watched items...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="watched-list-container">
                <div className="empty-state">
                    <div className="empty-icon">
                        <Tv size={64} strokeWidth={1.5} />
                    </div>
                    <h3>No items yet</h3>
                    <p>Search and add movies, anime, shows, or K-dramas you've watched!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="watched-list-container">
            <div className="watched-grid">
                {items.map(item => (
                    <WatchedItemCard
                        key={item.id}
                        item={item}
                        onRemove={onRemove}
                        onCardClick={() => onItemClick?.(item)}
                        onMoveToWatched={onMoveToWatched}
                    />
                ))}
            </div>
        </div>
    );
};

export default WatchedList;
