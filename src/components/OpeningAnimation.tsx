import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OpeningAnimation.css';

interface OpeningAnimationProps {
    posters: string[];
    onComplete: () => void;
}

const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ posters, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 1000); // Wait for exit animation
        }, 3500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    // Ensure we have enough posters for the effect by repeating if necessary
    const displayPosters = posters.length > 0
        ? Array(20).fill(posters).flat().slice(0, 20)
        : [];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="opening-container"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="cylinder-container">
                        <motion.div
                            className="cylinder"
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            {displayPosters.map((url, index) => (
                                <div
                                    key={index}
                                    className="poster-face"
                                    style={{
                                        transform: `rotateY(${index * (360 / 20)}deg) translateZ(600px)`
                                    }}
                                >
                                    <img src={url} alt="Movie Poster" />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        className="opening-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h1>My Stuff</h1>
                        <p>Your Personal Collection</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OpeningAnimation;
