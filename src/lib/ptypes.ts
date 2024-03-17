import { Images, LocalGameManifest } from "./types";

export enum TauriRoutes {
  FindInstallationPath = "find_installation_path",
  EnsureInstallationPath = "ensure_installation_path",
  FetchLocalManifest = "fetch_local_manifest",
  FetchImages = "fetch_images",
}

export interface TauriResponse {
  ["TauriRoutes.FindInstallationPath"]:
    | {
        path: string;
      }
    | {
        error: string;
      };
  ["TauriRoutes.EnsureInstallationPath"]:
    | {
        path: string;
      }
    | {
        error: string;
      };
  ["TauriRoutes.FetchLocalManifest"]: {
    path: string;
    manifest: LocalGameManifest;
    error?: never;
  };
  ["TauriRoutes.FetchImages"]: {
    path: string;
    images: Images;
    error?: never;
  };
}
