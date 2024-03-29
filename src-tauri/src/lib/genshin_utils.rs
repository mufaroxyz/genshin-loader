use log::info;
use serde_json::Value;
use winreg::enums::HKEY_LOCAL_MACHINE;

pub fn auto_detect_genshin_installation() -> Result<Value, Value> {
    let uninstaller_key = winreg::RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags(
            "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Genshin Impact",
            winreg::enums::KEY_READ,
        )
        .unwrap();

    let install_location: String = uninstaller_key.get_value("InstallPath").unwrap();

    info!("Auto-detected Genshin Impact installation at: {install_location}");

    let return_value = serde_json::json!({
        "path": format!("{}\\Genshin Impact game", install_location)
    });

    Ok(return_value)
}

pub fn ensure_installation_path(path: String) -> Result<String, Value> {
    println!("ensure_installation_path: {}", &path);
    let executable_path = format!("{}\\GenshinImpact.exe", &path);
    if std::path::Path::new(&executable_path).exists() {
        let return_value = serde_json::json!({
            "path": &path,
        });
        Ok(return_value.to_string())
    } else {
        let return_value = serde_json::json!({
          "error": "Genshin Impact installation not found"
        });
        Err(return_value)
    }
}
