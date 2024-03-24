import { invoke } from "@tauri-apps/api/tauri";
import KvSettings, {
  SettingsKeys,
  SettingsTypeAccessor,
} from "../../lib/store";
import { TauriResponse, TauriRoutes } from "../../lib/ptypes";
import { ClearedApplicationData } from "../../lib/types";
import { create } from "zustand";

async function fetchData(initial: boolean = false) {
  let applicationSettings;
  if (initial) {
    applicationSettings = await KvSettings.createOrGetAll();
  } else {
    applicationSettings = await KvSettings.getAll();
  }
  let localGameManifest = await invoke<
    TauriResponse["TauriRoutes.FetchLocalManifest"]
  >(TauriRoutes.FetchLocalManifest, {
    path: applicationSettings.genshinImpactData.path,
  }).catch((err) => {
    console.error(err);
    return {
      manifest: {
        channel: "",
        cps: "",
        game_version: "",
        plugin_7_version: "",
        sub_channel: "",
        uapc: "",
      },
      error: "Failed to fetch local manifest.",
    };
  });

  let images = await invoke<TauriResponse["TauriRoutes.FetchImages"]>(
    TauriRoutes.FetchImages
  ).catch((err) => {
    console.error(err);
    return {
      advertisement: {
        splash: "",
        icon: "",
        icon_url: "",
      },
      banner: [],
      error: "Failed to fetch images.",
    };
  });

  console.log("[FETCH_DATA] : ", {
    applicationSettings,
    localGameManifest: localGameManifest,
    images,
  });

  return {
    applicationSettings,
    localGameManifest: localGameManifest.manifest,
    images,
  };
}

interface ApplicationState extends ClearedApplicationData {
  update: <T extends SettingsTypeAccessor>(
    key: SettingsKeys,
    value: T
  ) => Promise<void>;
  REQUEST_STORE_UPDATE: () => Promise<void>;
  isLoaded: boolean;
  _REQUEST_INITIAL_STORE_LOAD: () => Promise<void>;
}

const useApplicationStore = create<ApplicationState>()((set, get) => ({
  applicationSettings: {
    genshinImpactData: {
      path: "",
    },
  },
  localGameManifest: {
    channel: "",
    cps: "",
    game_version: "",
    plugin_7_version: "",
    sub_channel: "",
    uapc: "",
  },
  images: {
    advertisement: {
      splash: "",
      icon: "",
      icon_url: "",
    },
    banners: [],
    posts: [],
  },
  isLoaded: false,
  update: async <T extends SettingsTypeAccessor>(
    key: SettingsKeys,
    value: T
  ) => {
    console.log("[SET] : ", key, value);

    await KvSettings.set(key, value);
    set((state) => {
      return {
        ...state,
        applicationSettings: {
          ...state.applicationSettings,
          [key]: value,
        },
      };
    });
  },
  _REQUEST_INITIAL_STORE_LOAD: async () => {
    console.log("[REQUEST_INITIAL_STORE_LOAD] : Requesting store load.");
    if (get().isLoaded) {
      console.warn(
        "[REQUEST_INITAL_STORE_LOAD] : Store is already loaded. Defaulting to REQUEST_STORE_UPDATE."
      );
      await get().REQUEST_STORE_UPDATE();
      return;
    }
    try {
      const data = await fetchData(true);
      // @ts-ignore
      set({ ...data, isLoaded: true });
    } catch (error) {
      console.error(error);
    }
  },
  REQUEST_STORE_UPDATE: async () => {
    try {
      const data = await fetchData();
      // @ts-ignore
      set({ ...data });
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useApplicationStore;
