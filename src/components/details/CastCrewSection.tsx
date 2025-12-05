import React from 'react';
import { Users } from 'lucide-react';
import tmdbDetailsService, { type Credits } from '../../services/tmdbDetailsService';
import './CastCrewSection.css';

interface CastCrewSectionProps {
    credits: Credits;
}

const CastCrewSection: React.FC<CastCrewSectionProps> = ({ credits }) => {
    const topCast = tmdbDetailsService.getTopCast(credits, 10);
    const directors = tmdbDetailsService.getDirectors(credits);
    const writers = tmdbDetailsService.getWriters(credits);

    if (topCast.length === 0 && directors.length === 0 && writers.length === 0) {
        return null;
    }

    return (
        <div className="cast-crew-section">
            <h2 className="section-title">
                <Users size={24} />
                Cast & Crew
            </h2>

            {/* Directors */}
            {directors.length > 0 && (
                <div className="crew-group">
                    <h3>Director{directors.length > 1 ? 's' : ''}</h3>
                    <div className="crew-list">
                        {directors.map(director => (
                            <span key={director.id} className="crew-name">
                                {director.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Writers */}
            {writers.length > 0 && (
                <div className="crew-group">
                    <h3>Writer{writers.length > 1 ? 's' : ''}</h3>
                    <div className="crew-list">
                        {writers.map(writer => (
                            <span key={writer.id} className="crew-name">
                                {writer.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Cast */}
            {topCast.length > 0 && (
                <div className="cast-group">
                    <h3>Top Billed Cast</h3>
                    <div className="cast-grid">
                        {topCast.map(member => (
                            <div key={member.id} className="cast-card">
                                <div className="cast-photo">
                                    {member.profile_path ? (
                                        <img
                                            src={tmdbDetailsService.getProfileImageUrl(member.profile_path)}
                                            alt={member.name}
                                        />
                                    ) : (
                                        <div className="photo-placeholder">👤</div>
                                    )}
                                </div>
                                <div className="cast-info">
                                    <p className="cast-name">{member.name}</p>
                                    <p className="cast-character">{member.character}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CastCrewSection;
