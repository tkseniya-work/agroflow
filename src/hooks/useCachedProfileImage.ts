import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

const PROFILE_IMAGE_CACHE_DIR = `${FileSystem.documentDirectory}profile-images/`;
const PROFILE_IMAGE_CACHE_KEY_PREFIX = "profile_image_cache";

type StoredProfileImage = {
  sourceUrl: string;
  fileName?: string;
  uri?: string;
};

type CachedProfileImage = {
  sourceUrl: string;
  uri: string;
};

type UseCachedProfileImageParams = {
  imageUrl?: string | null;
  employeeId?: string | number | null;
  isConnected: boolean;
  refreshKey?: string | number;
};

const getCacheKey = (employeeId?: string | number | null) =>
  `${PROFILE_IMAGE_CACHE_KEY_PREFIX}:${employeeId ?? "current"}`;

const getFileExtension = (imageUrl: string) => {
  const pathname = imageUrl.split("?")[0] ?? "";
  const extension = pathname.match(/\.(png|jpe?g|webp)$/i)?.[1];

  return extension ? extension.toLowerCase() : "jpg";
};

const getProfileImageFileName = (
  employeeId: string | number | null | undefined,
  extension: string,
) => `${encodeURIComponent(String(employeeId ?? "current"))}.${extension}`;

const ensureProfileImageCacheDir = async () => {
  const info = await FileSystem.getInfoAsync(PROFILE_IMAGE_CACHE_DIR);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PROFILE_IMAGE_CACHE_DIR, {
      intermediates: true,
    });
  }
};

const readCachedProfileImage = async (
  employeeId?: string | number | null,
  imageUrl?: string | null,
): Promise<CachedProfileImage | null> => {
  const cacheKey = getCacheKey(employeeId);
  const stored = await AsyncStorage.getItem(cacheKey);

  if (stored) {
    try {
      const cached = JSON.parse(stored) as StoredProfileImage;
      const legacyFileName = cached.uri?.split("/").pop();
      const fileName = cached.fileName ?? legacyFileName;
      const candidates = [
        fileName ? `${PROFILE_IMAGE_CACHE_DIR}${fileName}` : null,
        cached.uri ?? null,
      ].filter((uri): uri is string => Boolean(uri));

      for (const uri of [...new Set(candidates)]) {
        const info = await FileSystem.getInfoAsync(uri);

        if (info.exists) {
          if (fileName && (!cached.fileName || cached.uri !== uri)) {
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({ sourceUrl: cached.sourceUrl, fileName }),
            );
          }

          return { sourceUrl: cached.sourceUrl, uri };
        }
      }
    } catch {
      // Try to recover the deterministic file directly from the cache folder.
    }
  }

  const cacheDirInfo = await FileSystem.getInfoAsync(PROFILE_IMAGE_CACHE_DIR);

  if (!cacheDirInfo.exists) return null;

  const filePrefix = `${encodeURIComponent(String(employeeId ?? "current"))}.`;
  const fileName = (await FileSystem.readDirectoryAsync(
    PROFILE_IMAGE_CACHE_DIR,
  )).find((name) => name.startsWith(filePrefix));

  if (!fileName) return null;

  const recovered: StoredProfileImage = {
    sourceUrl: imageUrl ?? "",
    fileName,
  };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(recovered));

  return {
    sourceUrl: recovered.sourceUrl,
    uri: `${PROFILE_IMAGE_CACHE_DIR}${fileName}`,
  };
};

export const clearCachedProfileImages = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const profileImageKeys = keys.filter((key) =>
    key.startsWith(PROFILE_IMAGE_CACHE_KEY_PREFIX),
  );

  if (profileImageKeys.length) {
    await AsyncStorage.multiRemove(profileImageKeys);
  }

  await FileSystem.deleteAsync(PROFILE_IMAGE_CACHE_DIR, { idempotent: true });
};

export const useCachedProfileImage = ({
  imageUrl,
  employeeId,
  isConnected,
  refreshKey,
}: UseCachedProfileImageParams) => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncProfileImage = async () => {
      let cached: CachedProfileImage | null = null;

      try {
        cached = await readCachedProfileImage(employeeId, imageUrl);
      } catch (error) {
        if (__DEV__) {
          console.warn("Profile image cache read failed:", error);
        }
      }

      if (isMounted && cached?.uri) {
        setCachedUri(cached.uri);
      }

      if (!imageUrl) {
        if (isMounted && !cached?.uri) {
          setCachedUri(null);
        }

        return;
      }

      if (!isConnected) {
        return;
      }

      if (cached?.sourceUrl === imageUrl) {
        return;
      }

      try {
        await ensureProfileImageCacheDir();

        const extension = getFileExtension(imageUrl);
        const fileName = getProfileImageFileName(employeeId, extension);
        const targetUri = `${PROFILE_IMAGE_CACHE_DIR}${fileName}`;
        const downloaded = await FileSystem.downloadAsync(imageUrl, targetUri);

        if (downloaded.status < 200 || downloaded.status >= 300) {
          await FileSystem.deleteAsync(downloaded.uri, { idempotent: true });
          throw new Error(`Profile image request failed: ${downloaded.status}`);
        }

        const nextCached: StoredProfileImage = {
          sourceUrl: imageUrl,
          fileName,
        };

        await AsyncStorage.setItem(
          getCacheKey(employeeId),
          JSON.stringify(nextCached),
        );

        if (isMounted) {
          setCachedUri(downloaded.uri);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Profile image cache failed:", error);
        }

        if (isMounted && !cached?.uri) {
          setCachedUri(imageUrl);
        }
      }
    };

    void syncProfileImage();

    return () => {
      isMounted = false;
    };
  }, [employeeId, imageUrl, isConnected, refreshKey]);

  return cachedUri ?? (isConnected ? imageUrl ?? null : null);
};
