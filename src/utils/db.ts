import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'cirrostrats_db';
const DB_VERSION = 1;

// Define the database schema using the DBSchema interface
// This provides excellent TypeScript support
interface CirrostratsDB extends DBSchema {
  gates: {
    key: string;
    value: {
      id: string;
      searchTerm: string;
      data: any;
      timestamp: number;
    };
    indexes: { searchTerm: string; timestamp: number };
  };
  flights: {
    key: string;
    value: {
      id: string;
      searchTerm: string;
      data: any;
      timestamp: number;
    };
    indexes: { searchTerm: string; timestamp: number };
  };
  airports: {
    key: string;
    value: {
      id: string;
      searchTerm: string;
      data: any;
      timestamp: number;
    };
    indexes: { searchTerm: string; timestamp: number };
  };
  searchHistory: {
    key: string;
    value: {
      id: string;
      type: string;
      searchTerm: string;
      displayName: string;
      lastAccessed: number;
    };
    indexes: { type: string; lastAccessed: number };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
}

// Singleton promise to ensure we only open the DB once
let dbPromise: Promise<IDBPDatabase<CirrostratsDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<CirrostratsDB>> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB<CirrostratsDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`);
      
      // Create object stores based on your schema
      if (!db.objectStoreNames.contains('gates')) {
        const store = db.createObjectStore('gates', { keyPath: 'id' });
        store.createIndex('searchTerm', 'searchTerm');
        store.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('flights')) {
        const store = db.createObjectStore('flights', { keyPath: 'id' });
        store.createIndex('searchTerm', 'searchTerm');
        store.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('airports')) {
        const store = db.createObjectStore('airports', { keyPath: 'id' });
        store.createIndex('searchTerm', 'searchTerm');
        store.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('searchHistory')) {
        const store = db.createObjectStore('searchHistory', { keyPath: 'id' });
        store.createIndex('type', 'type');
        store.createIndex('lastAccessed', 'lastAccessed');
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });
  return dbPromise;
};

// --- Data Caching Functions ---

/**
 * Saves gate data to IndexedDB.
 * @param id - The unique identifier for the gate (e.g., "EWR-C101").
 * @param searchTerm - The label used to search (e.g., "EWR - C101 Departures").
 * @param data - The API response data to cache.
 */
export async function saveGateData(id: string, searchTerm: string, data: any): Promise<void> {
  try {
    const db = await getDb();
    await db.put('gates', {
      id,
      searchTerm,
      data,
      timestamp: Date.now(),
    });
    console.log(`[DB] Cached data for gate: ${id}`);
  } catch (error) {
    console.error(`[DB] Error caching gate data for ${id}:`, error);
  }
}

/**
 * Retrieves cached gate data from IndexedDB.
 * @param id - The unique identifier for the gate.
 * @returns The cached data object or undefined.
 */
export async function getGateData(id: string) {
  try {
    const db = await getDb();
    const data = await db.get('gates', id);
    console.log(`[DB] Fetched gate data from cache: ${id}`, data);
    return data;
  } catch (error) {
    console.error(`[DB] Error fetching cached gate data for ${id}:`, error);
    return undefined;
  }
}

// NOTE: You would create similar `saveFlightData`/`getFlightData` and `saveAirportData`/`getAirportData` functions
// following the same pattern as the gate functions above.

// --- Search History Functions ---

const MAX_SEARCH_HISTORY = 20; // Store more history in IDB

/**
 * Adds or updates a search term in the searchHistory store.
 * Also trims the store to prevent it from growing indefinitely.
 * @param item - The search suggestion item to save.
 */
export async function updateSearchHistory(item: { id: string; type: string; searchTerm: string; displayName: string }): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('searchHistory', 'readwrite');
    await tx.store.put({
      ...item,
      lastAccessed: Date.now(),
    });
    
    // Trim old entries
    let cursor = await tx.store.index('lastAccessed').openCursor(null, 'prev');
    let count = 0;
    while (cursor) {
      count++;
      if (count > MAX_SEARCH_HISTORY) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
    console.log(`[DB] Updated search history for: ${item.displayName}`);
  } catch (error) {
    console.error(`[DB] Error updating search history:`, error);
  }
}

/**
 * Retrieves recent search history items.
 * @returns An array of search history items, sorted by most recent.
 */
export async function getSearchHistory(): Promise<any[]> {
  try {
    const db = await getDb();
    const items = await db.getAllFromIndex('searchHistory', 'lastAccessed');
    // `getAllFromIndex` with 'lastAccessed' index doesn't sort automatically,
    // so we reverse the array to get (newest -> oldest)
    return items.reverse();
  } catch (error) {
    console.error(`[DB] Error fetching search history:`, error);
    return [];
  }
}