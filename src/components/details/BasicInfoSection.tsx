import React from 'react';
import { Calendar, Clock, Star, Globe } from 'lucide-react';
import tmdbDetailsService, { type MovieDetails, type TVDetails } from '../../services/tmdbDetailsService';
import './BasicInfoSection.css';

interface BasicInfoSectionProps {
    details: MovieDetails | TVDetails;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ details }) => {
    const isMovie = 'title' in details;
    const title = tmdbDetailsService.getTitle(details);
    const year = tmdbDetailsService.getReleaseYear(details);
    const posterUrl = tmdbDetailsService.getPosterUrl(details.poster_path, 'w500');

    const runtime = isMovie
        ? tmdbDetailsService.formatRuntime((details as MovieDetails).runtime)
        : details.episode_run_time?.[0]
            ? `${details.episode_run_time[0]}m/ep`
            : 'N/A';

    const episodeInfo = !isMovie
        ? `${(details as TVDetails).number_of_seasons} Seasons, ${(details as TVDetails).number_of_episodes} Episodes`
        : null;

    return (
        <div className="basic-info-section">
            <div className="info-poster">
                {posterUrl ? (
                    <img src={posterUrl} alt={title} />
                ) : (
                    <div className="poster-placeholder-detail">🎬</div>
                )}
            </div>

            <div className="info-details">
                <h1 className="info-title">{title}</h1>

                {details.tagline && (
                    <p className="info-tagline">"{details.tagline}"</p>
                )}

                <div className="info-meta">
                    <span className="meta-item">
                        <Calendar size={16} />
                        {year}
                    </span>

                    <span className="meta-item">
                        <Clock size={16} />
                        {runtime}
                    </span>

                    {details.vote_average > 0 && (
                        <span className="meta-item">
                            <Star size={16} fill="currentColor" />
                            {details.vote_average.toFixed(1)}
                        </span>
                    )}

                    <span className="meta-item">
                        <Globe size={16} />
                        {details.original_language.toUpperCase()}
                    </span>
                </div>

                {episodeInfo && (
                    <p className="episode-info">{episodeInfo}</p>
                )}

                <div className="info-genres">
                    {details.genres.map(genre => (
                        <span key={genre.id} className="genre-badge">
                            {genre.name}
                        </span>
                    ))}
                </div>

                <div className="info-status">
                    <span className={`status-badge ${details.status.toLowerCase()}`}>
                        {details.status}
                    </span>
                </div>

                <div className="info-overview">
                    <h3>Overview</h3>
                    <p>{details.overview || 'No overview available.'}</p>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;
