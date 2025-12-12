import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Bookmark, Save, ArrowLeft, Film } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '../utils/constants';
import storageService from '../services/storageService';
import './ItemAssignmentPage.css';

const ItemAssignmentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item;

    const [listType, setListType] = useState<'watched' | 'watchlist'>('watched');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [customCategory, setCustomCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!item) {
            navigate('/');
            return;
        }
        // Pre-fill category if it matches a standard one
        if (Object.values(CATEGORIES).includes(item.category)) {
            setSelectedCategory(item.category);
        } else {
            setSelectedCategory('custom');
            setCustomCategory(item.category);
        }
    }, [item, navigate]);

    const handleSave = async () => {
        if (!item) return;
        setIsSaving(true);

        try {
            const finalCategory = selectedCategory === 'custom' ? customCategory : selectedCategory;

            if (!finalCategory.trim()) {
                alert('Please select or enter a category');
                setIsSaving(false);
                return;
            }

            const itemToAdd = {
                ...item,
                category: finalCategory,
                listType,
                addedDate: Date.now()
            };

            await storageService.addItem(itemToAdd);
            navigate('/');
        } catch (error: any) {
            console.error('Failed to save item:', error);
            alert(error.message || 'Failed to save item');
            setIsSaving(false);
        }
    };

    if (!item) return null;

    return (
        <div className="assignment-page">
            <header className="assignment-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Add to My Stuff</h1>
            </header>

            <div className="assignment-content">
                <div className="item-preview">
                    <div className="preview-poster">
                        {item.posterUrl ? (
                            <img src={item.posterUrl} alt={item.title} />
                        ) : (
                            <div className="poster-placeholder">
                                <Film size={48} />
                            </div>
                        )}
                    </div>
                    <div className="preview-info">
                        <h2>{item.title}</h2>
                        <div className="preview-meta">
                            {item.year && <span className="meta-year">{item.year}</span>}
                            <span className="meta-type">{item.type === 'tv' ? 'TV Show' : 'Movie'}</span>
                        </div>
                        {item.overview && <p className="preview-overview">{item.overview}</p>}
                    </div>
                </div>

                <div className="assignment-form">
                    <div className="form-section">
                        <label>Select List</label>
                        <div className="list-toggle-group">
                            <button
                                className={`toggle-btn ${listType === 'watched' ? 'active watched' : ''}`}
                                onClick={() => setListType('watched')}
                            >
                                <Check size={20} />
                                <span>Watched</span>
                            </button>
                            <button
                                className={`toggle-btn ${listType === 'watchlist' ? 'active watchlist' : ''}`}
                                onClick={() => setListType('watchlist')}
                            >
                                <Bookmark size={20} />
                                <span>Watchlist</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Category</label>
                        <select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {Object.entries(CATEGORY_LABELS)
                                .filter(([key]) => key !== 'all')
                                .map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))
                            }
                            <option value="custom">+ Custom Category</option>
                        </select>
                    </div>

                    {selectedCategory === 'custom' && (
                        <div className="form-section fade-in">
                            <label>Custom Category Name</label>
                            <input
                                type="text"
                                className="custom-input"
                                placeholder="e.g., Thriller, Documentary..."
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Save Item</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemAssignmentPage;
