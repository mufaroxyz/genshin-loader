use crate::lib::game_manifests;
use crate::lib::genshin_utils;

use serde_json::json;
use serde_json::Value;

#[tauri::command]
pub fn find_installation_path() -> Result<Value, Value> {
    genshin_utils::auto_detect_genshin_installation()
}

#[tauri::command]
pub fn ensure_installation_path(path: String) -> Result<String, Value> {
    genshin_utils::ensure_installation_path(path).into()
}

#[tauri::command]
pub fn fetch_local_manifest(path: String) -> Result<Value, Value> {
    game_manifests::fetch_local_manifest(path).into()
}

#[tauri::command]
pub fn get_executable_path() -> Result<Value, ()> {
    let binding = std::env::current_exe().unwrap();
    let exe_path = binding.parent();

    println!("Executable path: {:?}", exe_path);

    match exe_path {
        Some(path) => {
            return Ok(json!({
                "path": path.to_str().unwrap()
            })
            .into())
        }
        None => {
            println!("Failed to get executable path");
            return Err(());
        }
    }
}
