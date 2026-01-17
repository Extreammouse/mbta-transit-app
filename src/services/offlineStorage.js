import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'mbta_offline_';

// Initialize - No-op for AsyncStorage but kept for API compatibility
export const initDB = async () => {
    return true;
};

// Save data to AsyncStorage
export const saveData = async (key, data) => {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, jsonValue);
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        throw e;
    }
};

// Load data from AsyncStorage
export const loadData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data:', e);
        throw e;
    }
};

// Delete data from AsyncStorage
export const deleteData = async (key) => {
    try {
        await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
    } catch (e) {
        console.error('Error deleting data:', e);
        throw e;
    }
};

// Clear all data
export const clearAllData = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const appKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
        await AsyncStorage.multiRemove(appKeys);
    } catch (e) {
        console.error('Error clearing data:', e);
        throw e;
    }
};

// Check if data exists
export const hasData = async (key) => {
    const data = await loadData(key);
    return data !== null;
};