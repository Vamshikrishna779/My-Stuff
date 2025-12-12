import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tmdbDetailsService, { type DetailedItemData } from '../../services/tmdbDetailsService';
import type { WatchedItem } from '../../services/storageService';
import BasicInfoSection from './BasicInfoSection';
import CastCrewSection from './CastCrewSection';
import MediaGallery from './MediaGallery';
import PersonalDataSection from './PersonalDataSection';
import SimilarItemsSection from './SimilarItemsSection';
import './ItemDetailsModal.css';

interface ItemDetailsModalProps {
    item: WatchedItem;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: any) => Promise<void>;
    onAddSimilar?: (item: any) => Promise<void>;
    onNavigate?: (item: WatchedItem) => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
    item,
    isOpen,
    onClose,
    onUpdate,
    onAddSimilar,
    onNavigate
}) => {
    const [detailsData, setDetailsData] = useState<DetailedItemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && item) {
            loadDetails();
        }
    }, [isOpen, item]);

    const loadDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await tmdbDetailsService.getDetails(item.tmdbId, item.type as 'movie' | 'tv');
            setDetailsData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load details');
            console.error('Error loading details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonalDataUpdate = async (data: any) => {
        if (item.id) {
            await onUpdate(item.id, data);
        }
    };

    const handleClose = () => {
        setDetailsData(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const backdropUrl = detailsData?.details.backdrop_path
        ? tmdbDetailsService.getBackdropUrl(detailsData.details.backdrop_path)
        : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={handleClose}>
                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button className="modal-close-button" onClick={handleClose} aria-label="Close">
                            <X size={24} />
                        </button>

                        {/* Backdrop Header */}
                        {backdropUrl && (
                            <div className="modal-backdrop">
                                <img src={backdropUrl} alt={item.title} />
                                <div className="backdrop-overlay" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="modal-content">
                            {isLoading && (
                                <div className="modal-loading">
                                    <div className="loading-spinner-large">⏳</div>
                                    <p>Loading details...</p>
                                </div>
                            )}

                            {error && (
                                <div className="modal-error">
                                    <p>⚠️ {error}</p>
                                    <button onClick={loadDetails} className="retry-button">
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isLoading && !error && detailsData && (
                                <>
                                    <BasicInfoSection
                                        details={detailsData.details}
                                    />

                                    <CastCrewSection credits={detailsData.credits} />

                                    <MediaGallery
                                        videos={detailsData.videos}
                                        images={detailsData.images}
                                        title={item.title}
                                    />

                                    <PersonalDataSection
                                        item={item}
                                        onUpdate={handlePersonalDataUpdate}
                                    />

                                    <SimilarItemsSection
                                        recommendations={detailsData.recommendations}
                                        mediaType={item.type as 'movie' | 'tv'}
                                        onAdd={onAddSimilar}
                                        onCardClick={(id, type) => {
                                            if (onNavigate) {
                                                const tempItem: WatchedItem = {
                                                    ...item,
                                                    id: undefined,
                                                    tmdbId: id,
                                                    type: type,
                                                    title: 'Loading...',
                                                    posterUrl: '',
                                                    year: '',
                                                    addedDate: Date.now(),
                                                    category: 'movies',
                                                    listType: 'watchlist'
                                                };
                                                onNavigate(tempItem);
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ItemDetailsModal;
