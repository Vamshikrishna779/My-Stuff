import React from 'react';
import { LayoutGrid, Film, Clapperboard, Tv, MonitorPlay, Zap, Smile, Hash } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import './CategoryTabs.css';

export interface CategoryTab {
    id: string;
    label: string;
    icon?: React.ElementType;
}

interface CategoryTabsProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    counts: Record<string, number>;
    categories?: CategoryTab[]; // Optional prop for dynamic categories
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onCategoryChange, counts, categories: customCategories }) => {
    // Default categories if none provided
    const defaultCategories = [
        { id: CATEGORIES.ALL, label: 'All', icon: LayoutGrid },
        { id: CATEGORIES.MOVIES, label: 'Movies', icon: Film },
        { id: CATEGORIES.ANIMATED, label: 'Animated', icon: Clapperboard },
        { id: CATEGORIES.CARTOON, label: 'Cartoon', icon: Smile },
        { id: CATEGORIES.ANIME, label: 'Anime', icon: Zap },
        { id: CATEGORIES.KDRAMA, label: 'K-Drama', icon: MonitorPlay },
        { id: CATEGORIES.SHOWS, label: 'Shows', icon: Tv },
    ];

    // Use provided categories or fallback to default
    // If customCategories is provided, we assume the parent has already merged them or we should just use them.
    // However, to support the "All" tab always being first, we might want to ensure it's there.
    // For now, let's assume the parent passes the full list including "All" and defaults if they want to mix them.
    // BUT, to make it easier for the parent, let's merge if customCategories is NOT provided, use default.
    // If it IS provided, use it.

    const displayCategories = customCategories || defaultCategories;

    return (
        <div className="category-tabs">
            <div className="tabs-container">
                {displayCategories.map((category) => {
                    const Icon = category.icon || Hash; // Fallback icon
                    return (
                        <button
                            key={category.id}
                            className={`tab-button ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category.id)}
                        >
                            <Icon size={16} />
                            <span>{category.label}</span>
                            {counts[category.id] > 0 && (
                                <span className="tab-badge">{counts[category.id]}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryTabs;
