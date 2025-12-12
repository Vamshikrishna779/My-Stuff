// src/hooks/usePwaInstall.ts
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            const event = e as BeforeInstallPromptEvent;
            setDeferredPrompt(event);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const triggerInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();

        // Just wait, no unused variables
        await deferredPrompt.userChoice;

        setDeferredPrompt(null);
        setCanInstall(false);
    };

    return { canInstall, triggerInstall };
}
