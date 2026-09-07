import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

const DB_NAME = "AgroFlow.db";

const FORCE_RESET_VERSIONS = [
  "1.3",
];

const RESET_DONE_KEY = "@app_reset_done_version";

const logReset = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const getAppVersion = (): string => {
  return Application.nativeApplicationVersion || "unknown";
};

/**
 * Нужно ли выполнять reset
 */
export const shouldRunReset = async (): Promise<boolean> => {
  const currentVersion = getAppVersion();

  if (!FORCE_RESET_VERSIONS.includes(currentVersion)) {
    return false;
  }

  const alreadyResetVersion = await AsyncStorage.getItem(
    RESET_DONE_KEY
  );

  return alreadyResetVersion !== currentVersion;
};

/**
 * Закрытие SQLite
 */
export const closeDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    await db.closeAsync();
  } catch (e) {
    console.error("closeDatabase error:", e);
  }
};

/**
 * Полное удаление SQLite файла
 */
export const deleteDatabase = async () => {
  const paths = [
    `${FileSystem.documentDirectory}SQLite/${DB_NAME}`,
    `${FileSystem.documentDirectory}${DB_NAME}`,
  ];

  for (const path of paths) {
    const info = await FileSystem.getInfoAsync(path);

    logReset("CHECK DB PATH:", path, info.exists);

    if (info.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
      logReset("DELETED DB:", path);
    }
  }
};

/**
 * Очистка AsyncStorage
 */
export const clearAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    await AsyncStorage.multiRemove(keys);

    logReset("AsyncStorage cleared");
  } catch (e) {
    console.error("clearAsyncStorage error:", e);
  }
};

/**
 * Полный reset приложения
 */
export const runAppReset = async () => {
  const currentVersion = getAppVersion();

  try {
    logReset("Running app reset...");

    /**
     * 1. Закрываем БД
     */
    await closeDatabase();

    /**
     * 2. Удаляем SQLite
     */
    await deleteDatabase();

    /**
     * 3. Чистим AsyncStorage
     */
    await clearAsyncStorage();

    /**
     * 4. Помечаем reset выполненным
     */
    await AsyncStorage.setItem(
      RESET_DONE_KEY,
      currentVersion
    );

    logReset(
      `App reset completed for version ${currentVersion}`
    );

    return true;
  } catch (e) {
    console.error("runAppReset error:", e);

    return false;
  }
};

export const runAppResetIfNeeded = async () => {
  try {
    const shouldReset = await shouldRunReset();

    if (!shouldReset) {
      return false;
    }

    return await runAppReset();
  } catch (e) {
    console.error("runAppResetIfNeeded error:", e);

    return false;
  }
};
