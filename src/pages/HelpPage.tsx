import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, MessageCircle } from 'lucide-react';
import './HelpPage.css';

const HelpPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="help-page">
            <div className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Help & Support</h1>
            </div>

            <div className="help-content">
                <section className="help-section">
                    <div className="section-icon">
                        <Book size={32} />
                    </div>
                    <h2>How to Use</h2>
                    <div className="faq-list">
                        <div className="faq-item">
                            <h3>Adding Items</h3>
                            <p>Use the search bar on the home page to find movies, shows, or anime. Click the "Add" button to save them to your list.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Watchlist vs Watched</h3>
                            <p>Use the toggle at the top to switch between your "Watched" history and your "Watchlist" for future viewing.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Themes</h3>
                            <p>Go to Settings &gt; Theme Store to choose from over 10 premium themes including One Piece, Cyberpunk, and more.</p>
                        </div>
                    </div>
                </section>

                <section className="help-section">
                    <div className="section-icon">
                        <MessageCircle size={32} />
                    </div>
                    <h2>About</h2>
                    <p>My Stuff is your personal entertainment tracker. Built with React and love.</p>
                    <p>Version 2.0.0</p>
                </section>
            </div>
        </div>
    );
};

export default HelpPage;
