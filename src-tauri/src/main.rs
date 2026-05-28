use chrono::Utc;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

const DEFAULT_DATA_ROOT: &str = "F:/AINovelistData";
const DATABASE_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppEnvironment {
    workspace_path: String,
    knowledge_base_path: String,
    database_path: String,
    models_path: String,
    cache_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseStatus {
    database_path: String,
    schema_version: u32,
    project_count: i64,
    chapter_count: i64,
    character_count: i64,
    knowledge_count: i64,
    hard_constraint_count: i64,
    last_synced_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseSyncResult {
    status: DatabaseStatus,
    synced_projects: usize,
    synced_chapters: usize,
    synced_characters: usize,
    synced_knowledge: usize,
    synced_hard_constraints: usize,
    warnings: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Project {
    schema_version: u8,
    id: String,
    name: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ChapterMeta {
    schema_version: u8,
    id: String,
    title: String,
    order: u32,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChapterDocument {
    meta: ChapterMeta,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectWorkspace {
    project: Project,
    chapters: Vec<ChapterMeta>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateProjectInput {
    name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct OpenProjectInput {
    project_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateChapterInput {
    project_id: String,
    title: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChapterIdInput {
    project_id: String,
    chapter_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveChapterInput {
    project_id: String,
    chapter_id: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Character {
    schema_version: u8,
    id: String,
    name: String,
    role: String,
    aliases: Vec<String>,
    tags: Vec<String>,
    appearance: String,
    motivation: String,
    notes: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListCharactersInput {
    project_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateCharacterInput {
    project_id: String,
    name: String,
    role: String,
    aliases: Vec<String>,
    tags: Vec<String>,
    appearance: String,
    motivation: String,
    notes: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DeleteCharacterInput {
    project_id: String,
    character_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct KnowledgeEntry {
    id: String,
    title: String,
    category: Option<String>,
    tags: Vec<String>,
    #[serde(rename = "type")]
    entry_type: Option<String>,
    source_path: Option<String>,
    excerpt: Option<String>,
    updated_at: Option<String>,
}

#[derive(Debug, Deserialize)]
struct KnowledgeSearchInput {
    query: Option<String>,
    tags: Option<Vec<String>>,
    category: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct HardConstraint {
    id: String,
    #[serde(rename = "type")]
    constraint_type: String,
    content: String,
    priority: String,
    source: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListMemoryInput {
    project_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateHardConstraintInput {
    project_id: String,
    #[serde(rename = "type")]
    constraint_type: String,
    content: String,
    priority: String,
    source: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DeleteHardConstraintInput {
    project_id: String,
    constraint_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct WritingRequest {
    project_id: Option<String>,
    intent: String,
    pov_character_id: Option<String>,
    scene_type: String,
    mood: String,
    pacing: String,
    required_character_ids: Vec<String>,
    banned_character_ids: Vec<String>,
    target_words: u32,
    user_note: Option<String>,
    knowledge_entry_ids: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GenerateTextResult {
    text: String,
    provider: String,
    created_at: String,
}

#[derive(Debug, Deserialize)]
struct ExportProjectInput {
    project_id: String,
    format: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportProjectResult {
    file_path: String,
    format: String,
    chapter_count: usize,
    exported_at: String,
}

#[tauri::command]
fn app_get_environment() -> AppEnvironment {
    AppEnvironment {
        workspace_path: workspace_root().to_string_lossy().to_string(),
        knowledge_base_path: knowledge_root().to_string_lossy().to_string(),
        database_path: database_path().to_string_lossy().to_string(),
        models_path: Path::new(DEFAULT_DATA_ROOT).join("models").to_string_lossy().to_string(),
        cache_path: Path::new(DEFAULT_DATA_ROOT).join("cache").to_string_lossy().to_string(),
    }
}

#[tauri::command]
fn database_status() -> Result<DatabaseStatus, String> {
    let conn = open_database()?;
    read_database_status(&conn)
}

#[tauri::command]
fn database_sync() -> Result<DatabaseSyncResult, String> {
    sync_database_from_files()
}

#[tauri::command]
fn project_list() -> Result<Vec<Project>, String> {
    list_projects_from_files()
}

fn list_projects_from_files() -> Result<Vec<Project>, String> {
    ensure_dir(&workspace_root())?;
    let mut projects = vec![];
    for entry in fs::read_dir(workspace_root()).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        if !entry.file_type().map_err(to_error)?.is_dir() {
            continue;
        }
        let path = entry.path().join("novel.json");
        if path.exists() {
            if let Ok(project) = read_json::<Project>(&path) {
                projects.push(project);
            }
        }
    }
    projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(projects)
}

#[tauri::command]
fn project_create(input: CreateProjectInput) -> Result<ProjectWorkspace, String> {
    let now = now_iso();
    let project = Project {
        schema_version: 1,
        id: create_id("project"),
        name: input.name.trim().to_string(),
        created_at: now.clone(),
        updated_at: now,
    };
    let project_path = project_path(&project.id)?;
    ensure_project_structure(&project_path)?;
    write_json_atomic(&project_path.join("novel.json"), &project, Some(&project_path.join(".backup")))?;
    write_json_atomic(&project_path.join("characters.json"), &Vec::<Character>::new(), Some(&project_path.join(".backup")))?;
    write_json_atomic(&project_path.join("relations.json"), &Vec::<Value>::new(), Some(&project_path.join(".backup")))?;
    write_json_atomic(&project_path.join("timeline.json"), &Vec::<Value>::new(), Some(&project_path.join(".backup")))?;
    write_json_atomic(&project_path.join("plots.json"), &Vec::<Value>::new(), Some(&project_path.join(".backup")))?;
    write_json_atomic(&project_path.join("config.json"), &json!({}), Some(&project_path.join(".backup")))?;
    let _ = sync_database_from_files();
    Ok(ProjectWorkspace { project, chapters: vec![] })
}

#[tauri::command]
fn project_open(input: OpenProjectInput) -> Result<ProjectWorkspace, String> {
    open_project(&input.project_id)
}

#[tauri::command]
fn chapter_create(input: CreateChapterInput) -> Result<ChapterDocument, String> {
    let workspace = open_project(&input.project_id)?;
    let now = now_iso();
    let meta = ChapterMeta {
        schema_version: 1,
        id: create_id("chapter"),
        title: input.title.trim().to_string(),
        order: workspace.chapters.len() as u32,
        created_at: now.clone(),
        updated_at: now.clone(),
    };
    let project_path = project_path(&input.project_id)?;
    ensure_dir(&project_path.join("chapters"))?;
    ensure_dir(&project_path.join("chapters_meta"))?;
    write_json_atomic(&chapter_meta_path(&input.project_id, &meta.id)?, &meta, Some(&project_path.join(".backup")))?;
    write_text_atomic(&chapter_markdown_path(&input.project_id, &meta.id)?, "", Some(&project_path.join(".backup")))?;
    touch_project(&input.project_id)?;
    let _ = sync_project_to_database(&input.project_id);
    Ok(ChapterDocument { meta, content: String::new() })
}

#[tauri::command]
fn chapter_read(input: ChapterIdInput) -> Result<ChapterDocument, String> {
    let meta = read_json::<ChapterMeta>(&chapter_meta_path(&input.project_id, &input.chapter_id)?)?;
    let content = fs::read_to_string(chapter_markdown_path(&input.project_id, &input.chapter_id)?).map_err(to_error)?;
    Ok(ChapterDocument { meta, content })
}

#[tauri::command]
fn chapter_save(input: SaveChapterInput) -> Result<ChapterDocument, String> {
    let meta_path = chapter_meta_path(&input.project_id, &input.chapter_id)?;
    let mut meta = read_json::<ChapterMeta>(&meta_path)?;
    meta.updated_at = now_iso();
    let backup = project_path(&input.project_id)?.join(".backup");
    write_text_atomic(&chapter_markdown_path(&input.project_id, &input.chapter_id)?, &input.content, Some(&backup))?;
    write_json_atomic(&meta_path, &meta, Some(&backup))?;
    touch_project(&input.project_id)?;
    let _ = sync_project_to_database(&input.project_id);
    Ok(ChapterDocument { meta, content: input.content })
}

#[tauri::command]
fn character_list(input: ListCharactersInput) -> Result<Vec<Character>, String> {
    read_json(&project_path(&input.project_id)?.join("characters.json"))
}

#[tauri::command]
fn character_create(input: CreateCharacterInput) -> Result<Character, String> {
    let mut characters = character_list(ListCharactersInput { project_id: input.project_id.clone() })?;
    let now = now_iso();
    let character = Character {
        schema_version: 1,
        id: create_id("char"),
        name: input.name.trim().to_string(),
        role: input.role,
        aliases: input.aliases,
        tags: input.tags,
        appearance: input.appearance,
        motivation: input.motivation,
        notes: input.notes,
        created_at: now.clone(),
        updated_at: now,
    };
    characters.push(character.clone());
    write_json_atomic(&project_path(&input.project_id)?.join("characters.json"), &characters, Some(&project_path(&input.project_id)?.join(".backup")))?;
    touch_project(&input.project_id)?;
    let _ = sync_project_to_database(&input.project_id);
    Ok(character)
}

#[tauri::command]
fn character_delete(input: DeleteCharacterInput) -> Result<(), String> {
    let mut characters = character_list(ListCharactersInput { project_id: input.project_id.clone() })?;
    let before = characters.len();
    characters.retain(|character| character.id != input.character_id);
    if before == characters.len() {
        return Err("人物不存在".to_string());
    }
    write_json_atomic(&project_path(&input.project_id)?.join("characters.json"), &characters, Some(&project_path(&input.project_id)?.join(".backup")))?;
    let _ = sync_project_to_database(&input.project_id);
    touch_project(&input.project_id)
}

#[tauri::command]
fn knowledge_search(input: KnowledgeSearchInput) -> Result<Vec<KnowledgeEntry>, String> {
    ensure_dir(&knowledge_root())?;
    let mut entries = vec![];
    for path in list_markdown_files(&knowledge_root())? {
        entries.push(read_knowledge_entry(&path)?);
    }
    let query = input.query.unwrap_or_default().to_lowercase();
    let tags = input.tags.unwrap_or_default().into_iter().map(|tag| tag.to_lowercase()).collect::<Vec<_>>();
    let category = input.category.map(|value| value.to_lowercase());
    entries.retain(|entry| {
        let searchable = format!("{} {} {} {}", entry.title, entry.category.clone().unwrap_or_default(), entry.tags.join(" "), entry.excerpt.clone().unwrap_or_default()).to_lowercase();
        let tag_match = tags.is_empty() || entry.tags.iter().any(|tag| tags.contains(&tag.to_lowercase()));
        let category_match = category.as_ref().map(|expected| entry.category.clone().unwrap_or_default().to_lowercase() == *expected).unwrap_or(true);
        let query_match = query.is_empty() || searchable.contains(&query);
        tag_match && category_match && query_match
    });
    entries.truncate(50);
    Ok(entries)
}

#[tauri::command]
fn memory_list_hard_constraints(input: ListMemoryInput) -> Result<Vec<HardConstraint>, String> {
    read_memory_file(&input.project_id, "hard_constraints.json")
}

#[tauri::command]
fn memory_create_hard_constraint(input: CreateHardConstraintInput) -> Result<HardConstraint, String> {
    let mut constraints = memory_list_hard_constraints(ListMemoryInput { project_id: input.project_id.clone() })?;
    let constraint = HardConstraint {
        id: create_id("rule"),
        constraint_type: input.constraint_type,
        content: input.content,
        priority: input.priority,
        source: input.source,
    };
    constraints.push(constraint.clone());
    write_memory_file(&input.project_id, "hard_constraints.json", &constraints)?;
    touch_project(&input.project_id)?;
    let _ = sync_project_to_database(&input.project_id);
    Ok(constraint)
}

#[tauri::command]
fn memory_delete_hard_constraint(input: DeleteHardConstraintInput) -> Result<(), String> {
    let mut constraints = memory_list_hard_constraints(ListMemoryInput { project_id: input.project_id.clone() })?;
    constraints.retain(|item| item.id != input.constraint_id);
    write_memory_file(&input.project_id, "hard_constraints.json", &constraints)?;
    let _ = sync_project_to_database(&input.project_id);
    touch_project(&input.project_id)
}

#[tauri::command]
fn ai_generate(request: WritingRequest) -> Result<GenerateTextResult, String> {
    let context = request.project_id.as_ref().map(|project_id| collect_ai_context(project_id)).transpose()?.unwrap_or_else(|| json!({}));
    let payload = json!({
        "request": request,
        "context": context
    });
    run_python_ai(payload)
}

#[tauri::command]
fn export_project(input: ExportProjectInput) -> Result<ExportProjectResult, String> {
    let workspace = open_project(&input.project_id)?;
    let documents = workspace.chapters.iter().map(|chapter| {
        chapter_read(ChapterIdInput { project_id: input.project_id.clone(), chapter_id: chapter.id.clone() })
    }).collect::<Result<Vec<_>, _>>()?;
    let content = if input.format == "txt" {
        render_text(&workspace.project.name, &documents)
    } else {
        render_markdown(&workspace.project.name, &documents)
    };
    let extension = if input.format == "txt" { "txt" } else { "md" };
    let export_dir = project_path(&input.project_id)?.join("exports");
    ensure_dir(&export_dir)?;
    let file_path = export_dir.join(format!("{}.{}", safe_file_name(&workspace.project.name), extension));
    write_text_atomic(&file_path, &content, Some(&project_path(&input.project_id)?.join(".backup")))?;
    Ok(ExportProjectResult {
        file_path: file_path.to_string_lossy().to_string(),
        format: input.format,
        chapter_count: documents.len(),
        exported_at: now_iso(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            app_get_environment,
            database_status,
            database_sync,
            project_list,
            project_create,
            project_open,
            chapter_create,
            chapter_read,
            chapter_save,
            character_list,
            character_create,
            character_delete,
            knowledge_search,
            memory_list_hard_constraints,
            memory_create_hard_constraint,
            memory_delete_hard_constraint,
            ai_generate,
            export_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn workspace_root() -> PathBuf {
    data_root().join("workspace")
}

fn knowledge_root() -> PathBuf {
    data_root().join("knowledge_base")
}

fn data_root() -> PathBuf {
    Path::new(DEFAULT_DATA_ROOT).to_path_buf()
}

fn database_path() -> PathBuf {
    data_root().join("ainovelist.db")
}

fn open_database() -> Result<Connection, String> {
    ensure_dir(&data_root())?;
    let conn = Connection::open(database_path()).map_err(to_error)?;
    initialize_database(&conn)?;
    Ok(conn)
}

fn initialize_database(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS app_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            schema_version INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            schema_version INTEGER NOT NULL,
            title TEXT NOT NULL,
            chapter_order INTEGER NOT NULL,
            content_path TEXT NOT NULL,
            word_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_chapters_project_order ON chapters(project_id, chapter_order);
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            schema_version INTEGER NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            aliases_json TEXT NOT NULL,
            tags_json TEXT NOT NULL,
            appearance TEXT NOT NULL,
            motivation TEXT NOT NULL,
            notes TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_characters_project_role ON characters(project_id, role);
        CREATE TABLE IF NOT EXISTS hard_constraints (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            constraint_type TEXT NOT NULL,
            content TEXT NOT NULL,
            priority TEXT NOT NULL,
            source TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_constraints_project_priority ON hard_constraints(project_id, priority);
        CREATE TABLE IF NOT EXISTS knowledge_entries (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT,
            tags_json TEXT NOT NULL,
            entry_type TEXT,
            source_path TEXT,
            excerpt TEXT,
            updated_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_entries(category);
        ",
    ).map_err(to_error)?;
    conn.execute(
        "INSERT INTO app_meta (key, value) VALUES ('schema_version', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![DATABASE_SCHEMA_VERSION.to_string()],
    ).map_err(to_error)?;
    Ok(())
}

fn read_database_status(conn: &Connection) -> Result<DatabaseStatus, String> {
    let schema_version = read_meta(conn, "schema_version")?.and_then(|value| value.parse::<u32>().ok()).unwrap_or(DATABASE_SCHEMA_VERSION);
    Ok(DatabaseStatus {
        database_path: database_path().to_string_lossy().to_string(),
        schema_version,
        project_count: count_rows(conn, "projects")?,
        chapter_count: count_rows(conn, "chapters")?,
        character_count: count_rows(conn, "characters")?,
        knowledge_count: count_rows(conn, "knowledge_entries")?,
        hard_constraint_count: count_rows(conn, "hard_constraints")?,
        last_synced_at: read_meta(conn, "last_synced_at")?,
    })
}

fn sync_database_from_files() -> Result<DatabaseSyncResult, String> {
    let conn = open_database()?;
    let mut warnings = vec![];
    let mut synced_projects = 0;
    let mut synced_chapters = 0;
    let mut synced_characters = 0;
    let mut synced_hard_constraints = 0;

    for project in list_projects_from_files()? {
        match open_project(&project.id) {
            Ok(workspace) => {
                let result = sync_project_snapshot(&conn, &workspace)?;
                synced_projects += 1;
                synced_chapters += result.0;
                synced_characters += result.1;
                synced_hard_constraints += result.2;
            }
            Err(error) => warnings.push(format!("跳过作品 {}：{}", project.id, error)),
        }
    }

    let synced_knowledge = sync_knowledge_to_database(&conn, &mut warnings)?;
    set_meta(&conn, "last_synced_at", &now_iso())?;
    let status = read_database_status(&conn)?;
    Ok(DatabaseSyncResult {
        status,
        synced_projects,
        synced_chapters,
        synced_characters,
        synced_knowledge,
        synced_hard_constraints,
        warnings,
    })
}

fn sync_project_to_database(project_id: &str) -> Result<(), String> {
    let conn = open_database()?;
    let workspace = open_project(project_id)?;
    sync_project_snapshot(&conn, &workspace)?;
    set_meta(&conn, "last_synced_at", &now_iso())
}

fn sync_project_snapshot(conn: &Connection, workspace: &ProjectWorkspace) -> Result<(usize, usize, usize), String> {
    conn.execute(
        "INSERT INTO projects (id, schema_version, name, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id) DO UPDATE SET
            schema_version = excluded.schema_version,
            name = excluded.name,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at",
        params![
            workspace.project.id,
            workspace.project.schema_version,
            workspace.project.name,
            workspace.project.created_at,
            workspace.project.updated_at,
        ],
    ).map_err(to_error)?;

    conn.execute("DELETE FROM chapters WHERE project_id = ?1", params![workspace.project.id]).map_err(to_error)?;
    conn.execute("DELETE FROM characters WHERE project_id = ?1", params![workspace.project.id]).map_err(to_error)?;
    conn.execute("DELETE FROM hard_constraints WHERE project_id = ?1", params![workspace.project.id]).map_err(to_error)?;

    for chapter in &workspace.chapters {
        let content_path = chapter_markdown_path(&workspace.project.id, &chapter.id)?;
        let content = fs::read_to_string(&content_path).unwrap_or_default();
        conn.execute(
            "INSERT INTO chapters (id, project_id, schema_version, title, chapter_order, content_path, word_count, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                chapter.id,
                workspace.project.id,
                chapter.schema_version,
                chapter.title,
                chapter.order,
                content_path.to_string_lossy().to_string(),
                count_words(&content) as i64,
                chapter.created_at,
                chapter.updated_at,
            ],
        ).map_err(to_error)?;
    }

    let characters = character_list(ListCharactersInput { project_id: workspace.project.id.clone() }).unwrap_or_default();
    for character in &characters {
        conn.execute(
            "INSERT INTO characters (id, project_id, schema_version, name, role, aliases_json, tags_json, appearance, motivation, notes, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                character.id,
                workspace.project.id,
                character.schema_version,
                character.name,
                character.role,
                serde_json::to_string(&character.aliases).map_err(to_error)?,
                serde_json::to_string(&character.tags).map_err(to_error)?,
                character.appearance,
                character.motivation,
                character.notes,
                character.created_at,
                character.updated_at,
            ],
        ).map_err(to_error)?;
    }

    let constraints = memory_list_hard_constraints(ListMemoryInput { project_id: workspace.project.id.clone() }).unwrap_or_default();
    for constraint in &constraints {
        conn.execute(
            "INSERT INTO hard_constraints (id, project_id, constraint_type, content, priority, source)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                constraint.id,
                workspace.project.id,
                constraint.constraint_type,
                constraint.content,
                constraint.priority,
                constraint.source,
            ],
        ).map_err(to_error)?;
    }

    Ok((workspace.chapters.len(), characters.len(), constraints.len()))
}

fn sync_knowledge_to_database(conn: &Connection, warnings: &mut Vec<String>) -> Result<usize, String> {
    ensure_dir(&knowledge_root())?;
    let mut synced = 0;
    for path in list_markdown_files(&knowledge_root())? {
        match read_knowledge_entry(&path) {
            Ok(entry) => {
                conn.execute(
                    "INSERT INTO knowledge_entries (id, title, category, tags_json, entry_type, source_path, excerpt, updated_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                     ON CONFLICT(id) DO UPDATE SET
                        title = excluded.title,
                        category = excluded.category,
                        tags_json = excluded.tags_json,
                        entry_type = excluded.entry_type,
                        source_path = excluded.source_path,
                        excerpt = excluded.excerpt,
                        updated_at = excluded.updated_at",
                    params![
                        entry.id,
                        entry.title,
                        entry.category,
                        serde_json::to_string(&entry.tags).map_err(to_error)?,
                        entry.entry_type,
                        entry.source_path,
                        entry.excerpt,
                        entry.updated_at,
                    ],
                ).map_err(to_error)?;
                synced += 1;
            }
            Err(error) => warnings.push(format!("跳过知识文件 {}：{}", path.to_string_lossy(), error)),
        }
    }
    Ok(synced)
}

fn count_rows(conn: &Connection, table_name: &str) -> Result<i64, String> {
    let sql = format!("SELECT COUNT(*) FROM {table_name}");
    conn.query_row(&sql, [], |row| row.get(0)).map_err(to_error)
}

fn read_meta(conn: &Connection, key: &str) -> Result<Option<String>, String> {
    let mut statement = conn.prepare("SELECT value FROM app_meta WHERE key = ?1").map_err(to_error)?;
    let mut rows = statement.query(params![key]).map_err(to_error)?;
    if let Some(row) = rows.next().map_err(to_error)? {
        Ok(Some(row.get(0).map_err(to_error)?))
    } else {
        Ok(None)
    }
}

fn set_meta(conn: &Connection, key: &str, value: &str) -> Result<(), String> {
    conn.execute(
        "INSERT INTO app_meta (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    ).map_err(to_error)?;
    Ok(())
}

fn count_words(value: &str) -> usize {
    value.chars().filter(|c| !c.is_whitespace()).count()
}

fn open_project(project_id: &str) -> Result<ProjectWorkspace, String> {
    let project = read_json::<Project>(&project_path(project_id)?.join("novel.json"))?;
    let chapters = list_chapters(project_id)?;
    Ok(ProjectWorkspace { project, chapters })
}

fn list_chapters(project_id: &str) -> Result<Vec<ChapterMeta>, String> {
    let meta_dir = project_path(project_id)?.join("chapters_meta");
    ensure_dir(&meta_dir)?;
    let mut chapters = vec![];
    for entry in fs::read_dir(meta_dir).map_err(to_error)? {
        let path = entry.map_err(to_error)?.path();
        if path.extension().and_then(|value| value.to_str()) == Some("json") {
            chapters.push(read_json::<ChapterMeta>(&path)?);
        }
    }
    chapters.sort_by_key(|chapter| chapter.order);
    Ok(chapters)
}

fn touch_project(project_id: &str) -> Result<(), String> {
    let path = project_path(project_id)?.join("novel.json");
    let mut project = read_json::<Project>(&path)?;
    project.updated_at = now_iso();
    write_json_atomic(&path, &project, Some(&project_path(project_id)?.join(".backup")))
}

fn ensure_project_structure(project_path: &Path) -> Result<(), String> {
    ensure_dir(project_path)?;
    ensure_dir(&project_path.join("chapters"))?;
    ensure_dir(&project_path.join("chapters_meta"))?;
    ensure_dir(&project_path.join("memory"))?;
    ensure_dir(&project_path.join(".backup"))
}

fn project_path(project_id: &str) -> Result<PathBuf, String> {
    assert_safe_id(project_id)?;
    resolve_inside(&workspace_root(), &[project_id])
}

fn chapter_meta_path(project_id: &str, chapter_id: &str) -> Result<PathBuf, String> {
    assert_safe_id(chapter_id)?;
    Ok(project_path(project_id)?.join("chapters_meta").join(format!("{chapter_id}.json")))
}

fn chapter_markdown_path(project_id: &str, chapter_id: &str) -> Result<PathBuf, String> {
    assert_safe_id(chapter_id)?;
    Ok(project_path(project_id)?.join("chapters").join(format!("{chapter_id}.md")))
}

fn read_memory_file<T: for<'de> Deserialize<'de>>(project_id: &str, file_name: &str) -> Result<Vec<T>, String> {
    let path = project_path(project_id)?.join("memory").join(file_name);
    if !path.exists() {
        return Ok(vec![]);
    }
    read_json(&path)
}

fn write_memory_file<T: Serialize>(project_id: &str, file_name: &str, value: &Vec<T>) -> Result<(), String> {
    let project_path = project_path(project_id)?;
    ensure_dir(&project_path.join("memory"))?;
    write_json_atomic(&project_path.join("memory").join(file_name), value, Some(&project_path.join(".backup")))
}

fn collect_ai_context(project_id: &str) -> Result<Value, String> {
    let characters = character_list(ListCharactersInput { project_id: project_id.to_string() }).unwrap_or_default();
    let constraints = memory_list_hard_constraints(ListMemoryInput { project_id: project_id.to_string() }).unwrap_or_default();
    let knowledge = knowledge_search(KnowledgeSearchInput { query: Some(String::new()), tags: Some(vec![]), category: None }).unwrap_or_default();
    Ok(json!({
        "characters": characters,
        "hardConstraints": constraints,
        "knowledge": knowledge.into_iter().take(5).collect::<Vec<_>>()
    }))
}

fn run_python_ai(payload: Value) -> Result<GenerateTextResult, String> {
    let script = ai_service_script_path()?;
    let python = std::env::var("AINOVELIST_PYTHON").unwrap_or_else(|_| "python".to_string());
    let mut child = Command::new(python)
        .arg(script)
        .arg("generate")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("无法启动 Python AI 服务: {error}"))?;
    if let Some(stdin) = child.stdin.as_mut() {
        stdin.write_all(payload.to_string().as_bytes()).map_err(to_error)?;
    }
    let output = child.wait_with_output().map_err(to_error)?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(to_error)
}

fn ai_service_script_path() -> Result<PathBuf, String> {
    let relative = Path::new("services").join("ai").join("ainovelist_ai_service.py");
    let mut bases = vec![];

    if let Ok(current_dir) = std::env::current_dir() {
        bases.push(current_dir);
    }
    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(exe_dir) = current_exe.parent() {
            bases.push(exe_dir.to_path_buf());
        }
    }

    for base in bases {
        for ancestor in base.ancestors().take(8) {
            let candidate = ancestor.join(&relative);
            if candidate.exists() {
                return Ok(candidate);
            }
        }
    }

    Err(format!("无法定位 Python AI 服务脚本: {}", relative.to_string_lossy()))
}

fn list_markdown_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    let mut files = vec![];
    for entry in fs::read_dir(root).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let path = entry.path();
        if entry.file_type().map_err(to_error)?.is_dir() {
            files.extend(list_markdown_files(&path)?);
        } else if path.extension().and_then(|value| value.to_str()).map(|value| value.eq_ignore_ascii_case("md")).unwrap_or(false) {
            files.push(path);
        }
    }
    files.sort();
    Ok(files)
}

fn read_knowledge_entry(path: &Path) -> Result<KnowledgeEntry, String> {
    let content = fs::read_to_string(path).map_err(to_error)?;
    let (frontmatter, body) = split_frontmatter(&content);
    let relative = path.strip_prefix(knowledge_root()).unwrap_or(path).to_string_lossy().replace('\\', "/");
    let title = frontmatter_value(&frontmatter, "title").or_else(|| first_heading(&body)).unwrap_or_else(|| {
        path.file_stem().and_then(|value| value.to_str()).unwrap_or("untitled").to_string()
    });
    let tags = frontmatter_array(&frontmatter, "tags");
    let category = frontmatter_value(&frontmatter, "category").or_else(|| relative.split('/').next().map(|value| value.to_string()));
    Ok(KnowledgeEntry {
        id: frontmatter_value(&frontmatter, "kb_id").unwrap_or_else(|| format!("kb_{}", relative.replace(|c: char| !c.is_ascii_alphanumeric(), "_"))),
        title,
        category,
        tags,
        entry_type: frontmatter_value(&frontmatter, "type"),
        source_path: Some(relative),
        excerpt: Some(body.replace('\n', " ").split_whitespace().collect::<Vec<_>>().join(" ").chars().take(180).collect()),
        updated_at: fs::metadata(path).ok().and_then(|meta| meta.modified().ok()).map(system_time_to_iso),
    })
}

fn split_frontmatter(content: &str) -> (String, String) {
    if let Some(rest) = content.strip_prefix("---\n") {
        if let Some(index) = rest.find("\n---") {
            return (rest[..index].to_string(), rest[index + 4..].trim_start().to_string());
        }
    }
    (String::new(), content.to_string())
}

fn frontmatter_value(frontmatter: &str, key: &str) -> Option<String> {
    frontmatter.lines().find_map(|line| {
        let (left, right) = line.split_once(':')?;
        if left.trim() == key {
            let value = right.trim().trim_matches('"').trim_matches('\'').to_string();
            if value.is_empty() { None } else { Some(value) }
        } else {
            None
        }
    })
}

fn frontmatter_array(frontmatter: &str, key: &str) -> Vec<String> {
    frontmatter_value(frontmatter, key)
        .map(|value| value.trim_matches(['[', ']']).split(',').map(|item| item.trim().trim_matches('"').trim_matches('\'').to_string()).filter(|item| !item.is_empty()).collect())
        .unwrap_or_default()
}

fn first_heading(content: &str) -> Option<String> {
    content.lines().find_map(|line| line.strip_prefix("# ").map(|value| value.trim().to_string()))
}

fn render_markdown(title: &str, documents: &[ChapterDocument]) -> String {
    let mut output = format!("# {title}\n");
    for document in documents {
        output.push_str(&format!("\n## {}\n\n{}\n", document.meta.title, document.content.trim()));
    }
    output
}

fn render_text(title: &str, documents: &[ChapterDocument]) -> String {
    let mut output = format!("{title}\n");
    for document in documents {
        output.push_str(&format!("\n{}\n\n{}\n", document.meta.title, strip_markdown(&document.content)));
    }
    output
}

fn strip_markdown(content: &str) -> String {
    content.lines().map(|line| line.trim_start_matches('#').trim_start_matches(['>', '-', '*', '`', ' '])).collect::<Vec<_>>().join("\n")
}

fn read_json<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<T, String> {
    let text = fs::read_to_string(path).map_err(to_error)?;
    serde_json::from_str(&text).map_err(to_error)
}

fn write_json_atomic<T: Serialize>(path: &Path, value: &T, backup_dir: Option<&Path>) -> Result<(), String> {
    let text = serde_json::to_string_pretty(value).map_err(to_error)? + "\n";
    write_text_atomic(path, &text, backup_dir)
}

fn write_text_atomic(path: &Path, content: &str, backup_dir: Option<&Path>) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        ensure_dir(parent)?;
    }
    if path.exists() {
        if let Some(backup_dir) = backup_dir {
            ensure_dir(backup_dir)?;
            let file_name = path.file_name().and_then(|value| value.to_str()).unwrap_or("backup");
            let backup_path = backup_dir.join(format!("{}.{}", now_iso().replace([':', '.'], "-"), file_name));
            fs::copy(path, backup_path).map_err(to_error)?;
        }
    }
    let tmp_path = path.with_extension(format!("{}.tmp", std::process::id()));
    fs::write(&tmp_path, content).map_err(to_error)?;
    fs::rename(tmp_path, path).map_err(to_error)
}

fn ensure_dir(path: &Path) -> Result<(), String> {
    fs::create_dir_all(path).map_err(to_error)
}

fn resolve_inside(root: &Path, segments: &[&str]) -> Result<PathBuf, String> {
    let root = root.to_path_buf();
    let mut target = root.clone();
    for segment in segments {
        target.push(segment);
    }
    let normalized_root = normalize_path(&root);
    let normalized_target = normalize_path(&target);
    if normalized_target != normalized_root && !normalized_target.starts_with(&(normalized_root + "\\")) {
        return Err("路径越界，已拒绝访问".to_string());
    }
    Ok(target)
}

fn normalize_path(path: &Path) -> String {
    path.to_string_lossy().replace('/', "\\").to_lowercase()
}

fn assert_safe_id(id: &str) -> Result<(), String> {
    if id.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-') {
        Ok(())
    } else {
        Err("ID 包含非法字符，已拒绝访问".to_string())
    }
}

fn create_id(prefix: &str) -> String {
    let millis = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis();
    format!("{prefix}_{millis}")
}

fn safe_file_name(name: &str) -> String {
    let result = name.chars().map(|c| if r#"<>:"/\|?*"#.contains(c) || c.is_control() { '_' } else { c }).collect::<String>();
    if result.trim().is_empty() { "novel".to_string() } else { result }
}

fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn system_time_to_iso(time: SystemTime) -> String {
    chrono::DateTime::<Utc>::from(time).to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn to_error<E: std::fmt::Display>(error: E) -> String {
    error.to_string()
}
