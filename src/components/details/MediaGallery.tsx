import React, { useState } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import tmdbDetailsService, { type Videos, type Images } from '../../services/tmdbDetailsService';
import './MediaGallery.css';

interface MediaGalleryProps {
    videos: Videos;
    images: Images;
    title: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ videos, images, title }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const trailer = tmdbDetailsService.getMainTrailer(videos);
    const backdrops = images.backdrops.slice(0, 6);

    if (!trailer && backdrops.length === 0) {
        return null;
    }

    return (
        <div className="media-gallery-section">
            <h2 className="section-title">
                <Film size={24} />
                Media
            </h2>

            {/* Trailer */}
            {trailer && (
                <div className="trailer-container">
                    <h3>Trailer</h3>
                    <div className="trailer-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title={`${title} Trailer`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* Backdrops */}
            {backdrops.length > 0 && (
                <div className="backdrops-container">
                    <h3>
                        <ImageIcon size={20} />
                        Images
                    </h3>
                    <div className="backdrops-grid">
                        {backdrops.map((image, index) => (
                            <div
                                key={index}
                                className="backdrop-item"
                                onClick={() => setSelectedImage(tmdbDetailsService.getBackdropUrl(image.file_path, 'original'))}
                            >
                                <img
                                    src={tmdbDetailsService.getBackdropUrl(image.file_path, 'w780')}
                                    alt={`${title} backdrop ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="image-lightbox" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full size" />
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
