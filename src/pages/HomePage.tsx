import React, { useState, useEffect } from 'react';
import { Check, Bookmark } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import WatchedList from '../components/WatchedList';
import ItemDetailsModal from '../components/details/ItemDetailsModal';
import { useWatchedItems } from '../hooks/useWatchedItems';
import storageService, { type WatchedItem } from '../services/storageService';
import { CATEGORIES } from '../utils/constants';

const HomePage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.ALL);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [selectedItem, setSelectedItem] = useState<WatchedItem | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [listType, setListType] = useState<'watched' | 'watchlist'>('watched');

    const { items, isLoading, addItem, removeItem } =
        useWatchedItems(selectedCategory, listType);

    // Initialize storage service
    useEffect(() => {
        storageService.init().catch(console.error);
    }, []);

    // Update category counts based on current list type
    useEffect(() => {
        const updateCounts = async () => {
            const counts: Record<string, number> = {};

            for (const category of Object.values(CATEGORIES)) {
                const count = await storageService.getCountByListTypeAndCategory(listType, category);
                counts[category] = count;
            }

            setCategoryCounts(counts);
        };

        updateCounts();
    }, [items, listType]);

    const handleAddItem = async (item: any) => {
        await addItem(item);
    };

    const handleRemoveItem = async (id: number) => {
        await removeItem(id);
    };

    const handleItemClick = (item: WatchedItem) => {
        setSelectedItem(item);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedItem(null);
    };

    const handleUpdatePersonalData = async (id: number, data: any) => {
        await storageService.updatePersonalData(id, data);
    };

    const handleMoveToWatched = async (id: number) => {
        await storageService.moveToList(id, 'watched');
        window.location.reload(); // Simple refresh for now
    };

    return (
        <div className="home-page">
            <SearchBar onAddItem={handleAddItem} />

            {/* List Type Toggle */}
            <div className="list-toggle">
                <button
                    className={`list-toggle-button ${listType === 'watched' ? 'active' : ''}`}
                    onClick={() => setListType('watched')}
                >
                    <Check size={18} />
                    <span>Watched</span>
                </button>
                <button
                    className={`list-toggle-button ${listType === 'watchlist' ? 'active' : ''}`}
                    onClick={() => setListType('watchlist')}
                >
                    <Bookmark size={18} />
                    <span>Watchlist</span>
                </button>
            </div>

            <CategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                counts={categoryCounts}
            />

            <WatchedList
                items={items}
                isLoading={isLoading}
                onRemove={handleRemoveItem}
                onItemClick={handleItemClick}
                onMoveToWatched={listType === 'watchlist' ? handleMoveToWatched : undefined}
            />

            {selectedItem && (
                <ItemDetailsModal
                    item={selectedItem}
                    isOpen={showDetailsModal}
                    onClose={handleCloseDetailsModal}
                    onUpdate={handleUpdatePersonalData}
                    onAddSimilar={handleAddItem}
                />
            )}
        </div>
    );
};

export default HomePage;
