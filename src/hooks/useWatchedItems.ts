import { useState, useEffect, useCallback } from 'react';
import storageService, { type WatchedItem } from '../services/storageService';

export const useWatchedItems = (selectedCategory: string, listType: 'watched' | 'watchlist' = 'watched') => {
    const [items, setItems] = useState<WatchedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // First filter by list type, then by category
            const itemsByListType = await storageService.getItemsByListType(listType);

            if (selectedCategory === 'all') {
                setItems(itemsByListType);
            } else {
                const filtered = itemsByListType.filter(item => item.category === selectedCategory);
                setItems(filtered);
            }
        } catch (err) {
            setError('Failed to load items');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, listType]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const addItem = async (item: Omit<WatchedItem, 'id' | 'addedDate'>) => {
        try {
            await storageService.addItem(item);
            await loadItems();
            return true;
        } catch (err: any) {
            throw new Error(err.message || 'Failed to add item');
        }
    };

    const removeItem = async (id: number) => {
        try {
            await storageService.removeItem(id);
            await loadItems();
        } catch (err) {
            throw new Error('Failed to remove item');
        }
    };

    const exportData = async () => {
        try {
            const jsonData = await storageService.exportToJSON();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-stuff-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            throw new Error('Failed to export data');
        }
    };

    const importData = async (file: File) => {
        try {
            const text = await file.text();
            const count = await storageService.importFromJSON(text);
            await loadItems();
            return count;
        } catch (err) {
            throw new Error('Failed to import data');
        }
    };

    const clearAll = async () => {
        try {
            await storageService.clearAll();
            await loadItems();
        } catch (err) {
            throw new Error('Failed to clear data');
        }
    };

    return {
        items,
        isLoading,
        error,
        addItem,
        removeItem,
        exportData,
        importData,
        clearAll,
        refresh: loadItems
    };
};
