import React, { useState } from 'react';
import { Star, Calendar, Tag, Save } from 'lucide-react';
import { format } from 'date-fns';
import type { WatchedItem } from '../../services/storageService';
import './PersonalDataSection.css';

interface PersonalDataSectionProps {
    item: WatchedItem;
    onUpdate: (data: any) => Promise<void>;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ item, onUpdate }) => {
    const [rating, setRating] = useState(item.personalRating || 0);
    const [notes, setNotes] = useState(item.personalNotes || '');
    const [watchDate, setWatchDate] = useState(
        item.watchDate ? format(new Date(item.watchDate), 'yyyy-MM-dd') : ''
    );
    const [tags, setTags] = useState<string[]>(item.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            await onUpdate({
                personalRating: rating || undefined,
                personalNotes: notes || undefined,
                watchDate: watchDate ? new Date(watchDate).getTime() : undefined,
                tags: tags.length > 0 ? tags : undefined
            });
            setSaveMessage('✓ Saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('✗ Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="personal-data-section">
            <h2 className="section-title">
                <Star size={24} />
                Your Notes & Rating
            </h2>

            <div className="personal-form">
                {/* Rating */}
                <div className="form-group">
                    <label>
                        <Star size={16} />
                        Rating (0-10)
                    </label>
                    <div className="rating-input">
                        {[...Array(11)].map((_, i) => (
                            <button
                                key={i}
                                className={`rating-button ${rating === i ? 'active' : ''}`}
                                onClick={() => setRating(i)}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Watch Date */}
                <div className="form-group">
                    <label>
                        <Calendar size={16} />
                        Watch Date
                    </label>
                    <input
                        type="date"
                        value={watchDate}
                        onChange={(e) => setWatchDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                {/* Tags */}
                <div className="form-group">
                    <label>
                        <Tag size={16} />
                        Tags
                    </label>
                    <div className="tags-container">
                        <div className="tags-list">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)}>×</button>
                                </span>
                            ))}
                        </div>
                        <div className="tag-input-wrapper">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a tag..."
                                className="tag-input"
                            />
                            <button onClick={handleAddTag} className="add-tag-button">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Your thoughts, memories, or comments..."
                        className="notes-textarea"
                        rows={4}
                    />
                </div>

                {/* Save Button */}
                <div className="form-actions">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="save-button"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {saveMessage && (
                        <span className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
                            {saveMessage}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalDataSection;
