import React from 'react';
import { LayoutGrid, Film, Clapperboard, Tv, MonitorPlay, Zap, Smile } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import './CategoryTabs.css';

interface CategoryTabsProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    counts: Record<string, number>;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onCategoryChange, counts }) => {
    const categories = [
        { id: CATEGORIES.ALL, label: 'All', icon: LayoutGrid },
        { id: CATEGORIES.MOVIES, label: 'Movies', icon: Film },
        { id: CATEGORIES.ANIMATED, label: 'Animated', icon: Clapperboard },
        { id: CATEGORIES.CARTOON, label: 'Cartoon', icon: Smile },
        { id: CATEGORIES.ANIME, label: 'Anime', icon: Zap },
        { id: CATEGORIES.KDRAMA, label: 'K-Drama', icon: MonitorPlay },
        { id: CATEGORIES.SHOWS, label: 'Shows', icon: Tv },
    ];

    return (
        <div className="category-tabs">
            <div className="tabs-container">
                {categories.map((category) => {
                    const Icon = category.icon;
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
