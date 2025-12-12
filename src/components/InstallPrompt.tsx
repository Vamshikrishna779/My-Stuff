// src/components/InstallPrompt.tsx
import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const InstallPrompt: React.FC = () => {
    const { canInstall, triggerInstall } = usePwaInstall();
    const [hidden, setHidden] = useState(false);

    if (!canInstall || hidden) return null;

    return (
        <>
            {/* Embedded CSS */}
            <style>
                {`
                .install-popup {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 16px;
                    z-index: 9999;
                    padding: 0 16px;
                    display: flex;
                    justify-content: center;
                    pointer-events: none;
                }

                .install-popup-content {
                    pointer-events: auto;
                    width: 100%;
                    max-width: 420px;
                    background: #0f172a;
                    color: #e5e7eb;
                    padding: 14px 16px;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .install-text h3 {
                    margin: 0 0 4px;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .install-text p {
                    margin: 0;
                    font-size: 0.85rem;
                    line-height: 1.2;
                    opacity: 0.9;
                }

                .install-popup-actions {
                    margin-left: auto;
                    display: flex;
                    gap: 8px;
                }

                .install-btn {
                    border: none;
                    padding: 6px 12px;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    cursor: pointer;
                }

                .install-btn.later {
                    background: #334155;
                    color: #e5e7eb;
                }

                .install-btn.install {
                    background: #f1f5f9;
                    color: #0f172a;
                    font-weight: 600;
                }

                @media (max-width: 480px) {
                    .install-popup {
                        bottom: 10px;
                        padding: 0 10px;
                    }

                    .install-popup-content {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: left;
                        gap: 10px;
                    }

                    .install-popup-actions {
                        margin-left: 0;
                        justify-content: flex-end;
                    }

                    .install-btn {
                        padding: 8px 16px;
                        font-size: 0.9rem;
                    }
                }
                `}
            </style>

            <div className="install-popup">
                <div className="install-popup-content">
                    <div className="install-text">
                        <h3>Install My Stuff?</h3>
                        <p>Install the app on your device for faster access.</p>
                    </div>

                    <div className="install-popup-actions">
                        <button
                            className="install-btn later"
                            onClick={() => setHidden(true)}
                        >
                            Later
                        </button>

                        <button
                            className="install-btn install"
                            onClick={async () => {
                                await triggerInstall();
                                setHidden(true);
                            }}
                        >
                            Install
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InstallPrompt;
