use encoding_rs::GBK;
use serde::{Deserialize, Serialize};
use std::{
    os::windows::process::CommandExt,
    fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{Instant, SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

const CREATE_NO_WINDOW: u32 = 0x08000000;

const DEFAULT_PLUGIN_CONFIG: &str = r#"{
  "plugins": [
    {
      "id": "pixpin",
      "name": "PixPin",
      "description": "鍥藉唴鐢ㄦ埛闈炲父椤烘墜鐨勬埅鍥俱€佽创鍥俱€侀暱鎴浘鍜?OCR 宸ュ叿銆?,
      "category": "鎴浘澧炲己",
      "executable": "PixPin/PixPin.exe",
      "homepage": "https://pixpinapp.com/",
      "requiresAdmin": false,
      "tags": ["screenshot", "ocr", "pin"]
    },
    {
      "id": "snipaste",
      "name": "Snipaste",
      "description": "杞婚噺銆佺ǔ瀹氥€佷笂鎵嬪揩鐨勬埅鍥句笌璐村浘宸ュ叿銆?,
      "category": "鎴浘澧炲己",
      "executable": "Snipaste/Snipaste.exe",
      "homepage": "https://www.snipaste.com/",
      "requiresAdmin": false,
      "tags": ["screenshot", "pin"]
    },
    {
      "id": "context-menu-manager",
      "name": "ContextMenuManager",
      "description": "鍙抽敭鑿滃崟绠＄悊鍣紝閫傚悎娓呯悊鍜屾暣鐞嗙郴缁熷彸閿」銆?,
      "category": "绯荤粺缁存姢",
      "executable": "ContextMenuManager/ContextMenuManager.exe",
      "homepage": "https://github.com/BluePointLilac/ContextMenuManager",
      "requiresAdmin": false,
      "tags": ["context-menu"]
    },
    {
      "id": "file-converter",
      "name": "FileConverter",
      "description": "鎶婃牸寮忚浆鎹㈣兘鍔涙寕鍒板彸閿彍鍗曢噷鐨勯珮鏁堝伐鍏枫€?,
      "category": "杩涢樁澧炲己",
      "executable": "FileConverter/FileConverter.exe",
      "homepage": "https://github.com/Tichau/FileConverter",
      "requiresAdmin": false,
      "tags": ["convert", "context-menu"]
    },
    {
      "id": "clash-verge-rev",
      "name": "Clash Verge Rev",
      "description": "浠ｇ悊宸ュ叿棰勭暀鍏ュ彛锛屼究浜庡悗缁竴閿儴缃蹭笌鏇存柊妫€娴嬨€?,
      "category": "杩涢樁澧炲己",
      "executable": "clash-verge-rev/clash-verge.exe",
      "homepage": "https://github.com/clash-verge-rev/clash-verge-rev",
      "requiresAdmin": false,
      "tags": ["proxy", "network"]
    },
    {
      "id": "explorer-blur-mica",
      "name": "ExplorerBlurMica",
      "description": "璧勬簮绠＄悊鍣ㄦ瘺鐜荤拑涓?Mica 瑙嗚澧炲己鍏ュ彛銆?,
      "category": "妗岄潰缇庡寲",
      "executable": "ExplorerBlurMica/ExplorerBlurMica.exe",
      "homepage": "https://github.com/Maplespe/ExplorerBlurMica",
      "requiresAdmin": true,
      "tags": ["explorer", "mica"]
    }
  ]
}"#;

const DEFAULT_PLUGIN_README: &str = r#"# Win Toolbox 鎻掍欢鐩綍

鎶婁究鎼哄伐鍏锋斁杩涜繖涓洰褰曪紝骞剁淮鎶ゅソ `config.json`锛屼富绋嬪簭灏变細鑷姩璇嗗埆骞剁偣浜叆鍙ｃ€?
鎺ㄨ崘缁撴瀯锛?
- Plugins/PixPin/PixPin.exe
- Plugins/Snipaste/Snipaste.exe
- Plugins/ContextMenuManager/ContextMenuManager.exe
- Plugins/FileConverter/FileConverter.exe

搴旂敤浼氳鍙?`config.json`锛屽苟鍩轰簬杩欎釜鐩綍鍘昏В鏋愭瘡涓彲鎵ц鏂囦欢鐨勭浉瀵硅矾寰勩€?"#;

const HIGH_PERFORMANCE_GUID: &str = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c";
const BALANCED_GUID: &str = "381b4222-f694-41f0-9685-ff5bb260df2e";

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

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ComponentManifest {
    id: String,
    name: String,
    description: String,
    category: String,
    kind: String,
    installed: bool,
    status_label: String,
    summary: String,
    winget_id: Option<String>,
    homepage: Option<String>,
    launch_path: Option<String>,
    launch_arguments: Option<Vec<String>>,
    recommended: bool,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CreatorCacheTarget {
    id: String,
    name: String,
    description: String,
    path: String,
    exists: bool,
    size_bytes: u64,
    recommended: bool,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StorageHotspot {
    id: String,
    label: String,
    path: String,
    source: String,
    size_bytes: u64,
    item_count: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AiRuntimeStatus {
    ollama_installed: bool,
    ollama_running: bool,
    available_models: Vec<String>,
    open_claw_detected: bool,
    palette_ready: bool,
    suggested_entry: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AiChatResponse {
    model: String,
    answer: String,
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

#[derive(Debug)]
struct CreatorCachePreset {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    path: PathBuf,
    recommended: bool,
}

#[derive(Debug)]
struct ComponentDefinition {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    category: &'static str,
    kind: &'static str,
    winget_id: Option<&'static str>,
    homepage: Option<&'static str>,
    detect_paths: Vec<PathBuf>,
    launch_arguments: Vec<String>,
    recommended: bool,
    installed: bool,
    status_label: String,
    summary: String,
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

fn user_profile_dir() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE").map(PathBuf::from)
}

fn desktop_dir() -> Option<PathBuf> {
    user_profile_dir().map(|path| path.join("Desktop"))
}

fn downloads_dir() -> Option<PathBuf> {
    user_profile_dir().map(|path| path.join("Downloads"))
}

fn videos_dir() -> Option<PathBuf> {
    user_profile_dir().map(|path| path.join("Videos"))
}

fn pictures_dir() -> Option<PathBuf> {
    user_profile_dir().map(|path| path.join("Pictures"))
}

fn local_app_data_dir() -> Option<PathBuf> {
    std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
}

fn program_files_dir() -> Option<PathBuf> {
    std::env::var_os("ProgramFiles").map(PathBuf::from)
}

fn roaming_app_data_dir() -> Option<PathBuf> {
    std::env::var_os("APPDATA").map(PathBuf::from)
}

fn component_root() -> PathBuf {
    local_app_data_dir()
        .unwrap_or_else(documents_dir)
        .join("WinToolbox")
        .join("Components")
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

fn find_first_existing_path(paths: &[PathBuf]) -> Option<PathBuf> {
    paths.iter().find(|path| path.exists()).cloned()
}

fn sharex_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(local) = local_app_data_dir() {
        paths.push(local.join("Programs").join("ShareX").join("ShareX.exe"));
    }

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("ShareX").join("ShareX.exe"));
    }

    paths
}

fn search_paths_for_executable(root: &Path, executable_name: &str, max_depth: usize) -> Vec<PathBuf> {
    if !root.exists() {
        return Vec::new();
    }

    WalkDir::new(root)
        .max_depth(max_depth)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| entry.file_name().to_string_lossy().eq_ignore_ascii_case(executable_name))
        .map(|entry| entry.path().to_path_buf())
        .collect()
}

fn snipaste_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(local) = local_app_data_dir() {
        paths.push(local.join("Programs").join("Snipaste").join("Snipaste.exe"));
        paths.extend(search_paths_for_executable(
            &local.join("Microsoft").join("WinGet").join("Packages"),
            "Snipaste.exe",
            4,
        ));
    }

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("Snipaste").join("Snipaste.exe"));
        paths.extend(search_paths_for_executable(&program_files, "Snipaste.exe", 3));
    }

    paths
}

fn clash_verge_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(local) = local_app_data_dir() {
        paths.push(
            local.join("Programs")
                .join("Clash Verge")
                .join("Clash Verge.exe"),
        );
        paths.push(
            local.join("Programs")
                .join("Clash Verge Rev")
                .join("Clash Verge.exe"),
        );
        paths.push(
            local.join("Programs")
                .join("Clash Verge Rev")
                .join("clash-verge.exe"),
        );
        paths.extend(search_paths_for_executable(
            &local.join("Microsoft").join("WinGet").join("Packages"),
            "clash-verge.exe",
            4,
        ));
        paths.extend(search_paths_for_executable(
            &local.join("Microsoft").join("WinGet").join("Packages"),
            "Clash Verge.exe",
            4,
        ));
    }

    if let Some(program_files) = program_files_dir() {
        paths.extend(search_paths_for_executable(&program_files, "clash-verge.exe", 3));
        paths.extend(search_paths_for_executable(&program_files, "Clash Verge.exe", 3));
    }

    paths
}

fn bcuninstaller_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(local) = local_app_data_dir() {
        paths.push(
            local.join("Programs")
                .join("BCUninstaller")
                .join("BCUninstaller.exe"),
        );
        paths.extend(search_paths_for_executable(
            &local.join("Microsoft").join("WinGet").join("Packages"),
            "BCUninstaller.exe",
            4,
        ));
    }

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("BCUninstaller").join("BCUninstaller.exe"));
        paths.extend(search_paths_for_executable(
            &program_files,
            "BCUninstaller.exe",
            3,
        ));
    }

    paths
}

fn everything_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("Everything").join("Everything.exe"));
    }

    paths
}

fn context_menu_manager_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(local) = local_app_data_dir() {
        paths.push(
            local.join("Programs")
                .join("ContextMenuManager")
                .join("ContextMenuManager.exe"),
        );
    }

    if let Some(program_files) = program_files_dir() {
        paths.push(
            program_files
                .join("ContextMenuManager")
                .join("ContextMenuManager.exe"),
        );
    }

    paths
}

fn seven_zip_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("7-Zip").join("7zFM.exe"));
    }

    paths
}

fn powertoys_detect_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Some(program_files) = program_files_dir() {
        paths.push(program_files.join("PowerToys").join("PowerToys.exe"));
    }

    if let Some(local) = local_app_data_dir() {
        paths.push(local.join("PowerToys").join("PowerToys.exe"));
    }

    paths
}

fn build_component_definition(
    id: &'static str,
    name: &'static str,
    description: &'static str,
    category: &'static str,
    winget_id: Option<&'static str>,
    homepage: Option<&'static str>,
    detect_paths: Vec<PathBuf>,
    launch_arguments: Vec<String>,
    recommended: bool,
) -> ComponentDefinition {
    let launch_path = find_first_existing_path(&detect_paths);
    let installed =
        launch_path.is_some() || winget_id.map(winget_package_installed).unwrap_or(false);

    ComponentDefinition {
        id,
        name,
        description,
        category,
        kind: if winget_id.is_some() { "winget" } else { "built-in" },
        winget_id,
        homepage,
        detect_paths,
        launch_arguments,
        recommended,
        installed,
        status_label: if installed {
            "可用".to_string()
        } else {
            "未安装".to_string()
        },
        summary: if installed {
            format!("{name} 已就绪，可以直接使用。")
        } else if winget_id.is_some() {
            format!("{name} 支持一键安装，装好就能直接用。")
        } else {
            format!("{name} 已内置在主程序中。")
        },
    }
}

fn list_components_internal() -> Vec<ComponentManifest> {
    let mut components = vec![
        ComponentDefinition {
            id: "capture-core",
            name: "基础截图",
            description: "系统截图已经内置，装好就能直接用。",
            category: "基础能力",
            kind: "built-in",
            winget_id: None,
            homepage: None,
            detect_paths: Vec::new(),
            launch_arguments: Vec::new(),
            recommended: true,
            installed: true,
            status_label: "可用".to_string(),
            summary: "区域截图开箱即用。".to_string(),
        },
        build_component_definition(
            "capture-plus",
            "Snipaste 截图增强",
            "一键安装 Snipaste，开启后按 F1 截图，按 F3 贴图。",
            "截图增强",
            Some("liule.Snipaste"),
            Some("https://www.snipaste.com/"),
            snipaste_detect_paths(),
            Vec::new(),
            true,
        ),
        build_component_definition(
            "everything-search",
            "Everything 搜索增强",
            "安装 Everything，让文件搜索和空间定位更顺手。",
            "效率增强",
            Some("voidtools.Everything"),
            Some("https://www.voidtools.com/"),
            everything_detect_paths(),
            Vec::new(),
            true,
        ),
        build_component_definition(
            "context-menu-manager",
            "右键菜单管理",
            "一键安装右键菜单管理器，方便清理和整理系统右键项。",
            "效率增强",
            Some("BluePointLilac.ContextMenuManager"),
            Some("https://github.com/BluePointLilac/ContextMenuManager"),
            context_menu_manager_detect_paths(),
            Vec::new(),
            false,
        ),
        build_component_definition(
            "archive-tools",
            "压缩解压增强",
            "安装 7-Zip，补齐常见压缩格式支持。",
            "效率增强",
            Some("7zip.7zip"),
            Some("https://www.7-zip.org/"),
            seven_zip_detect_paths(),
            Vec::new(),
            false,
        ),
        build_component_definition(
            "clash-verge-rev",
            "Clash Verge Rev",
            "一键安装 Clash Verge Rev，装好后就能直接打开使用。",
            "网络增强",
            Some("ClashVergeRev.ClashVergeRev"),
            Some("https://github.com/clash-verge-rev/clash-verge-rev"),
            clash_verge_detect_paths(),
            Vec::new(),
            true,
        ),
        build_component_definition(
            "uninstall-plus",
            "软件卸载增强",
            "一键安装 BCUninstaller，更彻底地卸载软件并清理残留。",
            "系统增强",
            Some("Klocman.BulkCrapUninstaller"),
            Some("https://www.bcuninstaller.com/"),
            bcuninstaller_detect_paths(),
            Vec::new(),
            true,
        ),
        build_component_definition(
            "powertoys-suite",
            "PowerToys",
            "安装 PowerToys，补齐系统效率工具集。",
            "效率增强",
            Some("Microsoft.PowerToys"),
            Some("https://github.com/microsoft/PowerToys"),
            powertoys_detect_paths(),
            Vec::new(),
            false,
        ),
        ComponentDefinition {
            id: "ollama-runtime",
            name: "Ollama 运行时",
            description: "本地 AI 运行时，安装后就能接入本地模型。",
            category: "AI",
            kind: "winget",
            winget_id: Some("Ollama.Ollama"),
            homepage: Some("https://ollama.com/"),
            detect_paths: Vec::new(),
            launch_arguments: Vec::new(),
            recommended: true,
            installed: command_exists("ollama"),
            status_label: if command_exists("ollama") {
                "可用".to_string()
            } else {
                "未安装".to_string()
            },
            summary: if command_exists("ollama") {
                "已经检测到 Ollama，可以继续拉取本地模型。".to_string()
            } else {
                "未检测到 Ollama，支持一键安装。".to_string()
            },
        },
    ];

    components.sort_by(|left, right| {
        right
            .recommended
            .cmp(&left.recommended)
            .then(right.installed.cmp(&left.installed))
            .then(left.category.cmp(&right.category))
            .then(left.name.cmp(&right.name))
    });

    components
        .into_iter()
        .map(|item| ComponentManifest {
            id: item.id.to_string(),
            name: item.name.to_string(),
            description: item.description.to_string(),
            category: item.category.to_string(),
            kind: item.kind.to_string(),
            installed: item.installed,
            status_label: item.status_label,
            summary: item.summary,
            winget_id: item.winget_id.map(|value| value.to_string()),
            homepage: item.homepage.map(|value| value.to_string()),
            launch_path: find_first_existing_path(&item.detect_paths)
                .map(|path| path.to_string_lossy().to_string()),
            launch_arguments: if item.launch_arguments.is_empty() {
                None
            } else {
                Some(item.launch_arguments)
            },
            recommended: item.recommended,
        })
        .collect()
}

fn install_component_internal(component_id: &str) -> Result<ToolActionResult, String> {
    let started_at = Instant::now();
    let components = list_components_internal();
    let component = components
        .into_iter()
        .find(|item| item.id == component_id)
        .ok_or_else(|| format!("未找到组件：{component_id}"))?;

    if component.installed {
        return Ok(build_action_result(
            "install_component",
            "安装组件",
            true,
            format!("{} 已经处于可用状态。", component.name),
            component.summary,
            component.launch_path,
            Vec::new(),
            started_at,
        ));
    }

    let winget_id = component
        .winget_id
        .clone()
        .ok_or_else(|| "该组件暂不支持独立安装。".to_string())?;

    let capture = run_command_capture(
        "winget",
        &[
            "install",
            "--id",
            &winget_id,
            "-e",
            "--accept-package-agreements",
            "--accept-source-agreements",
            "--disable-interactivity",
        ],
    )?;

    let summary = if capture.success {
        if component.id == "capture-plus" {
            "Snipaste 安装完成，开启后按 F1 截图，按 F3 贴图。".to_string()
        } else {
            format!("{} 安装完成。", component.name)
        }
    } else {
        format!("{} 安装失败。", component.name)
    };

    Ok(build_action_result(
        "install_component",
        "安装组件",
        capture.success,
        summary,
        format_process_details(&capture),
        None,
        vec![String::from(
            "如果安装过程中弹出系统确认，请允许安装继续执行。",
        )],
        started_at,
    ))
}

fn uninstall_component_internal(component_id: &str) -> Result<ToolActionResult, String> {
    let started_at = Instant::now();
    let components = list_components_internal();
    let component = components
        .into_iter()
        .find(|item| item.id == component_id)
        .ok_or_else(|| format!("未找到组件：{component_id}"))?;

    let winget_id = component
        .winget_id
        .clone()
        .ok_or_else(|| "该组件暂不支持卸载。".to_string())?;

    let capture = run_command_capture(
        "winget",
        &[
            "uninstall",
            "--id",
            &winget_id,
            "-e",
            "--accept-source-agreements",
            "--disable-interactivity",
        ],
    )?;

    Ok(build_action_result(
        "uninstall_component",
        "卸载组件",
        capture.success,
        if capture.success {
            format!("{} 已卸载。", component.name)
        } else {
            format!("{} 卸载失败。", component.name)
        },
        format_process_details(&capture),
        None,
        vec![String::from(
            "部分组件卸载后可能还需要手动关闭相关进程。",
        )],
        started_at,
    ))
}

fn launch_component_internal(component_id: &str) -> Result<ToolActionResult, String> {
    let started_at = Instant::now();
    let components = list_components_internal();
    let component = components
        .into_iter()
        .find(|item| item.id == component_id)
        .ok_or_else(|| format!("未找到组件：{component_id}"))?;

    if let Some(launch_path) = component.launch_path.clone() {
        let args = component.launch_arguments.clone().unwrap_or_default();
        spawn_detached_path(Path::new(&launch_path), &args)?;

        let summary = if component.id == "capture-plus" {
            "Snipaste 已启动。按 F1 截图，按 F3 贴图。".to_string()
        } else {
            format!("已启动 {}。", component.name)
        };

        Ok(build_action_result(
            "launch_component",
            "启动组件",
            true,
            summary,
            format!("执行文件：{launch_path}"),
            Some(launch_path),
            Vec::new(),
            started_at,
        ))
    } else if let Some(homepage) = component.homepage.clone() {
        Ok(execute_open_target(&homepage, "打开组件主页", "launch_component"))
    } else {
        Ok(build_action_result(
            "launch_component",
            "启动组件",
            false,
            format!("{} 当前没有可启动入口。", component.name),
            component.summary,
            None,
            Vec::new(),
            started_at,
        ))
    }
}

fn disable_component_internal(component_id: &str) -> Result<ToolActionResult, String> {
    let started_at = Instant::now();

    let (process_name, summary) = match component_id {
        "capture-plus" => ("Snipaste.exe", "截图增强已关闭，已恢复系统默认截图。"),
        "clash-verge-rev" => ("clash-verge.exe", "Clash Verge Rev 已关闭。"),
        _ => {
            return Err(format!("该组件暂不支持关闭：{component_id}"));
        }
    };

    let capture = run_command_capture("taskkill", &["/IM", process_name, "/F"])?;

    Ok(build_action_result(
        "disable_component",
        "关闭组件",
        capture.success,
        if capture.success {
            summary.to_string()
        } else {
            format!("未能关闭 {process_name}。")
        },
        format_process_details(&capture),
        None,
        Vec::new(),
        started_at,
    ))
}

fn creator_cache_presets() -> Vec<CreatorCachePreset> {
    Vec::new()
}

fn scan_creator_caches_internal() -> Vec<CreatorCacheTarget> {
    creator_cache_presets()
        .into_iter()
        .map(|preset| CreatorCacheTarget {
            id: preset.id.to_string(),
            name: preset.name.to_string(),
            description: preset.description.to_string(),
            path: preset.path.to_string_lossy().to_string(),
            exists: false,
            size_bytes: 0,
            recommended: preset.recommended,
        })
        .collect()
}

fn scan_storage_hotspots_internal() -> Vec<StorageHotspot> {
    let mut hotspots = Vec::new();
    let mut roots = Vec::new();

    if let Some(path) = downloads_dir() {
        roots.push(("下载", path));
    }
    if let Some(path) = desktop_dir() {
        roots.push(("桌面", path));
    }
    roots.push(("文档", documents_dir()));
    if let Some(path) = videos_dir() {
        roots.push(("视频", path));
    }
    if let Some(path) = pictures_dir() {
        roots.push(("图片", path));
    }

    for (source, root) in roots {
        if !root.exists() {
            continue;
        }

        let entries = match fs::read_dir(&root) {
            Ok(entries) => entries,
            Err(_) => continue,
        };

        for entry in entries.filter_map(|entry| entry.ok()) {
            let path = entry.path();
            let size_bytes = calculate_path_size(&path);
            if size_bytes == 0 {
                continue;
            }

            let label = path
                .file_name()
                .map(|value| value.to_string_lossy().to_string())
                .unwrap_or_else(|| path.to_string_lossy().to_string());

            hotspots.push(StorageHotspot {
                id: path.to_string_lossy().to_string(),
                label,
                path: path.to_string_lossy().to_string(),
                source: source.to_string(),
                size_bytes,
                item_count: if path.is_dir() {
                    count_immediate_children(&path)
                } else {
                    1
                },
            });
        }
    }

    hotspots.sort_by(|left, right| {
        right
            .size_bytes
            .cmp(&left.size_bytes)
            .then(left.source.cmp(&right.source))
            .then(left.label.cmp(&right.label))
    });
    hotspots.truncate(16);
    hotspots
}

fn get_ai_runtime_status_internal() -> AiRuntimeStatus {
    let ollama_installed = command_exists("ollama");

    let (ollama_running, available_models) = if ollama_installed {
        let list_capture = run_command_capture("ollama", &["list"]).ok();
        let models = list_capture
            .as_ref()
            .filter(|capture| capture.success)
            .map(|capture| parse_ollama_models(&capture.stdout))
            .unwrap_or_default();

        let running = run_command_capture("ollama", &["ps"])
            .map(|capture| capture.success && capture.stdout.lines().count() > 1)
            .unwrap_or(false);

        (running, models)
    } else {
        (false, Vec::new())
    };

    let open_claw_detected = component_root().join("OpenClaw").exists();

    let palette_ready = ollama_installed && !available_models.is_empty();
    let suggested_entry = if !ollama_installed {
        "未检测到 Ollama。先装好本地运行时，AI 灵感悬浮窗才会解锁。".to_string()
    } else if available_models.is_empty() {
        "已经检测到 Ollama，但还没有模型。先拉一个 Qwen 模型再使用悬浮窗。".to_string()
    } else if !ollama_running {
        "检测到本地模型，灵感悬浮窗可用；首次提问时会自动拉起本地推理。".to_string()
    } else {
        "本地 AI 已就绪，可以直接从悬浮窗发起灵感对话。".to_string()
    };

    AiRuntimeStatus {
        ollama_installed,
        ollama_running,
        available_models,
        open_claw_detected,
        palette_ready,
        suggested_entry,
    }
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
        "没有产生额外输出。".to_string()
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

fn calculate_path_size(path: &Path) -> u64 {
    if !path.exists() {
        return 0;
    }

    if path.is_file() {
        return fs::metadata(path).map(|item| item.len()).unwrap_or(0);
    }

    WalkDir::new(path)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter_map(|entry| entry.metadata().ok())
        .filter(|metadata| metadata.is_file())
        .map(|metadata| metadata.len())
        .sum()
}

fn count_immediate_children(path: &Path) -> u64 {
    fs::read_dir(path)
        .map(|entries| entries.filter_map(|entry| entry.ok()).count() as u64)
        .unwrap_or(0)
}

fn command_exists(program: &str) -> bool {
    run_command_capture("where.exe", &[program])
        .map(|capture| capture.success)
        .unwrap_or(false)
}

fn winget_package_installed(package_id: &str) -> bool {
    if !command_exists("winget") {
        return false;
    }

    run_command_capture(
        "winget",
        &[
            "list",
            "--id",
            package_id,
            "-e",
            "--accept-source-agreements",
            "--disable-interactivity",
        ],
    )
    .map(|capture| {
        capture.success
            && !capture.stdout.contains("No installed package found")
            && !capture.stdout.contains("没有已安装的程序包")
    })
    .unwrap_or(false)
}

fn parse_ollama_models(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .skip(1)
        .filter_map(|line| line.split_whitespace().next())
        .filter(|name| !name.is_empty())
        .map(|name| name.to_string())
        .collect()
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
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|error| format!("Failed to run {program}: {error}"))?;

    Ok(ProcessCapture {
        success: output.status.success(),
        stdout: decode_command_output(&output.stdout),
        stderr: decode_command_output(&output.stderr),
    })
}

fn decode_command_output(bytes: &[u8]) -> String {
    if bytes.is_empty() {
        return String::new();
    }

    if let Ok(text) = std::str::from_utf8(bytes) {
        return text.trim().to_string();
    }

    let (decoded, _, _) = GBK.decode(bytes);
    decoded.trim().to_string()
}

fn with_powershell_utf8(script: &str) -> String {
    format!(
        "$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)\n{script}"
    )
}

fn run_powershell_json(script: &str) -> Result<String, String> {
    let wrapped_script = with_powershell_utf8(script);
    let capture = run_command_capture(
        "powershell.exe",
        &[
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            &wrapped_script,
        ],
    )?;

    if capture.success {
        Ok(capture.stdout)
    } else {
        Err(format_process_details(&capture))
    }
}

fn run_powershell_capture(script: &str) -> Result<ProcessCapture, String> {
    let wrapped_script = with_powershell_utf8(script);
    run_command_capture(
        "powershell.exe",
        &[
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            &wrapped_script,
        ],
    )
}

fn spawn_detached(program: &str, args: &[String]) -> Result<(), String> {
    Command::new(program)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW)
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
        .creation_flags(CREATE_NO_WINDOW)
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
            format!("已打开目标：{target}"),
            "已交给 Windows 资源管理器处理。",
            None,
            Vec::new(),
            started_at,
        ),
        Err(error) => build_action_result(
            action_id,
            title,
            false,
            "目标无法打开。",
            error,
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_launch_capture() -> ToolActionResult {
    let started_at = Instant::now();

    if let Some(snipaste_path) = find_first_existing_path(&snipaste_detect_paths()) {
        match spawn_detached_path(&snipaste_path, &Vec::new()) {
            Ok(()) => {
                return build_action_result(
                    "launch_capture",
                    "截图",
                    true,
                    "Snipaste 已启动。按 F1 截图，按 F3 贴图。",
                    format!(
                        "组件：Snipaste\n执行文件：{}\n快捷键：F1 截图，F3 贴图",
                        snipaste_path.display()
                    ),
                    Some(snipaste_path.to_string_lossy().to_string()),
                    Vec::new(),
                    started_at,
                )
            }
            Err(error) => {
                return build_action_result(
                    "launch_capture",
                    "截图",
                    false,
                    "检测到 Snipaste，但启动失败。",
                    error,
                    Some(snipaste_path.to_string_lossy().to_string()),
                    Vec::new(),
                    started_at,
                )
            }
        }
    }

    match spawn_detached("explorer.exe", &[String::from("ms-screenclip:")]) {
        Ok(()) => build_action_result(
            "launch_capture",
            "截图",
            true,
            "已打开系统截图。",
            "当前使用 Windows 自带截图。你也可以在效率页开启 Snipaste 增强截图。",
            None,
            Vec::new(),
            started_at,
        ),
        Err(error) => build_action_result(
            "launch_capture",
            "截图",
            false,
            "系统截图工具无法启动。",
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
        "一键清理",
        true,
        format!(
            "已从 {} 清理 {} 个文件和 {} 个文件夹。",
            temp_dir.display(),
            stats.files_removed,
            stats.directories_removed
        ),
        format!(
            "预计释放空间：{}\n跳过被占用项目：{}",
            format_bytes(stats.bytes_freed),
            stats.skipped_entries
        ),
        Some(temp_dir.to_string_lossy().to_string()),
        vec![String::from(
            "被系统占用的临时文件会自动跳过，以确保清理过程更稳妥。",
        )],
        started_at,
    )
}

fn execute_creator_deep_clean_all() -> ToolActionResult {
    let started_at = Instant::now();
    build_action_result(
        "creator_deep_clean_all",
        "创作者缓存清理",
        false,
        "当前版本已移除创作者定向清理。",
        "Win Toolbox 现在只保留更通用的空间管理和系统清理能力。",
        None,
        Vec::new(),
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
                format!("{title} 已完成。")
            } else {
                format!("{title} 执行失败。")
            },
            format_process_details(&capture),
            None,
            vec![String::from(
                "如果 DISM 提示权限不足，请用管理员身份运行 Win Toolbox 后重试。",
            )],
            started_at,
        ),
        Err(error) => build_action_result(
            action_id,
            title,
            false,
            format!("{title} 无法启动。"),
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
            "驱动导出备份",
            false,
            "驱动备份目录无法创建。",
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
            "驱动导出备份",
            capture.success,
            if capture.success {
                format!("驱动已导出到 {}。", backup_dir.display())
            } else {
                "驱动导出未成功完成。".to_string()
            },
            format_process_details(&capture),
            Some(backup_dir.to_string_lossy().to_string()),
            vec![String::from(
                "在 Windows 上导出驱动通常需要管理员权限。",
            )],
            started_at,
        ),
        Err(error) => build_action_result(
            "export_drivers",
            "驱动导出备份",
            false,
            "驱动导出无法启动。",
            error,
            Some(backup_dir.to_string_lossy().to_string()),
            vec![String::from(
                "如果系统阻止导出，请尝试以管理员身份运行应用。",
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
                "打开扩展目录",
                true,
                format!("已打开 {}。", plugin_dir.display()),
                "这里保留给兼容扩展和便携工具使用。",
                Some(plugin_dir.to_string_lossy().to_string()),
                Vec::new(),
                started_at,
            ),
            Err(error) => build_action_result(
                "open_plugin_folder",
                "打开扩展目录",
                false,
                "扩展目录已存在，但无法打开。",
                error,
                Some(plugin_dir.to_string_lossy().to_string()),
                Vec::new(),
                started_at,
            ),
        },
        Err(error) => build_action_result(
            "open_plugin_folder",
            "打开扩展目录",
            false,
            "扩展目录无法准备完成。",
            error,
            Some(plugin_dir.to_string_lossy().to_string()),
            Vec::new(),
            started_at,
        ),
    }
}

fn execute_power_mode(
    action_id: &str,
    title: &str,
    guid: &str,
    success_summary: &str,
    warning: &str,
) -> ToolActionResult {
    let started_at = Instant::now();

    match run_command_capture("powercfg.exe", &["/S", guid]) {
        Ok(capture) => build_action_result(
            action_id,
            title,
            capture.success,
            if capture.success {
                success_summary.to_string()
            } else {
                format!("{title} 执行失败。")
            },
            format_process_details(&capture),
            None,
            vec![warning.to_string()],
            started_at,
        ),
        Err(error) => build_action_result(
            action_id,
            title,
            false,
            format!("{title} 无法启动。"),
            error,
            None,
            Vec::new(),
            started_at,
        ),
    }
}

fn ask_local_ai_internal(prompt: String, model: Option<String>) -> Result<AiChatResponse, String> {
    let runtime = get_ai_runtime_status_internal();
    if !runtime.ollama_installed {
        return Err("未检测到 Ollama，请先安装本地运行时。".to_string());
    }

    let selected_model = model
        .filter(|value| !value.trim().is_empty())
        .or_else(|| runtime.available_models.first().cloned())
        .ok_or_else(|| "没有检测到可用模型，请先拉取一个 Qwen 模型。".to_string())?;

    let capture = run_command_capture("ollama", &["run", &selected_model, &prompt])?;
    if capture.success {
        Ok(AiChatResponse {
            model: selected_model,
            answer: if capture.stdout.trim().is_empty() {
                "模型运行完成，但没有返回可见文本。".to_string()
            } else {
                capture.stdout.trim().to_string()
            },
        })
    } else {
        Err(format_process_details(&capture))
    }
}

fn execute_launch_plugin(plugin_id: &str) -> ToolActionResult {
    let started_at = Instant::now();

    let plugins = match load_plugins_internal() {
        Ok(plugins) => plugins,
        Err(error) => {
            return build_action_result(
                "launch_plugin",
                "启动扩展",
                false,
                "扩展清单无法读取。",
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
                "启动扩展",
                false,
                "所选扩展不在配置里。",
                format!("缺少扩展 ID：{plugin_id}"),
                None,
                Vec::new(),
                started_at,
            );
        }
    };

    if !plugin.installed {
        return build_action_result(
            "launch_plugin",
            "启动扩展",
            false,
            format!("{} 尚未安装。", plugin.name),
            plugin
                .resolved_path
                .unwrap_or_else(|| String::from("尚未解析到可执行文件路径。")),
            None,
            vec![String::from(
                "打开扩展目录，把便携版程序放到对应位置后重新扫描。",
            )],
            started_at,
        );
    }

    match plugin.resolved_path.clone() {
        Some(resolved_path) => match spawn_detached_path(Path::new(&resolved_path), &[]) {
            Ok(()) => build_action_result(
                "launch_plugin",
                "启动扩展",
                true,
                format!("已启动 {}。", plugin.name),
                format!("执行文件：{resolved_path}"),
                None,
                if plugin.requires_admin {
                    vec![String::from("这个扩展在管理员模式下可能会更稳定。")]
                } else {
                    Vec::new()
                },
                started_at,
            ),
            Err(error) => build_action_result(
                "launch_plugin",
                "启动扩展",
                false,
                format!("已找到 {}，但启动失败。", plugin.name),
                error,
                None,
                Vec::new(),
                started_at,
            ),
        },
        None => build_action_result(
            "launch_plugin",
            "启动扩展",
            false,
            format!("{} 没有可用的执行路径。", plugin.name),
            "请检查 config.json，并确认 executable 字段填写正确。",
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
            execute_open_target("ms-settings:appsfeatures", "应用管理", "open_apps_features")
        }
        "open_notifications" => {
            execute_open_target("ms-settings:notifications", "通知净化", "open_notifications")
        }
        "open_windows_update" => {
            execute_open_target("ms-settings:windowsupdate", "更新中心", "open_windows_update")
        }
        "dism_check_health" => execute_dism(
            "dism_check_health",
            "DISM 快速检查",
            &["/Online", "/Cleanup-Image", "/CheckHealth"],
        ),
        "dism_scan_health" => execute_dism(
            "dism_scan_health",
            "DISM 深度扫描",
            &["/Online", "/Cleanup-Image", "/ScanHealth"],
        ),
        "export_drivers" => execute_driver_export(),
        "enable_beast_mode" => execute_power_mode(
            "enable_beast_mode",
            "性能野兽模式",
            HIGH_PERFORMANCE_GUID,
            "已切换到高性能电源策略，适合渲染、导出和本地推理场景。",
            "高性能模式会更耗电、发热也会更明显，用完建议恢复平衡模式。",
        ),
        "restore_balanced_mode" => execute_power_mode(
            "restore_balanced_mode",
            "恢复平衡模式",
            BALANCED_GUID,
            "已恢复到平衡电源策略。",
            "如果你正在跑渲染或推理任务，请确认恢复时机。",
        ),
        _ => build_action_result(
            action_id,
            "未知动作",
            false,
            "请求的动作尚未实现。",
            format!("未知动作 ID：{action_id}"),
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
fn list_components() -> Result<Vec<ComponentManifest>, String> {
    Ok(list_components_internal())
}

#[tauri::command]
async fn run_tool_action(action_id: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_tool_action(&action_id))
        .await
        .map_err(|error| format!("执行动作任务失败：{error}"))
}

#[tauri::command]
async fn launch_plugin(plugin_id: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_launch_plugin(&plugin_id))
        .await
        .map_err(|error| format!("执行扩展任务失败：{error}"))
}

#[tauri::command]
async fn launch_component(component_id: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || launch_component_internal(&component_id))
        .await
        .map_err(|error| format!("启动组件任务失败：{error}"))?
}

#[tauri::command]
async fn manage_component(component_id: String, operation: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || match operation.as_str() {
        "install" | "repair" => install_component_internal(&component_id),
        "uninstall" => uninstall_component_internal(&component_id),
        "disable" => disable_component_internal(&component_id),
        _ => Err(format!("未知组件操作：{operation}")),
    })
    .await
    .map_err(|error| format!("组件管理任务失败：{error}"))?
}

#[tauri::command]
async fn open_target(target: String) -> Result<ToolActionResult, String> {
    tauri::async_runtime::spawn_blocking(move || execute_open_target(&target, "打开目标", "open_target"))
        .await
        .map_err(|error| format!("打开目标任务失败：{error}"))
}

#[tauri::command]
async fn scan_storage_hotspots() -> Result<Vec<StorageHotspot>, String> {
    tauri::async_runtime::spawn_blocking(scan_storage_hotspots_internal)
        .await
        .map_err(|error| format!("扫描空间热点失败：{error}"))
}

#[tauri::command]
async fn get_ai_runtime_status() -> Result<AiRuntimeStatus, String> {
    tauri::async_runtime::spawn_blocking(get_ai_runtime_status_internal)
        .await
        .map_err(|error| format!("璇诲彇 AI 杩愯鏃剁姸鎬佸け璐ワ細{error}"))
}

#[tauri::command]
async fn ask_local_ai(prompt: String, model: Option<String>) -> Result<AiChatResponse, String> {
    tauri::async_runtime::spawn_blocking(move || ask_local_ai_internal(prompt, model))
        .await
        .map_err(|error| format!("本地 AI 调用失败：{error}"))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_snapshot,
            list_components,
            run_tool_action,
            launch_component,
            manage_component,
            open_target,
            scan_storage_hotspots,
            get_ai_runtime_status,
            ask_local_ai
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

