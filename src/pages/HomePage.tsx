import React, { useState, useEffect } from 'react';
import {
    Check,
    Bookmark,
    LayoutGrid,
    Film,
    Clapperboard,
    Tv,
    MonitorPlay,
    Zap,
    Smile,
    Hash
} from 'lucide-react';

import SearchBar from '../components/SearchBar';
import CategoryTabs, { type CategoryTab } from '../components/CategoryTabs';
import WatchedList from '../components/WatchedList';
import ItemDetailsModal from '../components/details/ItemDetailsModal';
import OpeningAnimation from '../components/OpeningAnimation';
import { useWatchedItems } from '../hooks/useWatchedItems';
import storageService, { type WatchedItem } from '../services/storageService';
import { CATEGORIES } from '../utils/constants';

const HomePage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.ALL);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [selectedItem, setSelectedItem] = useState<WatchedItem | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [listType, setListType] = useState<'watched' | 'watchlist'>('watched');
    const [dynamicCategories, setDynamicCategories] = useState<CategoryTab[]>([]);

    // Animation state
    const [showAnimation, setShowAnimation] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return !sessionStorage.getItem('hasShownOpeningAnimation');
    });
    const [animationPosters, setAnimationPosters] = useState<string[]>([]);

    const { items, isLoading, addItem, removeItem } =
        useWatchedItems(selectedCategory, listType);

    // 1️⃣ Init + prepare posters for opening animation
    useEffect(() => {
        const init = async () => {
            await storageService.init();

            const hasShownAnimation = sessionStorage.getItem('hasShownOpeningAnimation');
            if (hasShownAnimation) {
                setShowAnimation(false);
                return;
            }

            const allItems = await storageService.getAllItems();
            const posters = allItems
                .filter(item => item.posterUrl)
                .map(item => item.posterUrl as string)
                .slice(0, 20);

            if (posters.length > 0) {
                setAnimationPosters(posters);
                setShowAnimation(true);
            } else {
                // If no posters, don't bother with animation
                setShowAnimation(false);
                sessionStorage.setItem('hasShownOpeningAnimation', 'true');
            }
        };

        void init();
    }, []);

    // 2️⃣ Calculate dynamic categories + counts
    useEffect(() => {
        const updateData = async () => {
            const allItems = await storageService.getAllItems();
            const uniqueCategories = new Set<string>();
            const counts: Record<string, number> = {};

            // Init default category counts
            Object.values(CATEGORIES).forEach(cat => {
                counts[cat] = 0;
            });

            allItems.forEach(item => {
                if (item.listType === listType) {
                    uniqueCategories.add(item.category);
                    counts[item.category] = (counts[item.category] || 0) + 1;
                    counts[CATEGORIES.ALL] = (counts[CATEGORIES.ALL] || 0) + 1;
                }
            });

            setCategoryCounts(counts);

            const defaultCats: CategoryTab[] = [
                { id: CATEGORIES.ALL, label: 'All', icon: LayoutGrid },
                { id: CATEGORIES.MOVIES, label: 'Movies', icon: Film },
                { id: CATEGORIES.ANIMATED, label: 'Animated', icon: Clapperboard },
                { id: CATEGORIES.CARTOON, label: 'Cartoon', icon: Smile },
                { id: CATEGORIES.ANIME, label: 'Anime', icon: Zap },
                { id: CATEGORIES.KDRAMA, label: 'K-Drama', icon: MonitorPlay },
                { id: CATEGORIES.SHOWS, label: 'Shows', icon: Tv }
            ];

            const defaultIds = new Set(defaultCats.map(c => c.id));
            const customCats: CategoryTab[] = [];

            uniqueCategories.forEach(cat => {
                if (!defaultIds.has(cat)) {
                    customCats.push({
                        id: cat,
                        label: cat.charAt(0).toUpperCase() + cat.slice(1),
                        icon: Hash
                    });
                }
            });

            setDynamicCategories([...defaultCats, ...customCats]);
        };

        void updateData();
    }, [items, listType]);

    const handleAnimationComplete = () => {
        sessionStorage.setItem('hasShownOpeningAnimation', 'true');
        setShowAnimation(false);
    };

    // 3️⃣ EARLY RETURN – AFTER all hooks
    if (showAnimation) {
        return (
            <OpeningAnimation
                posters={animationPosters}
                onComplete={handleAnimationComplete}
            />
        );
    }

    // 4️⃣ Normal page render after animation
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
        window.location.reload();
    };

    return (
        <div className="home-page">
            <SearchBar onItemClick={handleItemClick} />

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
                categories={dynamicCategories}
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
                    key={selectedItem.tmdbId || selectedItem.id}
                    item={selectedItem}
                    isOpen={showDetailsModal}
                    onClose={handleCloseDetailsModal}
                    onUpdate={handleUpdatePersonalData}
                    onAddSimilar={handleAddItem}
                    onNavigate={setSelectedItem}
                />
            )}
        </div>
    );
};

export default HomePage;
