use std::path::Path;

use sysinfo::Disks;

pub fn available(path: impl AsRef<Path>) -> Option<u64> {
    let mut disks = Disks::new();

    disks.refresh_list();
    disks.refresh();

    disks.sort_by(|a, b| {
        let a = a.mount_point().as_os_str().len();
        let b = b.mount_point().as_os_str().len();

        a.cmp(&b).reverse()
    });

    let path = path
        .as_ref()
        .read_link()
        .unwrap_or(path.as_ref().to_path_buf());

    for disk in disks.iter() {
        if path.starts_with(disk.mount_point()) {
            return Some(disk.available_space());
        }
    }

    None
}

pub fn is_same_disk(path1: impl AsRef<Path>, path2: impl AsRef<Path>) -> bool {
    let mut disks = Disks::new();

    disks.refresh_list();
    disks.refresh();

    disks.sort_by(|a, b| {
        let a = a.mount_point().as_os_str().len();
        let b = b.mount_point().as_os_str().len();

        a.cmp(&b).reverse()
    });

    let path1 = path1
        .as_ref()
        .read_link()
        .unwrap_or(path1.as_ref().to_path_buf());

    let path2 = path2
        .as_ref()
        .read_link()
        .unwrap_or(path2.as_ref().to_path_buf());

    for disk in disks.iter() {
        if path1.starts_with(disk.mount_point()) && path2.starts_with(disk.mount_point()) {
            return true;
        }
    }

    false
}

pub fn size_of_folder(path: impl AsRef<Path>) -> u64 {
    let mut size = 0;

    for entry in walkdir::WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let metadata = entry.metadata().unwrap();
        if metadata.is_file() {
            size += metadata.len();
        }
    }

    size
}
