import EncryptedStorage from "react-native-encrypted-storage";

/**
 * Save data securely.
 * @param {string} key - The key under which the data is stored.
 * @param {object|string} value - The data to store.
 * @returns {Promise<void>}
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await EncryptedStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve securely stored data.
 * @param {string} key - The key associated with the stored data.
 * @returns {Promise<object|string|null>} - The retrieved data.
 */
export const getData = async (key) => {
  try {
    const jsonValue = await EncryptedStorage.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Delete securely stored data.
 * @param {string} key - The key associated with the data to delete.
 * @returns {Promise<void>}
 */
export const deleteData = async (key) => {
  try {
    await EncryptedStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all securely stored data.
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    await EncryptedStorage.clear();
  } catch (error) {
    console.error("Error clearing all data:", error);
    throw error;
  }
};
