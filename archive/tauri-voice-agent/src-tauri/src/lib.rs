use base64::Engine;
use reqwest::Client;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
struct GroqTranscriptionResponse {
    text: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenRouterChoice {
    message: OpenRouterMessage,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenRouterMessage {
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenRouterResponse {
    choices: Vec<OpenRouterChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbeddingData {
    embedding: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbeddingResponse {
    data: Vec<EmbeddingData>,
}

struct LegalDocEntry {
    _id: i64,
    title: String,
    content: String,
    embedding: Vec<f32>,
}

/// Moteur d'Anonymisation PII (Secret Professionnel et Protection des Données Clients)
pub struct PiiAnonymizer {
    token_map: HashMap<String, String>,
    counter: usize,
}

impl PiiAnonymizer {
    pub fn new() -> Self {
        PiiAnonymizer {
            token_map: HashMap::new(),
            counter: 1,
        }
    }

    /// Masque les PII (Numéros de cartes, Noms de clients, Numéros d'affaires) avant envoi au cloud
    pub fn anonymize(&mut self, text: &str) -> String {
        let mut sanitized = text.to_string();

        // 1. Numéros de dossiers / Affaires : (قضية رقم 1234/26 ou ملف رقم 5678)
        if let Ok(case_regex) = Regex::new(r"(؟:قضية|ملف|عريضة|رقم)\s*(؟:رقم\s*)?(\d{3,8}(?:/\d{2,4})?)") {
            for cap in case_regex.captures_iter(text) {
                if let Some(matched) = cap.get(0) {
                    let token = format!("[CASE_NUMBER_{}]", self.counter);
                    self.counter += 1;
                    self.token_map.insert(token.clone(), matched.as_str().to_string());
                    sanitized = sanitized.replace(matched.as_str(), &token);
                }
            }
        }

        // 2. Numéros d'Identité / NIN / Passeport (numéros de 8 à 18 chiffres)
        if let Ok(nin_regex) = Regex::new(r"\b\d{8,18}\b") {
            let current = sanitized.clone();
            for cap in nin_regex.captures_iter(&current) {
                if let Some(matched) = cap.get(0) {
                    let val = matched.as_str();
                    if !self.token_map.values().any(|v| v == val) {
                        let token = format!("[ID_NUMBER_{}]", self.counter);
                        self.counter += 1;
                        self.token_map.insert(token.clone(), val.to_string());
                        sanitized = sanitized.replace(val, &token);
                    }
                }
            }
        }

        // 3. Noms Propres de Clients et Parties (السيد / السيدة / المسمى / المسماة / ضد)
        if let Ok(name_regex) = Regex::new(r"(السيد|السيدة|المسمى|المسماة|ضد)\s+([\p{Arabic}]{3,25}(?:\s+[\p{Arabic}]{3,25}){1,3})") {
            let current = sanitized.clone();
            for cap in name_regex.captures_iter(&current) {
                if let (Some(matched_full), Some(prefix_match), Some(name_match)) = (cap.get(0), cap.get(1), cap.get(2)) {
                    let prefix = prefix_match.as_str();
                    let person_name = name_match.as_str();

                    let token = format!("[CLIENT_NAME_{}]", self.counter);
                    self.counter += 1;

                    self.token_map.insert(token.clone(), person_name.to_string());
                    let replacement = format!("{} {}", prefix, token);
                    sanitized = sanitized.replace(matched_full.as_str(), &replacement);
                }
            }
        }

        sanitized
    }

    /// Restaure les vraies données client dans la réponse générée par l'IA
    pub fn deanonymize(&self, text: &str) -> String {
        let mut restored = text.to_string();
        for (token, original) in &self.token_map {
            restored = restored.replace(token, original);
        }
        restored
    }
}

fn init_db() -> Result<Connection, String> {
    let conn = Connection::open("al_mouhami.db")
        .map_err(|e| format!("Échec d'ouverture de la base SQLite locale : {}", e))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titre TEXT NOT NULL,
            contenu_arabe TEXT NOT NULL,
            date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .map_err(|e| format!("Échec d'initialisation de la table documents : {}", e))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS knowledge_base (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding TEXT NOT NULL,
            date_added DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .map_err(|e| format!("Échec d'initialisation de la table knowledge_base : {}", e))?;

    Ok(conn)
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.is_empty() || b.is_empty() || a.len() != b.len() {
        return 0.0;
    }
    let mut dot = 0.0f32;
    let mut norm_a = 0.0f32;
    let mut norm_b = 0.0f32;
    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        norm_a += x * x;
        norm_b += y * y;
    }
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a.sqrt() * norm_b.sqrt())
    }
}

async fn fetch_embedding(client: &Client, api_key: &str, text: &str) -> Vec<f32> {
    if api_key.trim().is_empty() || text.trim().is_empty() {
        return vec![];
    }

    let payload = json!({
        "model": "text-embedding-3-small",
        "input": text
    });

    let res = client
        .post("https://openrouter.ai/api/v1/embeddings")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await;

    if let Ok(response) = res {
        if response.status().is_success() {
            if let Ok(parsed) = response.json::<EmbeddingResponse>().await {
                if let Some(first) = parsed.data.first() {
                    return first.embedding.clone();
                }
            }
        }
    }

    vec![]
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_updater::UpdaterExt;

    if let Ok(updater) = app.updater() {
        if let Ok(Some(update)) = updater.check().await {
            return Ok(Some(update.version));
        }
    }

    Ok(None)
}

#[tauri::command]
async fn scan_document() -> Result<String, String> {
    let ps_script = r#"
        $ErrorActionPreference = 'Stop'
        try {
            $deviceManager = New-Object -ComObject WIA.DeviceManager
            if ($deviceManager.DeviceInfos.Count -eq 0) {
                Write-Error "No WIA scanner device detected."
                exit 1
            }
            $device = $deviceManager.DeviceInfos.Item(1).Connect()
            $item = $device.Items.Item(1)
            $image = $item.Transfer()
            $tempPath = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "al_mouhami_scan.jpg")
            if (Test-Path $tempPath) { Remove-Item $tempPath -Force }
            $image.SaveFile($tempPath)
            Write-Output $tempPath
        } catch {
            Write-Error $_.Exception.Message
            exit 1
        }
    "#;

    let output = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script])
        .output()
        .map_err(|e| format!("Échec d'exécution du pilote WIA : {}", e))?;

    let temp_scan_path = if output.status.success() {
        let stdout_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if stdout_str.is_empty() {
            std::env::temp_dir().join("al_mouhami_scan.jpg")
        } else {
            std::path::PathBuf::from(stdout_str)
        }
    } else {
        let fallback_path = std::env::temp_dir().join("al_mouhami_scan.jpg");
        if !fallback_path.exists() {
            return Err("لم يتم العثور على أي جهاز ماسح ضوئي (Scanner WIA/TWAIN) متصل بالحاسوب.".to_string());
        }
        fallback_path
    };

    let image_bytes = std::fs::read(&temp_scan_path)
        .map_err(|e| format!("Échec de lecture de l'image numérisée : {}", e))?;

    let base64_str = base64::engine::general_purpose::STANDARD.encode(&image_bytes);
    Ok(base64_str)
}

#[tauri::command]
async fn extract_attachment_text(file_base64: String, mime_type: String) -> Result<String, String> {
    dotenvy::dotenv().ok();
    let openrouter_api_key = std::env::var("OPENROUTER_API_KEY").map_err(|_| {
        "Clé d'API manquante : OPENROUTER_API_KEY non définie (.env)".to_string()
    })?;

    if file_base64.trim().is_empty() {
        return Err("الملف المرفق فارغ.".to_string());
    }

    let client = Client::new();
    let data_url = format!("data:{};base64,{}", mime_type, file_base64);

    let payload = json!({
        "model": "meta-llama/llama-3.2-11b-vision-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "أنت خبير في الاستخراج الضوئي والقراءة الفنية للوثائق والعقود القانونية الجزائرية. استخرج بدقة كامل الوقائع والأسماء والمبالغ والبنود المذكورة في هذه الوثيقة المرفقة."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": data_url
                        }
                    }
                ]
            }
        ]
    });

    let res = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", openrouter_api_key))
        .header("HTTP-Referer", "https://al-mouhami.pro")
        .header("Content-Type", "application/json; charset=utf-8")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Erreur lors de la lecture vision du document : {}", e))?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        return Err(format!("Échec de l'OCR Vision sur le document : {}", err_text));
    }

    let parsed: OpenRouterResponse = res
        .json()
        .await
        .map_err(|e| format!("Erreur de lecture JSON Vision : {}", e))?;

    let extracted = parsed
        .choices
        .first()
        .map(|c| c.message.content.trim().to_string())
        .ok_or_else(|| "لم يتم استخراج أي نص من الوثيقة المرفقة.".to_string())?;

    Ok(extracted)
}

#[tauri::command]
async fn add_legal_text(title: String, content: String) -> Result<String, String> {
    dotenvy::dotenv().ok();
    let openrouter_api_key = std::env::var("OPENROUTER_API_KEY").unwrap_or_default();

    if title.trim().is_empty() || content.trim().is_empty() {
        return Err("عنوان النص أو المحتوى فارغ.".to_string());
    }

    let client = Client::new();
    let vec_embedding = fetch_embedding(&client, &openrouter_api_key, &content).await;
    let embedding_json = serde_json::to_string(&vec_embedding).unwrap_or_else(|_| "[]".to_string());

    let conn = init_db()?;
    conn.execute(
        "INSERT INTO knowledge_base (title, content, embedding) VALUES (?1, ?2, ?3)",
        params![title.trim(), content.trim(), embedding_json],
    )
    .map_err(|e| format!("Échec d'insertion du texte juridique : {}", e))?;

    let last_id = conn.last_insert_rowid();
    Ok(format!("تمت إضافة النص القانوني بنجاح إلى قاعدة المعارف المحلية (رقم: #{})", last_id))
}

#[tauri::command]
async fn save_document(title: String, content: String) -> Result<String, String> {
    let title_clean = if title.trim().is_empty() {
        format!("عريضة قضائية - {}", chrono_date_fallback())
    } else {
        title.trim().to_string()
    };

    if content.trim().is_empty() {
        return Err("محتوى المستند فارغ. لا يمكن حفظ مستند فارغ.".to_string());
    }

    let conn = init_db()?;

    conn.execute(
        "INSERT INTO documents (titre, contenu_arabe) VALUES (?1, ?2)",
        params![title_clean, content],
    )
    .map_err(|e| format!("Échec d'insertion du document dans SQLite : {}", e))?;

    let last_id = conn.last_insert_rowid();

    Ok(format!("تم حفظ المستند بنجاح في الأرشيف المحلي (رقم الملف: #{})", last_id))
}

fn chrono_date_fallback() -> String {
    let now = std::time::SystemTime::now();
    format!("{:?}", now)
}

#[tauri::command]
async fn process_legal_dictation(
    audio_base64: String,
    attachment_text: Option<String>,
) -> Result<String, String> {
    dotenvy::dotenv().ok();

    let groq_api_key = std::env::var("GROQ_API_KEY").map_err(|_| {
        "Clé d'API manquante : GROQ_API_KEY non définie dans les variables d'environnement (.env)".to_string()
    })?;

    let openrouter_api_key = std::env::var("OPENROUTER_API_KEY").map_err(|_| {
        "Clé d'API manquante : OPENROUTER_API_KEY non définie dans les variables d'environnement (.env)".to_string()
    })?;

    if audio_base64.trim().is_empty() {
        return Err("Le tampon audio Base64 est vide.".to_string());
    }

    let audio_bytes = base64::engine::general_purpose::STANDARD
        .decode(&audio_base64)
        .map_err(|e| format!("Échec du décodage Base64 du flux audio : {}", e))?;

    let client = Client::new();

    // 1. Transcription Audio via Groq (Whisper Large V3 Turbo)
    let file_part = reqwest::multipart::Part::bytes(audio_bytes)
        .file_name("dictation.webm")
        .mime_str("audio/webm")
        .map_err(|e| format!("Erreur de création de la partie multipart : {}", e))?;

    let form = reqwest::multipart::Form::new()
        .text("model", "whisper-large-v3-turbo")
        .text("response_format", "json")
        .part("file", file_part);

    let groq_res = client
        .post("https://api.groq.com/openai/v1/audio/transcriptions")
        .bearer_auth(&groq_api_key)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau lors de l'appel à l'API Groq : {}", e))?;

    if !groq_res.status().is_success() {
        let err_text = groq_res
            .text()
            .await
            .unwrap_or_else(|_| "Erreur inconnue".to_string());
        return Err(format!("Échec de la transcription Groq : {}", err_text));
    }

    let groq_data: GroqTranscriptionResponse = groq_res
        .json()
        .await
        .map_err(|e| format!("Erreur lors de la lecture du JSON de Groq : {}", e))?;

    let transcript = groq_data.text.trim().to_string();

    if transcript.is_empty() {
        return Err("La transcription renvoyée par Groq est vide.".to_string());
    }

    // 2. Recherche Vectorielle RAG Locale
    let query_vector = fetch_embedding(&client, &openrouter_api_key, &transcript).await;
    let mut matched_context = String::new();

    if let Ok(conn) = init_db() {
        let mut stmt = conn
            .prepare("SELECT id, title, content, embedding FROM knowledge_base")
            .ok();

        if let Some(ref mut statement) = stmt {
            let entries_res = statement.query_map([], |row| {
                let id: i64 = row.get(0)?;
                let title: String = row.get(1)?;
                let content: String = row.get(2)?;
                let embedding_str: String = row.get(3)?;
                let embedding: Vec<f32> = serde_json::from_str(&embedding_str).unwrap_or_default();
                Ok(LegalDocEntry {
                    _id: id,
                    title,
                    content,
                    embedding,
                })
            });

            if let Ok(entries) = entries_res {
                let mut scored_entries: Vec<(f32, String, String)> = Vec::new();

                for entry_res in entries {
                    if let Ok(entry) = entry_res {
                        let score = if !query_vector.is_empty() && !entry.embedding.is_empty() {
                            cosine_similarity(&query_vector, &entry.embedding)
                        } else {
                            let matches = transcript
                                .split_whitespace()
                                .filter(|w| entry.content.contains(w) || entry.title.contains(w))
                                .count();
                            matches as f32
                        };

                        if score > 0.0 {
                            scored_entries.push((score, entry.title, entry.content));
                        }
                    }
                }

                scored_entries.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
                let top_3: Vec<_> = scored_entries.into_iter().take(3).collect();

                if !top_3.is_empty() {
                    matched_context.push_str("\n\n[CONTEXTE JURIDIQUE ALGÉRIEN / النصوص القانونية المرجعية المسترجعة من قاعدة المعارف المحلية]:\n");
                    for (idx, (_, title, content)) in top_3.iter().enumerate() {
                        matched_context.push_str(&format!("{}. {}: {}\n", idx + 1, title, content));
                    }
                    matched_context.push_str("\nيجب عليك الاستناد صراحة إلى هذه النصوص القانونية المرجعية واستشهاد بها في صياغة العريضة والطلبات القضائية.");
                }
            }
        }
    }

    // 3. Concaténation de la Dictée Vocale avec la Pièce Jointe Analycée (si présente)
    let full_user_content = match attachment_text {
        Some(ref doc_text) if !doc_text.trim().is_empty() => {
            format!(
                "إليك النص المُملى صوتياً:\n\"{}\"\n\n[المستندات والمؤيدات المرفقة بالقضية / النص المستخرج من الوثيقة المرفقة]:\n\"{}\"",
                transcript, doc_text
            )
        }
        _ => format!("إليك النص المُملى صوتياً لتحليله وصياغته قانونياً:\n\n\"{}\"", transcript),
    };

    // 4. Anonymisation PII Locale Absolue avant envoi au LLM Cloud
    let mut anonymizer = PiiAnonymizer::new();
    let sanitized_user_content = anonymizer.anonymize(&full_user_content);

    let system_prompt_arabic = format!(
        "أنت محامٍ جزائري خبير ومعتمد لدى المحكمة العليا. مهمتك هي تحويل النص المُملى صوتياً والمستندات المرفقة إلى عريضة دعوى رسمية جاهزة للتقديم للمحكمة، واستخراج المواعيد والآجال القانونية والمبالغ المالية المطالب بها.\n\n\
        تنبيه أمني: المحتوى يحتوي على رموز مشفرة لحماية البيانات الشخصية مثل [CLIENT_NAME_1] و [ID_NUMBER_2]. يجب عليك الاحتفاظ بهذه الرموز كما هي بالضبط في النص الصادر دون تغييرها.\n\n\
        يجب عليك الرد حصراً بتنسيق JSON صحيح يطابق الهيكل التالي دون أي نص خارج نطاق JSON:\n\
        {{\n\
          \"titre_dossier\": \"عنوان مختصر وملائم للقضية\",\n\
          \"revendication_arabe\": \"نص العريضة القضائية والطلبات باللغة العربية بتنسيق HTML أنيق (استخدم فقرات p وقوائم ol/ul وعناوين h2/h3)\",\n\
          \"delais_procedure\": [\"قائمة المواعيد والآجال القانونية والتواريخ الهامة\"],\n\
          \"montant_reclame\": \"المبلغ المالي المطالب به أو التعويض بالدينار الجزائري د.ج (أو 'غير محدد')\"\n\
        }}\n\n{}",
        matched_context
    );

    let payload = json!({
        "model": "qwen/qwen-2.5-72b-instruct",
        "response_format": { "type": "json_object" },
        "messages": [
            {
                "role": "system",
                "content": system_prompt_arabic
            },
            {
                "role": "user",
                "content": sanitized_user_content
            }
        ],
        "temperature": 0.2
    });

    let openrouter_res = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", openrouter_api_key))
        .header("HTTP-Referer", "https://al-mouhami.pro")
        .header("X-Title", "Al-Mouhami Pro Legal Assistant")
        .header("Content-Type", "application/json; charset=utf-8")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau lors de l'appel à OpenRouter : {}", e))?;

    if !openrouter_res.status().is_success() {
        let err_text = openrouter_res
            .text()
            .await
            .unwrap_or_else(|_| "Erreur inconnue".to_string());
        return Err(format!("Échec de la rédaction OpenRouter : {}", err_text));
    }

    let openrouter_data: OpenRouterResponse = openrouter_res
        .json()
        .await
        .map_err(|e| format!("Erreur lors du décodage JSON d'OpenRouter : {}", e))?;

    let raw_legal_draft = openrouter_data
        .choices
        .first()
        .map(|c| c.message.content.trim().to_string())
        .ok_or_else(|| "Réponse vide reçue de l'API OpenRouter.".to_string())?;

    // 5. Désanonymisation locale : Restauration des vrais noms/cartes/numéros clients
    let deanonymized_draft = anonymizer.deanonymize(&raw_legal_draft);

    Ok(deanonymized_draft)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = init_db();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            process_legal_dictation,
            save_document,
            add_legal_text,
            extract_attachment_text,
            check_for_updates,
            scan_document
        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors de l'exécution de l'application Tauri");
}
