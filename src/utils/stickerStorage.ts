import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STICKERS_DIR = `${FileSystem.documentDirectory}stickers/`;
const INDEX_KEY = "custom_stickers_index_v1";

export interface CustomSticker {
  id: string;
  uri: string; // local file:// uri, persists across app restarts
  createdAt: string;
}

const ensureDir = async () => {
  const info = await FileSystem.getInfoAsync(STICKERS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(STICKERS_DIR, { intermediates: true });
  }
};

const readIndex = async (): Promise<CustomSticker[]> => {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeIndex = async (items: CustomSticker[]) => {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(items));
};

export const getCustomStickers = async (): Promise<CustomSticker[]> => {
  return readIndex();
};

// Lets the user pick a photo and save it into their personal sticker
// library on-device — nothing is uploaded here, this is purely local so
// it works offline and doesn't cost storage/bandwidth until they actually
// send one.
export const pickAndSaveCustomSticker =
  async (): Promise<CustomSticker | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return null;

    await ensureDir();
    const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const destUri = `${STICKERS_DIR}${id}.jpg`;
    await FileSystem.copyAsync({ from: result.assets[0].uri, to: destUri });

    const sticker: CustomSticker = {
      id,
      uri: destUri,
      createdAt: new Date().toISOString(),
    };

    const current = await readIndex();
    const next = [sticker, ...current];
    await writeIndex(next);
    return sticker;
  };

export const deleteCustomSticker = async (id: string): Promise<void> => {
  const current = await readIndex();
  const target = current.find((s) => s.id === id);
  if (target) {
    try {
      await FileSystem.deleteAsync(target.uri, { idempotent: true });
    } catch {}
  }
  await writeIndex(current.filter((s) => s.id !== id));
};

// import { Directory, File, Paths } from "expo-file-system";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";

// const stickersDir = new Directory(Paths.document, "stickers");
// const INDEX_KEY = "custom_stickers_index_v1";

// export interface CustomSticker {
//   id: string;
//   uri: string;
//   createdAt: string;
// }

// const ensureDir = () => {
//   if (!stickersDir.exists) {
//     stickersDir.create({
//       intermediates: true,
//       idempotent: true,
//     });
//   }
// };

// const readIndex = async (): Promise<CustomSticker[]> => {
//   try {
//     const raw = await AsyncStorage.getItem(INDEX_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// };

// const writeIndex = async (items: CustomSticker[]) => {
//   await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(items));
// };

// export const getCustomStickers = () => readIndex();

// export const pickAndSaveCustomSticker =
//   async (): Promise<CustomSticker | null> => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.9,
//       mediaTypes: ["images"],
//     });

//     if (result.canceled) return null;

//     ensureDir();

//     const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

//     const destination = new File(stickersDir, `${id}.jpg`);
//     destination.create({
//       overwrite: true,
//       intermediates: true,
//     });

//     const source = new File(result.assets[0].uri);

//     await source.copy(destination);

//     const sticker: CustomSticker = {
//       id,
//       uri: destination.uri,
//       createdAt: new Date().toISOString(),
//     };

//     const current = await readIndex();
//     await writeIndex([sticker, ...current]);

//     return sticker;
//   };

// export const deleteCustomSticker = async (id: string) => {
//   const current = await readIndex();

//   const sticker = current.find((s) => s.id === id);

//   if (sticker) {
//     try {
//       const file = new File(sticker.uri);
//       file.delete();
//     } catch {}
//   }

//   await writeIndex(current.filter((s) => s.id !== id));
// };
