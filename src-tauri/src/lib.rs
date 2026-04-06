use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{Instant, SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

const DEFAULT_PLUGIN_CONFIG: &str = r#"{
  "plugins": [
    {
      "id": "pixpin",
      "name": "PixPin",
      "description": "Portable screenshot, pin, long capture, and OCR workflow.",
      "category": "Capture",
      "executable": "PixPin/PixPin.exe",
      "homepage": "https://pixpinapp.com/",
      "requiresAdmin": false,
      "tags": ["screenshot", "ocr", "pin"]
    },
    {
      "id": "snipaste",
      "name": "Snipaste",
      "description": "Lightweight screenshot and pinning tool.",
      "category": "Capture",
      "executable": "Snipaste/Snipaste.exe",
      "homepage": "https://www.snipaste.com/",
      "requiresAdmin": false,
      "tags": ["screenshot", "pin"]
    },
    {
      "id": "context-menu-manager",
      "name": "ContextMenuManager",
      "description": "Manage Windows right-click menu entries.",
      "category": "System",
      "executable": "ContextMenuManager/ContextMenuManager.exe",
      "homepage": "https://github.com/BluePointLilac/ContextMenuManager",
      "requiresAdmin": false,
      "tags": ["context-menu"]
    },
    {
      "id": "file-converter",
      "name": "FileConverter",
      "description": "Right-click conversion helper for many file formats.",
      "category": "Advanced",
      "executable": "FileConverter/FileConverter.exe",
      "homepage": "https://github.com/Tichau/FileConverter",
      "requiresAdmin": false,
      "tags": ["convert", "context-menu"]
    },
    {
      "id": "clash-verge-rev",
      "name": "Clash Verge Rev",
      "description": "Proxy client placeholder for later one-click deployment.",
      "category": "Advanced",
      "executable": "clash-verge-rev/clash-verge.exe",
      "homepage": "https://github.com/clash-verge-rev/clash-verge-rev",
      "requiresAdmin": false,
      "tags": ["proxy", "network"]
    },
    {
      "id": "explorer-blur-mica",
      "name": "ExplorerBlurMica",
      "description": "Explorer blur and mica enhancement entry.",
      "category": "Advanced",
      "executable": "ExplorerBlurMica/ExplorerBlurMica.exe",
      "homepage": "https://github.com/Maplespe/ExplorerBlurMica",
      "requiresAdmin": true,
      "tags": ["explorer", "mica"]
    }
  ]
}"#;

const DEFAULT_PLUGIN_README: &str = r#"# Win Toolbox Plugins

Drop portable tools into this folder and keep `config.json` updated.

Suggested layout:

- Plugins/PixPin/PixPin.exe
- Plugins/Snipaste/Snipaste.exe
- Plugins/ContextMenuManager/ContextMenuManager.exe
- Plugins/FileConverter/FileConverter.exe

The app will scan `config.json`, resolve each executable relative to this folder, and light up installed tools automatically.
"#;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SystemSnapshot {
    host_name: String,
    os_name: String,
    os_version: String,
    os_build: String,
    cpu_name: String,
    cpu_load: u64,
    cpu_cores: u64,
    logical_cores: u64,
    memory_total_mb: u64,
    memory_used_mb: u64,
    memory_usage_percent: u64,
    gpu_name: Option<String>,
    gpu_memory_mb: Option<u64>,
    network_name: Option<String>,
    network_description: Option<String>,
    network_link_speed: Option<String>,
    collected_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ToolActionResult {
    action_id: String,
    title: String,
    success: bool,
    summary: String,
    details: String,
    duration_ms: u64,
    output_path: Option<String>,
    warnings: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PluginConfig {
    plugins: Vec<PluginDefinition>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PluginDefinition {
    id: String,
    name: String,
    description: String,
    category: String,
    executable: String,
    homepage: Option<String>,
    requires_admin: Option<bool>,
    tags: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct PluginManifest {
    id: String,
    name: String,
    description: String,
    category: String,
    executable: String,
    resolved_path: Option<String>,
    homepage: Option<String>,
    requires_admin: bool,
    tags: Vec<String>,
    installed: bool,
}

#[derive(Debug, Default)]
struct CleanupStats {
    files_removed: u64,
    directories_removed: u64,
    bytes_freed: u64,
    skipped_entries: u64,
}

#[derive(Debug)]
struct ProcessCapture {
    success: bool,
    stdout: String,
    stderr: String,
}

fn workspace_root() -> Option<PathBuf> {
    let mut cursor = std::env::current_dir().ok()?;

    loop {
        if cursor.join("package.json").exists() && cursor.join("src-tauri").exists() {
            return Some(cursor);
        }

        if !cursor.pop() {
            break;
        }
    }

    None
}

fn plugin_root() -> PathBuf {
    if let Some(root) = workspace_root() {
        return root.join("Plugins");
    }

    if let Ok(executable) = std::env::current_exe() {
        if let Some(parent) = executable.parent() {
            return parent.join("Plugins");
        }
    }

    std::env::temp_dir().join("WinToolbox").join("Plugins")
}

fn documents_dir() -> PathBuf {
    if let Some(user_profile) = std::env::var_os("USERPROFILE") {
        let candidate = PathBuf::from(user_profile).join("Documents");
        if candidate.exists() {
            return candidate;
        }
    }

    workspace_root().unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")))
}

fn ensure_default_plugin_assets(plugin_dir: &Path) -> Result<(), String> {
    fs::create_dir_all(plugin_dir).map_err(|error| format!("Failed to create plugin folder: {error}"))?;

    let config_path = plugin_dir.join("config.json");
    if !config_path.exists() {
        fs::write(&config_path, DEFAULT_PLUGIN_CONFIG)
            .map_err(|error| format!("Failed to write default plugin config: {error}"))?;
    }

    let readme_path = plugin_dir.join("README.md");
    if !readme_path.exists() {
        fs::write(&readme_path, DEFAULT_PLUGIN_README)
            .map_err(|error| format!("Failed to write plugin README: {error}"))?;
    }

    Ok(())
}

fn resolve_plugin_path(plugin_dir: &Path, executable: &str) -> PathBuf {
    let candidate = PathBuf::from(executable);
    if candidate.is_absolute() {
        candidate
    } else {
        plugin_dir.join(candidate)
    }
}

fn load_plugins_internal() -> Result<Vec<PluginManifest>, String> {
    let plugin_dir = plugin_root();
    ensure_default_plugin_assets(&plugin_dir)?;

    let raw = fs::read_to_string(plugin_dir.join("config.json"))
        .map_err(|error| format!("Failed to read plugin config: {error}"))?;
    let mut manifests = serde_json::from_str::<PluginConfig>(&raw)
        .map_err(|error| format!("Failed to parse plugin config: {error}"))?
        .plugins
        .into_iter()
        .map(|plugin| {
            let resolved_path = resolve_plugin_path(&plugin_dir, &plugin.executable);
            PluginManifest {
                id: plugin.id,
                name: plugin.name,
                description: plugin.description,
                category: plugin.category,
                executable: plugin.executable,
                resolved_path: Some(resolved_path.to_string_lossy().to_string()),
                homepage: plugin.homepage,
                requires_admin: plugin.requires_admin.unwrap_or(false),
                tags: plugin.tags.unwrap_or_default(),
                installed: resolved_path.exists(),
            }
        })
        .collect::<Vec<_>>();

    manifests.sort_by(|left, right| {
        right
            .installed
            .cmp(&left.installed)
            .then(left.category.cmp(&right.category))
            .then(left.name.cmp(&right.name))
    });

    Ok(manifests)
}

fn format_process_details(capture: &ProcessCapture) -> String {
    let mut parts = Vec::new();

    if !capture.stdout.trim().is_empty() {
        parts.push(capture.stdout.trim().to_string());
    }

    if !capture.stderr.trim().is_empty() {
        parts.push(capture.stderr.trim().to_string());
    }

    if parts.is_empty() {
        "No command output was produced.".to_string()
    } else {
        parts.join("\n\n")
    }
}

fn format_bytes(bytes: u64) -> String {
    const GIB: f64 = 1024.0 * 1024.0 * 1024.0;
    const MIB: f64 = 1024.0 * 1024.0;

    if bytes as f64 >= GIB {
        format!("{:.2} GB", bytes as f64 / GIB)
    } else {
        format!("{:.2} MB", bytes as f64 / MIB)
    }
}

fn unix_timestamp_slug() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}

fn run_command_capture(program: &str, args: &[&str]) -> Result<ProcessCapture, String> {
    let output = Command::new(program)
        .args(args)
        .output()
        .map_err(|error| format!("Failed to run {program}: {error}"))?;

    Ok(ProcessCapture {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).trim().to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).trim().to_string(),
    })
}

fn run_powershell_json(script: &str) -> Result<String, String> {
    let capture = run_command_capture(
        "powershell.exe",
        &[
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            script,
        ],
    )?;

    if capture.success {
        Ok(capture.stdout)
    } else {
        Err(format_process_details(&capture))
    }
}

fn run_powershell_capture(script: &str) -> Result<ProcessCapture, String> {
    run_command_capture(
        "powershell.exe",
        &[
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            script,
        ],
    )
}

fn spawn_detached(program: &str, args: &[String]) -> Result<(), String> {
    Command::new(program)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("Failed to launch {program}: {error}"))?;

    Ok(())
}

fn spawn_detached_path(executable: &Path, args: &[String]) -> Result<(), String> {
    Command::new(executable)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("Failed to launch {}: {error}", executable.display()))?;

    Ok(())
}

fn build_action_result(
    action_id: &str,
    title: &str,
    success: bool,
    summary: impl Into<String>,
    details: impl Into<String>,
    output_path: Option<String>,
    warnings: Vec<String>,
    started_at: Instant,
) -> ToolActionResult {
    ToolActionResult {
        action_id: action_id.to_string(),
        title: title.to_string(),
        success,
        summary: summary.into(),
        details: details.into(),
        duration_ms: started_at.elapsed().as_millis() as u64,
        output_path,
        warnings,
    }
}

fn cleanup_directory(target: &Path) -> CleanupStats {
    let mut stats = CleanupStats::default();

    if !target.exists() {
        return stats;
    }

    for entry in WalkDir::new(target).min_depth(1).contents_first(true) {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => {
                stats.skipped_entries += 1;
                continue;
            }
        };

        let path = entry.path();
        let metadata = fs::symlink_metadata(path).ok();

        if entry.file_type().is_dir() {
            if fs::remove_dir(path).is_ok() {
                stats.directories_removed += 1;
            } else {
                stats.skipped_entries += 1;
            }
        } else {
            let size = metadata.map(|item| item.len()).unwrap_or(0);
            if fs::remove_file(path).is_ok() {
                stats.files_removed += 1;
                stats.bytes_freed += size;
            } else {
                stats.skipped_entries += 1;
            }
        }
    }

    stats
}

fn execute_open_target(target: &str, title: &str, action_id: &str) -> ToolActionResult {
    let started_at = Instant::now();
    match spawn_detached("explorer.exe", &[target.to_string()]) {
        Ok(()) => build_action_result(
            action_id,
            title,
            true,
            format!("Opened {target}."),
            "Windows Explorer has been asked to handle the target.",
            None,
            Vec::new(),
            started_at,
        ),
        Err(error) => build_action_result(
            action_id,
            title,
            false,
            "The target could not be opened.",
            error,
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_launch_capture() -> ToolActionResult {
    let started_at = Instant::now();

    match load_plugins_internal() {
        Ok(plugins) => {
            if let Some(plugin) = plugins.into_iter().find(|item| {
                item.installed
                    && item
                        .tags
                        .iter()
                        .any(|tag| tag.eq_ignore_ascii_case("screenshot"))
            }) {
                if let Some(resolved_path) = plugin.resolved_path.clone() {
                    match spawn_detached_path(Path::new(&resolved_path), &[]) {
                        Ok(()) => {
                            return build_action_result(
                                "launch_capture",
                                "Launch Capture",
                                true,
                                format!("Started {} from Plugins.", plugin.name),
                                format!("Executable: {resolved_path}"),
                                None,
                                Vec::new(),
                                started_at,
                            );
                        }
                        Err(error) => {
                            return build_action_result(
                                "launch_capture",
                                "Launch Capture",
                                false,
                                format!("{} was detected but could not be started.", plugin.name),
                                error,
                                None,
                                Vec::new(),
                                started_at,
                            );
                        }
                    }
                }
            }
        }
        Err(error) => {
            return build_action_result(
                "launch_capture",
                "Launch Capture",
                false,
                "Plugin scan failed before launching capture.",
                error,
                None,
                Vec::new(),
                started_at,
            );
        }
    }

    match spawn_detached("explorer.exe", &[String::from("ms-screenclip:")]) {
        Ok(()) => build_action_result(
            "launch_capture",
            "Launch Capture",
            true,
            "Opened the built-in Windows capture bar.",
            "No third-party screenshot plugin was installed, so the app fell back to Win + Shift + S.",
            None,
            vec![String::from("Install PixPin or Snipaste in Plugins/ for advanced OCR, pinning, and long capture.")],
            started_at,
        ),
        Err(error) => build_action_result(
            "launch_capture",
            "Launch Capture",
            false,
            "The system screenshot tool could not be started.",
            error,
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_temp_cleanup() -> ToolActionResult {
    let started_at = Instant::now();
    let temp_dir = std::env::temp_dir();
    let stats = cleanup_directory(&temp_dir);

    build_action_result(
        "one_click_clean",
        "Safe Cleanup",
        true,
        format!(
            "Removed {} files and {} folders from {}.",
            stats.files_removed,
            stats.directories_removed,
            temp_dir.display()
        ),
        format!(
            "Estimated space freed: {}\nSkipped locked items: {}",
            format_bytes(stats.bytes_freed),
            stats.skipped_entries
        ),
        Some(temp_dir.to_string_lossy().to_string()),
        vec![String::from(
            "Locked temp files are skipped automatically so the cleanup remains safe.",
        )],
        started_at,
    )
}

fn execute_dism(action_id: &str, title: &str, args: &[&str]) -> ToolActionResult {
    let started_at = Instant::now();

    match run_command_capture("DISM.exe", args) {
        Ok(capture) => build_action_result(
            action_id,
            title,
            capture.success,
            if capture.success {
                format!("{title} completed.")
            } else {
                format!("{title} failed.")
            },
            format_process_details(&capture),
            None,
            vec![String::from(
                "If DISM reports elevation issues, run Win Toolbox as Administrator and retry.",
            )],
            started_at,
        ),
        Err(error) => build_action_result(
            action_id,
            title,
            false,
            format!("{title} could not be started."),
            error,
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_driver_export() -> ToolActionResult {
    let started_at = Instant::now();
    let backup_dir = documents_dir()
        .join("WinToolbox")
        .join("DriverBackups")
        .join(format!("backup-{}", unix_timestamp_slug()));

    if let Err(error) = fs::create_dir_all(&backup_dir) {
        return build_action_result(
            "export_drivers",
            "Export Drivers",
            false,
            "The driver backup folder could not be created.",
            error.to_string(),
            None,
            Vec::new(),
            started_at,
        );
    }

    let escaped_destination = backup_dir
        .to_string_lossy()
        .replace('\'', "''");
    let script = format!("Export-WindowsDriver -Online -Destination '{escaped_destination}'");

    match run_powershell_capture(&script) {
        Ok(capture) => build_action_result(
            "export_drivers",
            "Export Drivers",
            capture.success,
            if capture.success {
                format!("Drivers were exported to {}.", backup_dir.display())
            } else {
                "Driver export did not complete successfully.".to_string()
            },
            format_process_details(&capture),
            Some(backup_dir.to_string_lossy().to_string()),
            vec![String::from(
                "Driver export often needs Administrator privileges on Windows.",
            )],
            started_at,
        ),
        Err(error) => build_action_result(
            "export_drivers",
            "Export Drivers",
            false,
            "Driver export could not be started.",
            error,
            Some(backup_dir.to_string_lossy().to_string()),
            vec![String::from(
                "Try running the app as Administrator if Windows blocks the export.",
            )],
            started_at,
        ),
    }
}

fn execute_open_plugin_folder() -> ToolActionResult {
    let started_at = Instant::now();
    let plugin_dir = plugin_root();

    match ensure_default_plugin_assets(&plugin_dir) {
        Ok(()) => match spawn_detached("explorer.exe", &[plugin_dir.to_string_lossy().to_string()]) {
            Ok(()) => build_action_result(
                "open_plugin_folder",
                "Open Plugin Folder",
                true,
                format!("Opened {}.", plugin_dir.display()),
                "Drop portable tools here and keep config.json updated to make the cards live up automatically.",
                Some(plugin_dir.to_string_lossy().to_string()),
                Vec::new(),
                started_at,
            ),
            Err(error) => build_action_result(
                "open_plugin_folder",
                "Open Plugin Folder",
                false,
                "The plugin folder exists but could not be opened.",
                error,
                Some(plugin_dir.to_string_lossy().to_string()),
                Vec::new(),
                started_at,
            ),
        },
        Err(error) => build_action_result(
            "open_plugin_folder",
            "Open Plugin Folder",
            false,
            "The plugin folder could not be prepared.",
            error,
            Some(plugin_dir.to_string_lossy().to_string()),
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_launch_plugin(plugin_id: &str) -> ToolActionResult {
    let started_at = Instant::now();

    let plugins = match load_plugins_internal() {
        Ok(plugins) => plugins,
        Err(error) => {
            return build_action_result(
                "launch_plugin",
                "Launch Plugin",
                false,
                "The plugin manifest could not be loaded.",
                error,
                None,
                Vec::new(),
                started_at,
            );
        }
    };

    let plugin = match plugins.into_iter().find(|item| item.id == plugin_id) {
        Some(plugin) => plugin,
        None => {
            return build_action_result(
                "launch_plugin",
                "Launch Plugin",
                false,
                "The selected plugin does not exist in config.json.",
                format!("Missing plugin id: {plugin_id}"),
                None,
                Vec::new(),
                started_at,
            );
        }
    };

    if !plugin.installed {
        return build_action_result(
            "launch_plugin",
            "Launch Plugin",
            false,
            format!("{} is not installed yet.", plugin.name),
            plugin
                .resolved_path
                .unwrap_or_else(|| String::from("No executable path resolved.")),
            None,
            vec![String::from(
                "Open the plugin folder, drop the portable executable in place, then rescan.",
            )],
            started_at,
        );
    }

    match plugin.resolved_path.clone() {
        Some(resolved_path) => match spawn_detached_path(Path::new(&resolved_path), &[]) {
            Ok(()) => build_action_result(
                "launch_plugin",
                "Launch Plugin",
                true,
                format!("Started {}.", plugin.name),
                format!("Executable: {resolved_path}"),
                None,
                if plugin.requires_admin {
                    vec![String::from(
                        "This plugin may work best when Win Toolbox is running as Administrator.",
                    )]
                } else {
                    Vec::new()
                },
                started_at,
            ),
            Err(error) => build_action_result(
                "launch_plugin",
                "Launch Plugin",
                false,
                format!("{} was found but failed to start.", plugin.name),
                error,
                None,
                Vec::new(),
                started_at,
            ),
        },
        None => build_action_result(
            "launch_plugin",
            "Launch Plugin",
            false,
            format!("{} has no resolved executable path.", plugin.name),
            "Check config.json and ensure the executable field is correct.",
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_tool_action(action_id: &str) -> ToolActionResult {
    match action_id {
        "launch_capture" => execute_launch_capture(),
        "one_click_clean" => execute_temp_cleanup(),
        "open_apps_features" => {
            execute_open_target("ms-settings:appsfeatures", "Open Apps & Features", "open_apps_features")
        }
        "dism_check_health" => execute_dism(
            "dism_check_health",
            "DISM CheckHealth",
            &["/Online", "/Cleanup-Image", "/CheckHealth"],
        ),
        "dism_scan_health" => execute_dism(
            "dism_scan_health",
            "DISM ScanHealth",
            &["/Online", "/Cleanup-Image", "/ScanHealth"],
        ),
        "export_drivers" => execute_driver_export(),
        "open_plugin_folder" => execute_open_plugin_folder(),
        _ => build_action_result(
            action_id,
            "Unknown Action",
            false,
            "The requested action is not implemented.",
            format!("Unknown action id: {action_id}"),
            None,
            Vec::new(),
            Instant::now(),
        ),
    }
}

#[tauri::command]
fn get_system_snapshot() -> Result<SystemSnapshot, String> {
    let script = r#"
$ErrorActionPreference = 'Stop'
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1 Name, LoadPercentage, NumberOfCores, NumberOfLogicalProcessors
$os = Get-CimInstance Win32_OperatingSystem | Select-Object -First 1 Caption, Version, BuildNumber, TotalVisibleMemorySize, FreePhysicalMemory, CSName
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1 Name, AdapterRAM
$gpuName = if ($gpu) { $gpu.Name } else { $null }
$gpuMemoryMb = $null

if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) {
  $nvidiaLine = & nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>$null | Select-Object -First 1
  if ($nvidiaLine) {
    $parts = $nvidiaLine -split ','
    if ($parts.Count -ge 2) {
      $gpuName = $parts[0].Trim()
      $memoryValue = [regex]::Match($parts[1], '\d+').Value
      if ($memoryValue) {
        $gpuMemoryMb = [uint64]$memoryValue
      }
    }
  }
}

if (-not $gpuMemoryMb -and $gpu -and $gpu.AdapterRAM) {
  $gpuMemoryMb = [uint64][math]::Round($gpu.AdapterRAM / 1MB, 0)
}

$cpuLoad = if ($cpu.LoadPercentage -eq $null) {
  [uint64]0
} else {
  [uint64]$cpu.LoadPercentage
}

$memoryUsagePercent = if ($os.TotalVisibleMemorySize -gt 0) {
  [uint64][math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 0)
} else {
  [uint64]0
}

$primaryNetwork = Get-NetAdapter |
  Where-Object Status -eq 'Up' |
  Where-Object InterfaceDescription -notmatch 'Hyper-V|Virtual|VPN|Tunnel|TAP|Loopback|Miniport' |
  Sort-Object LinkSpeed -Descending |
  Select-Object -First 1 Name, InterfaceDescription, LinkSpeed

if (-not $primaryNetwork) {
  $primaryNetwork = Get-NetAdapter |
    Where-Object Status -eq 'Up' |
    Sort-Object LinkSpeed -Descending |
    Select-Object -First 1 Name, InterfaceDescription, LinkSpeed
}

[PSCustomObject]@{
  hostName = $os.CSName
  osName = $os.Caption
  osVersion = $os.Version
  osBuild = $os.BuildNumber
  cpuName = $cpu.Name
  cpuLoad = $cpuLoad
  cpuCores = [uint64]$cpu.NumberOfCores
  logicalCores = [uint64]$cpu.NumberOfLogicalProcessors
  memoryTotalMb = [uint64][math]::Round($os.TotalVisibleMemorySize / 1024, 0)
  memoryUsedMb = [uint64][math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1024, 0)
  memoryUsagePercent = $memoryUsagePercent
  gpuName = $gpuName
  gpuMemoryMb = $gpuMemoryMb
  networkName = if ($primaryNetwork) { $primaryNetwork.Name } else { $null }
  networkDescription = if ($primaryNetwork) { $primaryNetwork.InterfaceDescription } else { $null }
  networkLinkSpeed = if ($primaryNetwork) { [string]$primaryNetwork.LinkSpeed } else { $null }
  collectedAt = (Get-Date).ToString('o')
} | ConvertTo-Json -Compress
"#;

    let raw_snapshot = run_powershell_json(script)?;
    serde_json::from_str(&raw_snapshot).map_err(|error| format!("Failed to parse system snapshot: {error}"))
}

#[tauri::command]
fn list_plugins() -> Result<Vec<PluginManifest>, String> {
    load_plugins_internal()
}

#[tauri::command]
async fn run_tool_action(action_id: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_tool_action(&action_id))
        .await
        .map_err(|error| format!("Failed to run action task: {error}"))
}

#[tauri::command]
async fn launch_plugin(plugin_id: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_launch_plugin(&plugin_id))
        .await
        .map_err(|error| format!("Failed to run plugin task: {error}"))
}

#[tauri::command]
async fn open_target(target: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_open_target(&target, "Open Target", "open_target"))
        .await
        .map_err(|error| format!("Failed to open target task: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_snapshot,
            list_plugins,
            run_tool_action,
            launch_plugin,
            open_target
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
