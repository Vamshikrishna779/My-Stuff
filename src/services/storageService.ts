import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAME } from '../utils/constants';

export interface WatchedItem {
    id?: number;
    tmdbId: number;
    title: string;
    type: string; // 'movie' | 'tv'
    category: string;
    year: string;
    posterUrl: string;
    addedDate: number;
    overview?: string;

    // List type
    listType: 'watched' | 'watchlist'; // Separate watched from plan-to-watch

    // Regional information
    originCountry?: string; // For regional badge display

    // Personal data
    personalRating?: number; // 0-10
    personalNotes?: string;
    watchDate?: number; // timestamp
    tags?: string[]; // ['thriller', 'must-rewatch']

    // Additional metadata
    runtime?: number; // in minutes
    episodeCount?: number;
    seasonCount?: number;
    status?: string; // 'Ended', 'Ongoing', etc.
    genres?: string[];
    backdropUrl?: string;
}

interface MyStuffDB extends DBSchema {
    watchedItems: {
        key: number;
        value: WatchedItem;
        indexes: { 'by-category': string; 'by-date': number };
    };
}

class StorageService {
    private db: IDBPDatabase<MyStuffDB> | null = null;

    async init(): Promise<void> {
        try {
            this.db = await openDB<MyStuffDB>(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        store.createIndex('by-category', 'category');
                        store.createIndex('by-date', 'addedDate');
                    }
                },
            });
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            throw error;
        }
    }

    async getAllItems(): Promise<WatchedItem[]> {
        if (!this.db) await this.init();
        try {
            const items = await this.db!.getAll(STORE_NAME);
            // Sort by most recently added
            return items.sort((a, b) => b.addedDate - a.addedDate);
        } catch (error) {
            console.error('Failed to get all items:', error);
            return [];
        }
    }

    async getItemsByCategory(category: string): Promise<WatchedItem[]> {
        if (!this.db) await this.init();
        try {
            if (category === 'all') {
                return this.getAllItems();
            }
            const items = await this.db!.getAllFromIndex(STORE_NAME, 'by-category', category);
            return items.sort((a, b) => b.addedDate - a.addedDate);
        } catch (error) {
            console.error('Failed to get items by category:', error);
            return [];
        }
    }

    async addItem(item: Omit<WatchedItem, 'id' | 'addedDate'>): Promise<number> {
        if (!this.db) await this.init();

        try {
            // Check if item already exists
            const existing = await this.findByTmdbId(item.tmdbId);
            if (existing) {
                throw new Error('Item already in your watched list');
            }

            const itemWithDate: Omit<WatchedItem, 'id'> = {
                ...item,
                listType: item.listType || 'watched', // Default to 'watched' for backward compatibility
                addedDate: Date.now()
            };

            const id = await this.db!.add(STORE_NAME, itemWithDate as WatchedItem);
            return id;
        } catch (error) {
            console.error('Failed to add item:', error);
            throw error;
        }
    }

    async removeItem(id: number): Promise<void> {
        if (!this.db) await this.init();
        try {
            await this.db!.delete(STORE_NAME, id);
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    }

    async findByTmdbId(tmdbId: number): Promise<WatchedItem | undefined> {
        if (!this.db) await this.init();
        try {
            const allItems = await this.db!.getAll(STORE_NAME);
            return allItems.find(item => item.tmdbId === tmdbId);
        } catch (error) {
            console.error('Failed to find item by TMDb ID:', error);
            return undefined;
        }
    }

    async exportToJSON(): Promise<string> {
        const items = await this.getAllItems();
        return JSON.stringify(items, null, 2);
    }

    async importFromJSON(jsonString: string): Promise<number> {
        try {
            const items: WatchedItem[] = JSON.parse(jsonString);

            if (!Array.isArray(items)) {
                throw new Error('Invalid JSON format');
            }

            let importedCount = 0;
            for (const item of items) {
                try {
                    // Remove id to let it auto-generate
                    const { id, ...itemWithoutId } = item;
                    await this.addItem(itemWithoutId);
                    importedCount++;
                } catch (error) {
                    // Skip duplicates
                    console.log('Skipping duplicate item:', item.title);
                }
            }

            return importedCount;
        } catch (error) {
            console.error('Failed to import JSON:', error);
            throw error;
        }
    }

    async clearAll(): Promise<void> {
        if (!this.db) await this.init();
        try {
            await this.db!.clear(STORE_NAME);
        } catch (error) {
            console.error('Failed to clear all items:', error);
            throw error;
        }
    }

    async getItemCount(): Promise<number> {
        if (!this.db) await this.init();
        try {
            return await this.db!.count(STORE_NAME);
        } catch (error) {
            console.error('Failed to get item count:', error);
            return 0;
        }
    }

    async getCountByCategory(category: string): Promise<number> {
        const items = await this.getItemsByCategory(category);
        return items.length;
    }

    async updatePersonalData(
        id: number,
        data: {
            personalRating?: number;
            personalNotes?: string;
            watchDate?: number;
            tags?: string[];
        }
    ): Promise<void> {
        if (!this.db) await this.init();
        try {
            const item = await this.db!.get(STORE_NAME, id);
            if (!item) {
                throw new Error('Item not found');
            }

            const updatedItem = {
                ...item,
                ...data
            };

            await this.db!.put(STORE_NAME, updatedItem);
        } catch (error) {
            console.error('Failed to update personal data:', error);
            throw error;
        }
    }

    async getItemsByListType(listType: 'watched' | 'watchlist'): Promise<WatchedItem[]> {
        if (!this.db) await this.init();
        try {
            const allItems = await this.db!.getAll(STORE_NAME);
            return allItems
                .filter(item => item.listType === listType)
                .sort((a, b) => b.addedDate - a.addedDate);
        } catch (error) {
            console.error('Failed to get items by list type:', error);
            return [];
        }
    }

    async moveToList(id: number, listType: 'watched' | 'watchlist'): Promise<void> {
        if (!this.db) await this.init();
        try {
            const item = await this.db!.get(STORE_NAME, id);
            if (!item) {
                throw new Error('Item not found');
            }

            const updatedItem = {
                ...item,
                listType,
                // If moving to watched, set watch date if not already set
                watchDate: listType === 'watched' && !item.watchDate ? Date.now() : item.watchDate
            };

            await this.db!.put(STORE_NAME, updatedItem);
        } catch (error) {
            console.error('Failed to move item to list:', error);
            throw error;
        }
    }

    async getCountByListTypeAndCategory(listType: 'watched' | 'watchlist', category: string): Promise<number> {
        if (!this.db) await this.init();
        try {
            const allItems = await this.db!.getAll(STORE_NAME);

            if (category === 'all') {
                return allItems.filter(item => item.listType === listType).length;
            }

            return allItems.filter(item =>
                item.listType === listType && item.category === category
            ).length;
        } catch (error) {
            console.error('Failed to get count:', error);
            return 0;
        }
    }
}

export const storageService = new StorageService();
export default storageService;
