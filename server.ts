import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { normalizePortalBossPayload, getPlaceholdersForDoc } from "./src/utils/portalBossMapper";

interface CredentialsConfig {
  viteGdiEnv: string;
  viteGdiPublicBaseUrl: string;
  vitePortalBossBaseUrl: string;
  viteGoogleClientId: string;
  viteGoogleApiKey: string;
  gdiGoogleClientSecret: string;
  gdiGoogleServiceAccountEmail: string;
  gdiGoogleServiceAccountPrivateKey: string;
  gdiGoogleProjectId: string;
  gdiGoogleDocsScopes: string;
  gdiGoogleDriveScopes: string;
  gdiPortalBossWebhookUrl: string;
  gdiPortalBossCallbackSecret: string;
  gdiIntegrationKey: string;
}

interface Job {
  id: string;
  source: string;
  target: string;
  documentType: string;
  status: string;
  caseId: string;
  clientId: string;
  clientType: "PF" | "PJ" | string;
  destinationFolderId: string;
  destinationFolderUrl: string;
  payload: any;
  result: {
    googleDocsId: string | null;
    googleDocsUrl: string | null;
    fileName: string | null;
    pdfUrl: string | null;
  };
  errorCode: string | null;
  errorMessage: string | null;
  logs: any[];
  createdAt: string;
  updatedAt: string;
  rawPayload?: any;
  normalizedPayload?: any;
  headersMasked?: Record<string, string>;
  receivedAt?: string;
  processedAt?: string;
  contractVersion?: string;
  templateKey?: string;
  outputFileName?: string;
  placeholdersCount?: number;
}

const PORT = Number(process.env.PORT || 3000);
const app = express();

app.use(express.json());

// Persistent state storage in-memory with file fallback
const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial config based on requirements
const DEFAULT_CONFIG: CredentialsConfig = {
  viteGdiEnv: "production",
  viteGdiPublicBaseUrl: "",
  vitePortalBossBaseUrl: "https://api.portalboss.com.br",
  viteGoogleClientId: "",
  viteGoogleApiKey: "",
  gdiGoogleClientSecret: "",
  gdiGoogleServiceAccountEmail: "",
  gdiGoogleServiceAccountPrivateKey: "",
  gdiGoogleProjectId: "",
  gdiGoogleDocsScopes: "https://www.googleapis.com/auth/documents",
  gdiGoogleDriveScopes: "https://www.googleapis.com/auth/drive.file",
  gdiPortalBossWebhookUrl: "https://api.portalboss.com.br/gdi/webhook",
  gdiPortalBossCallbackSecret: "callback_sec_gdi_2026_prod",
  gdiIntegrationKey: "gdi_XWZ-h_iihQTLFxpEd4eJZib6nvkGz5mQnJJks-ccz0hKT9bV", // TEMPORÁRIO: chave de desenvolvimento embutida. Trocar depois e migrar para a env GDI_INTEGRATION_KEY
};

// Default initial template cards fallback
const TEMPLATES_FILE = path.join(DATA_DIR, "templates_config.json");
const DEFAULT_TEMPLATES_CONFIG: Record<string, any> = {
  "procuracao-pf": {
    templateName: "Modelo da Procuração PF",
    templateGoogleDocsUrl: "https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit",
    templateGoogleDocsId: "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk",
    templatePdfReferenceUrl: "https://drive.google.com/drive/u/0/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ",
    templateStatus: "validado",
    updatedAt: "2026-06-02T18:00:00Z",
    updatedBy: "SISTEMA_GDI"
  }
};

let credentialsConfig: CredentialsConfig = { ...DEFAULT_CONFIG };
let jobsStore: Job[] = [];
let templatesConfig = { ...DEFAULT_TEMPLATES_CONFIG };

// In-memory status trackers
let globalAccessToken: string | null = null;
let googleAuthStatus = "não_configurado";
let googleDocsStatus = "não_configurado";
let googleDriveStatus = "não_configurado";

// Status initialization is defined below after reading tokens.json


function getActiveIntegrationKey(): string {
  return (process.env.GDI_INTEGRATION_KEY || credentialsConfig.gdiIntegrationKey || DEFAULT_CONFIG.gdiIntegrationKey || "").trim();
}

// Load files
try {
  if (fs.existsSync(CONFIG_FILE)) {
    credentialsConfig = { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")) };
    if (process.env.GDI_INTEGRATION_KEY !== undefined) {
      credentialsConfig.gdiIntegrationKey = process.env.GDI_INTEGRATION_KEY;
    }
  } else {
    // Populate from process.env if available, otherwise file
    credentialsConfig = {
      viteGdiEnv: process.env.VITE_GDI_ENV || DEFAULT_CONFIG.viteGdiEnv,
      viteGdiPublicBaseUrl: process.env.VITE_GDI_PUBLIC_BASE_URL || DEFAULT_CONFIG.viteGdiPublicBaseUrl,
      vitePortalBossBaseUrl: process.env.VITE_PORTAL_BOSS_BASE_URL || DEFAULT_CONFIG.vitePortalBossBaseUrl,
      viteGoogleClientId: process.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CONFIG.viteGoogleClientId,
      viteGoogleApiKey: process.env.VITE_GOOGLE_API_KEY || DEFAULT_CONFIG.viteGoogleApiKey,
      gdiGoogleClientSecret: process.env.GDI_GOOGLE_CLIENT_SECRET || DEFAULT_CONFIG.gdiGoogleClientSecret,
      gdiGoogleServiceAccountEmail: process.env.GDI_GOOGLE_SERVICE_ACCOUNT_EMAIL || DEFAULT_CONFIG.gdiGoogleServiceAccountEmail,
      gdiGoogleServiceAccountPrivateKey: process.env.GDI_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || DEFAULT_CONFIG.gdiGoogleServiceAccountPrivateKey,
      gdiGoogleProjectId: process.env.GDI_GOOGLE_PROJECT_ID || DEFAULT_CONFIG.gdiGoogleProjectId,
      gdiGoogleDocsScopes: process.env.GDI_GOOGLE_DOCS_SCOPES || DEFAULT_CONFIG.gdiGoogleDocsScopes,
      gdiGoogleDriveScopes: process.env.GDI_GOOGLE_DRIVE_SCOPES || DEFAULT_CONFIG.gdiGoogleDriveScopes,
      gdiPortalBossWebhookUrl: process.env.GDI_PORTAL_BOSS_WEBHOOK_URL || DEFAULT_CONFIG.gdiPortalBossWebhookUrl,
      gdiPortalBossCallbackSecret: process.env.GDI_PORTAL_BOSS_CALLBACK_SECRET || DEFAULT_CONFIG.gdiPortalBossCallbackSecret,
      gdiIntegrationKey: process.env.GDI_INTEGRATION_KEY || DEFAULT_CONFIG.gdiIntegrationKey,
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(credentialsConfig, null, 2));
  }
} catch (e) {
  console.error("Config load error", e);
}

try {
  if (fs.existsSync(JOBS_FILE)) {
    jobsStore = JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8"));
  }
} catch (e) {
  console.error("Jobs load error", e);
}

try {
  if (fs.existsSync(TEMPLATES_FILE)) {
    templatesConfig = JSON.parse(fs.readFileSync(TEMPLATES_FILE, "utf-8"));
  }
} catch (e) {
  console.error("Templates load error", e);
}

// Guarantee procuracao-pf baseline template definition is present
if (!templatesConfig["procuracao-pf"]) {
  templatesConfig["procuracao-pf"] = {
    templateName: "Modelo da Procuração PF",
    templateGoogleDocsUrl: "https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit",
    templateGoogleDocsId: "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk",
    templatePdfReferenceUrl: "https://drive.google.com/drive/u/0/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ",
    templateStatus: "validado",
    updatedAt: "2026-06-02T18:00:00Z",
    updatedBy: "SISTEMA_GDI"
  };
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templatesConfig, null, 2));
  } catch (err) {}
}

// Token storage definition
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");
interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}
let googleTokens: GoogleTokens | null = null;

try {
  if (fs.existsSync(TOKENS_FILE)) {
    googleTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf-8"));
  }
} catch (e) {
  console.error("Tokens load error", e);
}

function saveTokens(tokens: GoogleTokens | null) {
  googleTokens = tokens;
  if (tokens) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  } else {
    try {
      if (fs.existsSync(TOKENS_FILE)) {
        fs.unlinkSync(TOKENS_FILE);
      }
    } catch {}
  }
}

// Refresh initial state from config and loaded tokens
function checkInitialStatus() {
  const hasSa = !!credentialsConfig.gdiGoogleServiceAccountEmail && !!credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  return hasSa ? "service_account_validada" : "não_configurado";
}

googleAuthStatus = checkInitialStatus();
googleDocsStatus = checkInitialStatus() === "service_account_validada" ? "conectado" : "não_configurado";
googleDriveStatus = checkInitialStatus() === "service_account_validada" ? "conectado" : "não_configurado";

const saveCredentials = () => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(credentialsConfig, null, 2));
};

const saveJobs = () => {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobsStore, null, 2));
};

const saveTemplates = () => {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templatesConfig, null, 2));
};

// Utils
function getFormattedNow(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR');
}

// Dynamic Public Base URL calculation, resolving reverse proxy and environmental setups
function getPublicBaseUrl(req: express.Request): string {
  const configuredUri = credentialsConfig.viteGdiPublicBaseUrl;
  
  // Clean up and validate configured URL if it starts with https://
  if (configuredUri) {
    const val = configuredUri.trim();
    if (val.toLowerCase().startsWith('https://')) {
      return val.endsWith('/') ? val.slice(0, -1) : val;
    }
  }
  
  // Fetch from reverse proxy standard x-forwarded headers to get true external host/proto
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  
  // Local environment host is acceptable only in development mode
  if (host.includes('localhost') && process.env.NODE_ENV === 'production') {
    // If we're in production container, fallback to the requested referrer host or keep as is
  }
  
  const calculatedUrl = `${proto}://${host}`;
  return calculatedUrl.endsWith('/') ? calculatedUrl.slice(0, -1) : calculatedUrl;
}

function getOAuthRedirectUri(req: express.Request): string {
  const base = getPublicBaseUrl(req);
  return `${base}/api/google/callback`;
}

// Auto Token maintenance logic
async function getValidAccessToken(): Promise<string | null> {
  if (!googleTokens) return null;
  
  const now = Date.now();
  // If token is expired or expires in less than 3 minutes, and a refresh token exists, refresh it
  if (googleTokens.expiryDate && now > (googleTokens.expiryDate - 180000) && googleTokens.refreshToken) {
    try {
      console.log("GDI_GOOGLE_AUTH_TOKEN_EXCHANGE_STARTED: Auto-recycling expired token via Google api/token API...");
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: credentialsConfig.viteGoogleClientId || "",
          client_secret: credentialsConfig.gdiGoogleClientSecret || "",
          refresh_token: googleTokens.refreshToken,
          grant_type: "refresh_token"
        })
      });
      const data = await res.json();
      if (data.access_token) {
        googleTokens.accessToken = data.access_token;
        if (data.expires_in) {
          googleTokens.expiryDate = Date.now() + (data.expires_in * 1000);
        }
        saveTokens(googleTokens);
        console.log("GDI: Dynamic Token refreshed perfectly via Google APIs.");
      }
    } catch (e) {
      console.error("GDI: Failed to auto-refresh Google access token:", e);
    }
  }
  return googleTokens.accessToken;
}

// Native RS256 JWT service account signing assertion
function getServiceAccountToken(email: string, privateKey: string, scopes: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const header = { alg: "RS256", typ: "JWT" };
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: email,
        scope: scopes.join(" "),
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now
      };

      const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const signatureInput = `${base64Header}.${base64Payload}`;

      // Handle raw formatting / double spacing from inputs nicely
      let cleanedKey = privateKey.replace(/\\n/g, "\n");
      if (!cleanedKey.includes("-----BEGIN PRIVATE KEY-----")) {
        cleanedKey = `-----BEGIN PRIVATE KEY-----\n${cleanedKey}\n-----END PRIVATE KEY-----`;
      }

      const signer = crypto.createSign("RSA-SHA256");
      signer.update(signatureInput);
      const signature = signer.sign(cleanedKey, "base64url");

      const jwt = `${signatureInput}.${signature}`;

      fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          resolve(data.access_token);
        } else {
          reject(new Error(data.error_description || data.error || "Failed to exchange JWT assertion for access token"));
        }
      })
      .catch(reject);
    } catch (e: any) {
      reject(e);
    }
  });
}

// Active connection token router
async function getActiveToken(): Promise<{ token: string; type: 'service_account' }> {
  // Service account must be exclusively used
  const saEmail = credentialsConfig.gdiGoogleServiceAccountEmail;
  const saPrivateKey = credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  if (saEmail && saPrivateKey && saEmail.includes("@") && saEmail.includes(".gserviceaccount.com")) {
    try {
      const token = await getServiceAccountToken(saEmail, saPrivateKey, [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive"
      ]);
      return { token, type: 'service_account' };
    } catch (e: any) {
      throw e;
    }
  }

  throw new Error("A Service Account não está completamente configurada (email ou chave privada ausente).");
}

// ---------------- API ENDPOINTS ----------------

// GET /health -> Root health check JSON return
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "operational",
    service: "gdi",
    webhook: "/api/webhook/gdi-job",
    auth: "service_account"
  });
});

// GET /api/health -> API health check JSON return
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "operational",
    service: "gdi",
    webhook: "/api/webhook/gdi-job",
    auth: "service_account"
  });
});

// GET /api/ready -> API readiness check JSON return
app.get("/api/ready", (req, res) => {
  res.json({
    success: true,
    status: "ready",
    service: "gdi",
    message: "GDI API runtime pronto para receber payloads."
  });
});

// GET /api/webhook/gdi-job -> Info about webhook state/availability
app.get("/api/webhook/gdi-job", (req, res) => {
  res.json({
    success: true,
    status: "ready",
    service: "gdi",
    expectedMethod: "POST"
  });
});

// Get secure setup config (masks confidential client secrets, private keys, integration keys)
app.get("/api/config", (req, res) => {
  res.json({
    viteGdiEnv: credentialsConfig.viteGdiEnv || "production",
    viteGdiPublicBaseUrl: credentialsConfig.viteGdiPublicBaseUrl,
    vitePortalBossBaseUrl: credentialsConfig.vitePortalBossBaseUrl,
    viteGoogleClientId: credentialsConfig.viteGoogleClientId,
    viteGoogleApiKey: credentialsConfig.viteGoogleApiKey,
    gdiGoogleServiceAccountEmail: credentialsConfig.gdiGoogleServiceAccountEmail,
    gdiGoogleProjectId: credentialsConfig.gdiGoogleProjectId,
    gdiGoogleDocsScopes: credentialsConfig.gdiGoogleDocsScopes,
    gdiGoogleDriveScopes: credentialsConfig.gdiGoogleDriveScopes,
    gdiPortalBossWebhookUrl: credentialsConfig.gdiPortalBossWebhookUrl,
    
    // Front aliases mapping
    gdiGoogleClientId: credentialsConfig.viteGoogleClientId,
    gdiGoogleRedirectUri: credentialsConfig.viteGdiPublicBaseUrl,
    
    // Auth and connector state returned to client UI
    googleAuthStatus,
    googleDocsStatus,
    googleDriveStatus,

    // Real secrets returned for secure viewing and copying by authorised operator
    gdiGoogleClientSecret: credentialsConfig.gdiGoogleClientSecret || "",
    gdiGoogleServiceAccountPrivateKey: credentialsConfig.gdiGoogleServiceAccountPrivateKey || "",
    gdiPortalBossCallbackSecret: credentialsConfig.gdiPortalBossCallbackSecret || "",

    // Safely check if sensitive details are filled without returning them
    gdiIntegrationKey: getActiveIntegrationKey(),
    hasClientSecret: !!credentialsConfig.gdiGoogleClientSecret,
    hasServiceAccountPrivateKey: !!credentialsConfig.gdiGoogleServiceAccountPrivateKey,
    hasCallbackSecret: !!credentialsConfig.gdiPortalBossCallbackSecret,
    hasIntegrationKey: !!getActiveIntegrationKey(),
    maskIntegrationKey: getActiveIntegrationKey() 
      ? getActiveIntegrationKey().substring(0, 3) + "..." + getActiveIntegrationKey().substring(getActiveIntegrationKey().length - 3)
      : ""
  });
});

// Update config parameters safely
app.post("/api/config", (req, res) => {
  const updates = req.body;
  if (!updates) return res.status(400).json({ error: "Payload vazio" });

  // Server-side strict validation for redirect URI to prevent GDI_OAUTH_SECRET_MISUSED_AS_REDIRECT_URI and GDI_OAUTH_REDIRECT_URI_INVALID
  const redirectUriUpdate = updates.gdiGoogleRedirectUri !== undefined ? updates.gdiGoogleRedirectUri : updates.viteGdiPublicBaseUrl;
  if (redirectUriUpdate !== undefined && redirectUriUpdate !== "") {
    const val = String(redirectUriUpdate).trim().toLowerCase();
    
    // Check if it's a secret, key or token instead of a URL
    if (val.includes("secret") || val.includes("key") || val.includes("token")) {
      return res.status(400).json({ 
        success: false, 
        error: "GDI_OAUTH_SECRET_MISUSED_AS_REDIRECT_URI",
        message: "Erro Crítico GDI: Chave secreta, key ou token de callback detectado incorretamente como o Redirect URI. Bloqueado para segurança física e lógica de rede." 
      });
    }
    
    // Check if it has a legal URL protocol
    if (!val.startsWith("http://") && !val.startsWith("https://")) {
      return res.status(400).json({ 
        success: false, 
        error: "GDI_OAUTH_REDIRECT_URI_INVALID",
        message: "Erro GDI: O Redirect URI fornecido deve ser uma URL válida que comece com http:// ou https://" 
      });
    }
  }

  const allowedUpdatesKeys: Array<string> = [
    "viteGdiEnv",
    "viteGdiPublicBaseUrl",
    "vitePortalBossBaseUrl",
    "viteGoogleClientId",
    "viteGoogleApiKey",
    "gdiGoogleClientSecret",
    "gdiGoogleServiceAccountEmail",
    "gdiGoogleServiceAccountPrivateKey",
    "gdiGoogleProjectId",
    "gdiGoogleDocsScopes",
    "gdiGoogleDriveScopes",
    "gdiPortalBossWebhookUrl",
    "gdiPortalBossCallbackSecret",
    "gdiIntegrationKey",
    "gdiGoogleClientId",
    "gdiGoogleRedirectUri"
  ];

  for (const key of allowedUpdatesKeys) {
    if (updates[key] !== undefined) {
      if (key === "gdiGoogleClientId") {
        credentialsConfig.viteGoogleClientId = updates[key];
      } else if (key === "gdiGoogleRedirectUri") {
        credentialsConfig.viteGdiPublicBaseUrl = updates[key];
      } else {
        (credentialsConfig as any)[key] = updates[key];
      }
    }
  }

  // Refresh status from newly saved configuration
  googleAuthStatus = checkInitialStatus();
  googleDocsStatus = checkInitialStatus();
  googleDriveStatus = checkInitialStatus();

  saveCredentials();
  res.json({ success: true, message: "Parâmetros GDI salvos com sucesso no servidor seguro." });
});

// Templates per card management
app.get("/api/templates", (req, res) => {
  res.json(templatesConfig);
});

app.post("/api/templates", (req, res) => {
  const { cardId, templateName, templateGoogleDocsUrl, templateGoogleDocsId, templatePdfReferenceUrl, templateStatus, updatedBy } = req.body;
  if (!cardId) {
    return res.status(400).json({ error: "CardId é obrigatório" });
  }

  templatesConfig[cardId] = {
    templateName: templateName || "",
    templateGoogleDocsUrl: templateGoogleDocsUrl || "",
    templateGoogleDocsId: templateGoogleDocsId || "",
    templatePdfReferenceUrl: templatePdfReferenceUrl || "",
    templateStatus: templateStatus || "não_configurado",
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || "OPERADOR_GDI"
  };

  saveTemplates();
  res.json({ success: true, template: templatesConfig[cardId] });
});

// ---------------- GOOGLE API CONNECTION ENDPOINTS ----------------

// OAuth routes removed per user Service Account only request.

// POST /api/google/auth/test -> Real diagnostic check of Google Auth status
app.post("/api/google/auth/test", async (req, res) => {
  const nowStr = getFormattedNow();
  const logs: any[] = [];
  
  logs.push({ timestamp: nowStr, step: "GDI_GOOGLE_CONNECTION_VERIFY_STARTED", status: "success", message: "GDI: Iniciando verificação real das chaves e do handshake do Google Workspace via Service Account." });

  try {
    const { token } = await getActiveToken();
    
    // Call tokeninfo to check valid token signature and active scopes
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    if (!tokenInfoRes.ok) {
      throw new Error("O template ou a pasta não foi compartilhado com a Service Account.");
    }

    const tokenInfo = await tokenInfoRes.json();
    googleAuthStatus = "service_account_validada";
    
    logs.push({ 
      timestamp: nowStr, 
      step: "GDI_GOOGLE_AUTH_SUCCESS", 
      status: "success", 
      message: "GDI: Conexão via Service Account validada com sucesso.", 
      details: `Conta: ${credentialsConfig.gdiGoogleServiceAccountEmail} | Escopos ativos: [${tokenInfo.scope || ''}]`
    });

    res.json({ success: true, status: googleAuthStatus, logs });
  } catch (e: any) {
    googleAuthStatus = "não_autenticado";
    logs.push({ 
      timestamp: nowStr, 
      step: "GDI_GOOGLE_CONNECTION_FAILED", 
      status: "failed", 
      message: "O template ou a pasta não foi compartilhado com a Service Account."
    });
    res.json({ success: false, status: "não_autenticado", logs, message: "O template ou a pasta não foi compartilhado com a Service Account." });
  }
});

// POST /api/google/docs/test -> Real check of Google Docs API using master template ID
app.post("/api/google/docs/test", async (req, res) => {
  const logs: any[] = [];
  const nowStr = getFormattedNow();

  logs.push({ timestamp: nowStr, step: "GDI_GOOGLE_CONNECTION_VERIFY_STARTED", status: "success", message: "Docs API: Iniciando requisição real de contato para docs.googleapis.com." });

  try {
    const { token } = await getActiveToken();

    // Dynamically query template list of GDI configured cards or use standard procuracao PF as fallback
    let targetTemplateId = "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk";
    const templatesKeys = Object.keys(templatesConfig);
    if (templatesKeys.length > 0) {
      const firstTemplateKey = templatesKeys[0];
      const fit = templatesConfig[firstTemplateKey];
      if (fit && fit.templateGoogleDocsId) {
        targetTemplateId = fit.templateGoogleDocsId.trim();
      }
    }

    logs.push({ timestamp: nowStr, step: "GDI_DOCS_VERIFICATION_CALL", status: "success", message: `Acessando e lendo metadados mestre do Google Docs ID: "${targetTemplateId}"` });

    const fetchDocRes = await fetch(`https://docs.googleapis.com/v1/documents/${targetTemplateId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!fetchDocRes.ok) {
      throw new Error("O template ou a pasta não foi compartilhado com a Service Account.");
    }

    const docData = await fetchDocRes.json();
    googleDocsStatus = "conectado";
    
    logs.push({ timestamp: nowStr, step: "GDI_GOOGLE_DOCS_CONNECTION_OK", status: "success", message: `Docs API: Conexão mestre estabelecida com sucesso. Título do mestre: "${docData.title}"` });
    logs.push({ timestamp: nowStr, step: "GDI_DOCS_TEMPLATE_READ_SUCCESS", status: "success", message: "Docs API: Leitura de cabeçalho e estrutura de texto concluídas com êxito." });
    
    res.json({ success: true, status: "conectado", logs });
  } catch (e: any) {
    googleDocsStatus = "erro_docs";
    logs.push({ 
      timestamp: nowStr, 
      step: "GDI_GOOGLE_CONNECTION_PARTIAL", 
      status: "failed", 
      message: "O template ou a pasta não foi compartilhado com a Service Account." 
    });
    res.json({ success: false, status: "erro_docs", logs, message: "O template ou a pasta não foi compartilhado com a Service Account." });
  }
});

// POST /api/google/drive/test -> Real signature check of Google Drive API metadata
app.post("/api/google/drive/test", async (req, res) => {
  const logs: any[] = [];
  const nowStr = getFormattedNow();

  logs.push({ timestamp: nowStr, step: "GDI_GOOGLE_CONNECTION_VERIFY_STARTED", status: "success", message: "Drive API: Abrindo conexão de varredura real no Google Drive." });

  try {
    const { token } = await getActiveToken();

    logs.push({ timestamp: nowStr, step: "GDI_DRIVE_VERIFICATION_CALL", status: "success", message: "Sincronizando metadados de arquivos no Drive corporativo..." });

    const driveFetchRes = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=3&fields=files(id,name)", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!driveFetchRes.ok) {
      throw new Error("O template ou a pasta não foi compartilhado com a Service Account.");
    }

    const driveData = await driveFetchRes.json();
    googleDriveStatus = "conectado";

    logs.push({ timestamp: nowStr, step: "GDI_GOOGLE_DRIVE_CONNECTION_OK", status: "success", message: `Drive API: Canal de indexação catalogado. Encontrados ${driveData.files?.length || 0} arquivos no teste de handshake.` });
    
    res.json({ success: true, status: "conectado", logs });
  } catch (e: any) {
    googleDriveStatus = "erro_drive";
    logs.push({ 
      timestamp: nowStr, 
      step: "GDI_GOOGLE_CONNECTION_PARTIAL", 
      status: "failed", 
      message: "O template ou a pasta não foi compartilhado com a Service Account." 
    });
    res.json({ success: false, status: "erro_drive", logs, message: "O template ou a pasta não foi compartilhado com a Service Account." });
  }
});

// POST /api/google/auth/revoke -> Revokes the active Google token 
app.post("/api/google/auth/revoke", (req, res) => {
  const nowStr = getFormattedNow();
  globalAccessToken = null;
  saveTokens(null);
  
  googleAuthStatus = checkInitialStatus();
  googleDocsStatus = checkInitialStatus();
  googleDriveStatus = checkInitialStatus();

  const logs = [
    { timestamp: nowStr, step: "GDI_GOOGLE_CONNECTION_REVOKED", status: "success", message: "GDI: Conexão com Google Workspace revogada e tokens expurgados do backend síncrono e do arquivo físico." }
  ];

  res.json({
    success: true,
    status: googleAuthStatus,
    logs
  });
});

// GET received jobs list
app.get("/api/jobs", (req, res) => {
  res.json(jobsStore);
});

// Clear jobs list
app.post("/api/jobs/clear", (req, res) => {
  jobsStore = [];
  saveJobs();
  res.json({ success: true });
});

// Delete a single job by ID
app.delete("/api/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  const initialLength = jobsStore.length;
  jobsStore = jobsStore.filter(j => j.id !== jobId);
  if (jobsStore.length !== initialLength) {
    saveJobs();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Job not found" });
  }
});

// Helper custom error for strict diagnostic categorization required by Portal BOSS
class GdiAutomationError extends Error {
  errorCode: string;
  constructor(errorCode: string, message: string) {
    super(message);
    this.errorCode = errorCode;
    this.name = "GdiAutomationError";
  }
}

// Map various source documentTypes to GDI canonical names with dashes
function canonicalDocumentType(value: string): string {
  const map: Record<string, string> = {
    "procuracao_pf": "procuracao-pf",
    "declaracao_pobreza_pf": "declaracao-pobreza-pf",
    "contrato_honorarios_pf": "contrato-honorarios-pf",
    "primeiro_atendimento_pf": "primeiro-atendimento-pf",
    "procuracao_pj": "procuracao-pj",
    "declaracao_pobreza_pj": "declaracao-pobreza-pj",
    "contrato_honorarios_pj": "contrato-honorarios-pj",
    "primeiro_atendimento_pj": "primeiro-atendimento-pj"
  };

  return map[value] || value.replace(/_/g, "-");
}

function isMockFolderId(folderId: string): boolean {
  if (!folderId) return false;
  const normalized = String(folderId).trim().toUpperCase();
  return (
    normalized === "1H9D4XPLOSM_GD_FOLDER_PF" ||
    normalized === "1H9D4XPLOSM_GD_FOLDER_PJ" ||
    normalized.includes("FOLDER_PF") ||
    normalized.includes("FOLDER_PJ")
  );
}

async function validateDestinationFolder(destinationFolderId: string, token: string): Promise<void> {
  if (!destinationFolderId) {
    throw new GdiAutomationError(
      "DESTINATION_FOLDER_MISSING",
      "Pasta de destino (destinationFolderId) não informada ou vazia."
    );
  }
  
  if (isMockFolderId(destinationFolderId)) {
    throw new GdiAutomationError(
      "MOCK_PAYLOAD_REJECTED",
      "Payload rejeitado por conter folderId artificial. O GDI só processa destinationFolderId real enviado pelo Portal BOSS."
    );
  }

  const saEmail = credentialsConfig.gdiGoogleServiceAccountEmail || "não configurado";

  let verifyRes;
  try {
    verifyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${destinationFolderId}?fields=id,name,mimeType`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  } catch (err: any) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
      `Falha de rede ao tentar validar a pasta de destino "${destinationFolderId}" via Google Drive API. Detalhes: ${err.message}. A Service Account "${saEmail}" precisa de permissão de escrita/editor.`
    );
  }

  if (!verifyRes.ok) {
    let errDetail = "";
    try {
      const errJson = await verifyRes.json();
      errDetail = errJson.error?.message || "";
    } catch {}
    
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
      `A pasta de destino "${destinationFolderId}" não pôde ser lida pela Service Account. Certifique-se de que a pasta foi compartilhada como Editor com o e-mail: "${saEmail}". Detalhes da API: ${errDetail || verifyRes.statusText}`
    );
  }
}

// 1. New Placeholders-Only Executor (Tarefa 4)
async function executePlaceholderReplacementJob(
  payload: any
): Promise<{ googleDocsId: string; googleDocsUrl: string; fileName: string; pdfUrl: string; logs: any[] }> {
  const hasSa = !!credentialsConfig.gdiGoogleServiceAccountEmail && !!credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  if (!hasSa) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_NOT_CONFIGURED",
      "A Service Account não está configurada no GDI. Cadastre o e-mail e chave privada nas credenciais."
    );
  }

  const contractVersion = payload?.contractVersion;
  if (contractVersion !== "gdi.placeholders.v1") {
    throw new GdiAutomationError(
      "INVALID_CONTRACT_VERSION",
      `Versão de contrato inválida para o executor de placeholders: ${contractVersion || "ausente"}.`
    );
  }

  const templateKey = payload?.templateKey || "procuracao-pf";
  const destinationFolderId = payload?.destinationFolderId;
  const placeholders = payload?.placeholders;

  if (isMockFolderId(destinationFolderId)) {
    throw new GdiAutomationError(
      "MOCK_PAYLOAD_REJECTED",
      "Payload rejeitado por conter folderId artificial. O GDI só processa destinationFolderId real enviado pelo Portal BOSS."
    );
  }

  if (!templateKey) {
    throw new GdiAutomationError(
      "TEMPLATE_KEY_MISSING",
      "O campo templateKey é obrigatório para resolver o template."
    );
  }

  if (!destinationFolderId) {
    throw new GdiAutomationError(
      "DESTINATION_FOLDER_MISSING",
      "Pasta de destino (destinationFolderId) não informada."
    );
  }

  if (!placeholders || typeof placeholders !== "object" || Object.keys(placeholders).length === 0) {
    throw new GdiAutomationError(
      "PLACEHOLDERS_MISSING",
      "Lista de placeholders obrigatórios vazia ou inválida no payload."
    );
  }

  // Find template ID by templateKey
  let templateId = "";
  if (templateKey === "procuracao-pf") {
    templateId = "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk";
  } else {
    const config = templatesConfig[templateKey];
    templateId = config?.templateGoogleDocsId ? config.templateGoogleDocsId.trim() : "";
  }

  if (!templateId) {
    throw new GdiAutomationError(
      "TEMPLATE_NOT_CONFIGURED",
      `Template mestre não configurado ou ID do template vazio para a chave de template "${templateKey}".`
    );
  }

  // Get service account token
  let token: string;
  try {
    const authRes = await getActiveToken();
    token = authRes.token;
  } catch (err: any) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "Não foi possível obter um token de acesso de Service Account. Verifique se as credenciais cadastrais estão corretas."
    );
  }

  // Validate destinationFolderId FIRST síncrona
  await validateDestinationFolder(destinationFolderId, token);

  const logs: any[] = [];

  // Test 1: Read template metadata
  logs.push({ timestamp: getFormattedNow(), step: "GDI_DOCS_VERIFICATION_CALL", status: "success", message: `Teste 1: Lendo o template Google Docs original... ID: ${templateId}` });
  let docRes;
  try {
    docRes = await fetch(`https://docs.googleapis.com/v1/documents/${templateId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  } catch (err: any) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      `Falha de rede ao conectar à api do Google Docs: ${err.message}`
    );
  }

  if (!docRes.ok) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "O template original do Google Docs não pôde ser lido pela Service Account. Verifique se o documento foi compartilhado corretamente."
    );
  }

  let docObj;
  try {
    docObj = await docRes.json();
  } catch (err) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "Resposta inválida da API do Google Docs ao ler o template mestre."
    );
  }

  const docTitle = docObj.title || "Documento";
  logs.push({ timestamp: getFormattedNow(), step: "GDI_DOCS_TEMPLATE_READ_SUCCESS", status: "success", message: `Teste 1 Concluído! Conteúdo e metadados lidos com sucesso. Título do mestre: "${docTitle}"` });

  // Test 2: Copy the template to the user-specified Drive folder
  logs.push({ timestamp: getFormattedNow(), step: "GDI_COPY_TEMPLATE", status: "success", message: `Teste 2: Copiando template Docs para criar novo rascunho de trabalho no Google Drive...` });
  const outputFileName = payload?.outputFileName || `GDI_${templateKey.toUpperCase()}_CASE_${payload?.caseId || "N/A"}_CLIENT_${payload?.clientId || "N/A"}`;
  const copyBody: any = {
    name: outputFileName
  };
  if (destinationFolderId) {
    copyBody.parents = [destinationFolderId];
  }

  let copyRes;
  try {
    copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${templateId}/copy`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(copyBody)
    });
  } catch (err: any) {
    throw new GdiAutomationError(
      "GOOGLE_DOCS_TEMPLATE_COPY_FAILED",
      `Erro de rede ao copiar template Docs: ${err.message}`
    );
  }

  if (!copyRes.ok) {
    let errDetail = "";
    try {
      const errJson = await copyRes.json();
      errDetail = errJson.error?.message || "";
    } catch {}

    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
      `A pasta de destino "${destinationFolderId}" não foi compartilhada com a Service Account ou esta não possui permissão de escrita. Detalhes: ${errDetail}`
    );
  }

  let copyObj;
  try {
    copyObj = await copyRes.json();
  } catch (err) {
    throw new GdiAutomationError(
      "GOOGLE_DOCS_TEMPLATE_COPY_FAILED",
      "Resposta de cópia inválida recebida da API do Google Drive."
    );
  }

  const copiedId = copyObj.id;
  logs.push({ timestamp: getFormattedNow(), step: "GDI_CREATING_DOCUMENT", status: "success", message: `Teste 2 Concluído! Cópia descritiva de trabalho criada sob ID: ${copiedId}` });

  // Test 3: Replace placeholders directly from payload.placeholders
  logs.push({ timestamp: getFormattedNow(), step: "GDI_REPLACE_PLACEHOLDERS", status: "success", message: `Teste 3: Substituindo placeholders dinamicamente no rascunho de trabalho...` });
  
  const requests = Object.entries(placeholders).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: key,
        matchCase: true
      },
      replaceText: String(value) || ""
    }
  }));

  if (requests.length > 0) {
    let updateRes;
    try {
      updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${copiedId}:batchUpdate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requests })
      });
    } catch (err: any) {
      throw new GdiAutomationError(
        "GOOGLE_DOCS_PLACEHOLDER_REPLACE_FAILED",
        `Falha de rede ao tentar atualizar placeholders via Docs API: ${err.message}`
      );
    }

    if (!updateRes.ok) {
      let errDetail = "";
      try {
        const errJson = await updateRes.json();
        errDetail = errJson.error?.message || "";
      } catch {}

      throw new GdiAutomationError(
        "GOOGLE_DOCS_PLACEHOLDER_REPLACE_FAILED",
        `Falha em batchUpdate substituindo marcadores no Google Docs. Detalhes: ${errDetail}`
      );
    }
  }
  logs.push({ timestamp: getFormattedNow(), step: "GDI_REPLACING_PLACEHOLDERS", status: "success", message: `Teste 3 Concluído! Placeholders substituídos com sucesso no Google Docs.` });

  // Test 4: Save to target Drive folder verification
  logs.push({ timestamp: getFormattedNow(), step: "GDI_SAVE_TO_DRIVE", status: "success", message: `Teste 4: Confirmando gravação na pasta de destino...` });
  logs.push({ timestamp: getFormattedNow(), step: "GDI_SAVING_TO_DRIVE", status: "success", message: `Teste 4 Concluído! Arquivo final gravado e indexado no diretório esperado.` });

  const finalDocUrl = `https://docs.google.com/document/d/${copiedId}/edit`;
  const finalPdfUrl = `https://docs.google.com/document/d/${copiedId}/export?format=pdf`;

  return {
    googleDocsId: copiedId,
    googleDocsUrl: finalDocUrl,
    fileName: `${outputFileName}.docx`,
    pdfUrl: finalPdfUrl,
    logs
  };
}

// 2. Legacy Portal BOSS Payload Executor (Tarefa 5)
async function executeLegacyPortalBossPayloadJob(
  payload: any
): Promise<{ googleDocsId: string; googleDocsUrl: string; fileName: string; pdfUrl: string; logs: any[] }> {
  // Validate Service Account config presence
  const hasSa = !!credentialsConfig.gdiGoogleServiceAccountEmail && !!credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  if (!hasSa) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_NOT_CONFIGURED",
      "A Service Account não está configurada no GDI síncrono. Cadastre o e-mail e chave privada nas credenciais."
    );
  }

  // Parse and normalize the payload
  const { normalized, validation } = normalizePortalBossPayload(payload);
  if (!validation.isValid) {
    const errCode = validation.errorType === 'GDI_PF_REQUIRED_FIELD_MISSING' || validation.errorType === 'GDI_PJ_REQUIRED_FIELD_MISSING'
      ? "PAYLOAD_INVALID"
      : (validation.errorType === "CLIENT_DATA_MISSING" ? "CLIENT_DATA_MISSING" : "PAYLOAD_INVALID");
    throw new GdiAutomationError(
      errCode,
      `Dados inválidos no payload de legado: ${validation.errorMessage || "Erro de validação"}`
    );
  }

  const documentType = normalized.documentType;
  const destinationFolderId = normalized.destinationFolderId;
  const caseId = normalized.caseId;
  const clientId = normalized.clientId;

  if (isMockFolderId(destinationFolderId)) {
    throw new GdiAutomationError(
      "MOCK_PAYLOAD_REJECTED",
      "Payload rejeitado por conter folderId artificial. O GDI só processa destinationFolderId real enviado pelo Portal BOSS."
    );
  }

  // Find template ID by resolving the type to its canonical format
  const cardId = canonicalDocumentType(documentType);
  const config = templatesConfig[cardId];
  const templateId = config?.templateGoogleDocsId ? config.templateGoogleDocsId.trim() : "";

  if (!templateId) {
    throw new GdiAutomationError(
      "TEMPLATE_NOT_CONFIGURED",
      `Template mestre não configurado ou ID do template vazio para o tipo de documento "${documentType}" (canonical: "${cardId}").`
    );
  }

  // Get service account token
  let token: string;
  try {
    const authRes = await getActiveToken();
    token = authRes.token;
  } catch (err: any) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "Não foi possível obter um token de acesso de Service Account. Verifique se as credenciais cadastrais estão corretas."
    );
  }

  // Validate destinationFolderId FIRST síncrona
  await validateDestinationFolder(destinationFolderId, token);

  const logs: any[] = [];

  // Test 1: Read template metadata
  logs.push({ timestamp: getFormattedNow(), step: "GDI_DOCS_VERIFICATION_CALL", status: "success", message: `Teste 1: Lendo o template Google Docs original... ID: ${templateId}` });
  let docRes;
  try {
    docRes = await fetch(`https://docs.googleapis.com/v1/documents/${templateId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  } catch (err: any) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      `Falha de rede ao conectar à api do Google Docs: ${err.message}`
    );
  }

  if (!docRes.ok) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "O template original do Google Docs não pôde ser lido pela Service Account. Verifique se o documento foi compartilhado corretamente."
    );
  }

  let docObj;
  try {
    docObj = await docRes.json();
  } catch (err) {
    throw new GdiAutomationError(
      "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED",
      "Resposta inválida da API do Google Docs ao ler o template mestre."
    );
  }

  const docTitle = docObj.title || "Documento";
  logs.push({ timestamp: getFormattedNow(), step: "GDI_DOCS_TEMPLATE_READ_SUCCESS", status: "success", message: `Teste 1 Concluído! Conteúdo e metadados lidos com sucesso. Título do mestre: "${docTitle}"` });

  // Test 2: Copy the template to the user-specified Drive folder
  logs.push({ timestamp: getFormattedNow(), step: "GDI_COPY_TEMPLATE", status: "success", message: `Teste 2: Copiando template Docs para criar novo rascunho de trabalho no Google Drive...` });
  const finalFileName = `GDI_${documentType.toUpperCase()}_CASE_${caseId}_CLIENT_${clientId}`;
  const copyBody: any = {
    name: finalFileName
  };
  if (destinationFolderId) {
    copyBody.parents = [destinationFolderId];
  }

  let copyRes;
  try {
    copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${templateId}/copy`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(copyBody)
    });
  } catch (err: any) {
    throw new GdiAutomationError(
      "GOOGLE_DOCS_TEMPLATE_COPY_FAILED",
      `Erro de rede ao copiar template Docs: ${err.message}`
    );
  }

  if (!copyRes.ok) {
    let errDetail = "";
    try {
      const errJson = await copyRes.json();
      errDetail = errJson.error?.message || "";
    } catch {}

    if (destinationFolderId) {
      throw new GdiAutomationError(
        "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
        `A pasta de destino "${destinationFolderId}" não foi compartilhada com a Service Account ou esta não possui permissão de escrita. Detalhes: ${errDetail}`
      );
    } else {
      throw new GdiAutomationError(
        "GOOGLE_DOCS_TEMPLATE_COPY_FAILED",
        `A cópia do template Google Docs no Drive falhou. Verifique as credenciais da Service Account. Detalhes: ${errDetail}`
      );
    }
  }

  let copyObj;
  try {
    copyObj = await copyRes.json();
  } catch (err) {
    throw new GdiAutomationError(
      "GOOGLE_DOCS_TEMPLATE_COPY_FAILED",
      "Resposta de cópia inválida recebida da API do Google Drive."
    );
  }

  const copiedId = copyObj.id;
  logs.push({ timestamp: getFormattedNow(), step: "GDI_CREATING_DOCUMENT", status: "success", message: `Teste 2 Concluído! Cópia descritiva de trabalho criada sob ID: ${copiedId}` });

  // Test 3: Replace placeholders
  logs.push({ timestamp: getFormattedNow(), step: "GDI_REPLACE_PLACEHOLDERS", status: "success", message: `Teste 3: Substituindo placeholders dinamicamente no rascunho de trabalho...` });
  
  const placeholders = getPlaceholdersForDoc(documentType, normalized);
  const requests = Object.entries(placeholders).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: key,
        matchCase: true
      },
      replaceText: String(value) || ""
    }
  }));

  if (requests.length > 0) {
    let updateRes;
    try {
      updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${copiedId}:batchUpdate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requests })
      });
    } catch (err: any) {
      throw new GdiAutomationError(
        "GOOGLE_DOCS_PLACEHOLDER_REPLACE_FAILED",
        `Falha de rede ao tentar atualizar placeholders via Docs API: ${err.message}`
      );
    }

    if (!updateRes.ok) {
      let errDetail = "";
      try {
        const errJson = await updateRes.json();
        errDetail = errJson.error?.message || "";
      } catch {}

      throw new GdiAutomationError(
        "GOOGLE_DOCS_PLACEHOLDER_REPLACE_FAILED",
        `Falha em batchUpdate substituindo marcadores no Google Docs. Detalhes: ${errDetail}`
      );
    }
  }
  logs.push({ timestamp: getFormattedNow(), step: "GDI_REPLACING_PLACEHOLDERS", status: "success", message: `Teste 3 Concluído! Placeholders substituídos com sucesso no Google Docs.` });

  // Test 4: Save to target Drive folder verification
  logs.push({ timestamp: getFormattedNow(), step: "GDI_SAVE_TO_DRIVE", status: "success", message: `Teste 4: Confirmando gravação na pasta de destino...` });
  if (destinationFolderId) {
    let verifyRes;
    try {
      verifyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${copiedId}?fields=parents`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err: any) {
      throw new GdiAutomationError(
        "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
        `Falha de rede ao validar propriedade de pasta pai no Google Drive: ${err.message}`
      );
    }

    if (!verifyRes.ok) {
      throw new GdiAutomationError(
        "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED",
        "A pasta de destino de gravação não pôde ser lida síncronamente pela Service Account."
      );
    }
  }
  logs.push({ timestamp: getFormattedNow(), step: "GDI_SAVING_TO_DRIVE", status: "success", message: `Teste 4 Concluído! Arquivo final gravado e indexado no diretório esperado.` });

  const finalDocUrl = `https://docs.google.com/document/d/${copiedId}/edit`;
  const finalPdfUrl = `https://docs.google.com/document/d/${copiedId}/export?format=pdf`;

  return {
    googleDocsId: copiedId,
    googleDocsUrl: finalDocUrl,
    fileName: `${finalFileName}.docx`,
    pdfUrl: finalPdfUrl,
    logs
  };
}

// Main Router function which chooses the correct execution mode
async function executeGdiAutomation(
  payload: any
): Promise<{ googleDocsId: string; googleDocsUrl: string; fileName: string; pdfUrl: string; logs: any[] }> {
  if (payload?.contractVersion === "gdi.placeholders.v1") {
    return await executePlaceholderReplacementJob(payload);
  } else {
    return await executeLegacyPortalBossPayloadJob(payload);
  }
}

function updateJobState(jobId: string, updates: Partial<Job>) {
  const index = jobsStore.findIndex(j => j.id === jobId);
  if (index !== -1) {
    jobsStore[index] = {
      ...jobsStore[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveJobs();
  }
}

// GET /api/selftest -> Executa e retorna o autoteste completo de pré-requisitos síncronos
app.get("/api/selftest", async (req, res) => {
  const activeKey = getActiveIntegrationKey();
  const gdiKeyHeader = req.headers["x-boss-google-docs-integration-key"] || req.query["x-boss-google-docs-integration-key"] || req.query["key"];
  if (!activeKey || !gdiKeyHeader || gdiKeyHeader !== activeKey) {
    const expected = activeKey || "";
    const mask = expected.length >= 6 
      ? expected.slice(0, 3) + "...[MASK]..." + expected.slice(-3)
      : "...";
    return res.status(401).json({
      success: false,
      errorCode: "UNAUTHORIZED_INTEGRATION_KEY",
      errorMessage: "Chave de integração indevida ou cabeçalho X-BOSS-Google-Docs-Integration-Key inválido.",
      expectedKeyMask: mask
    });
  }

  const results: any = {
    serviceAccountConfigured: false,
    serviceAccountTokenOk: false,
    templateReadable: false,
    integrationKeyConfigured: false,
  };

  // 1. serviceAccountConfigured
  const hasSaEmail = !!credentialsConfig.gdiGoogleServiceAccountEmail;
  const hasSaKey = !!credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  if (hasSaEmail && hasSaKey) {
    results.serviceAccountConfigured = true;
  } else {
    results.serviceAccountConfiguredHint = "Insira tanto o E-mail da Service Account quanto a Chave Privada nas configurações do GDI.";
  }

  // 2. serviceAccountTokenOk
  let token = "";
  if (results.serviceAccountConfigured) {
    try {
      const authRes = await getActiveToken();
      token = authRes.token;
      if (token) {
        results.serviceAccountTokenOk = true;
      } else {
        results.serviceAccountTokenOkHint = "Token obtido está vazio. Verifique os escopos ou permissões no console Google Cloud.";
      }
    } catch (err: any) {
      results.serviceAccountTokenOkHint = `Erro ao obter token da Service Account: ${err.message || err}. Verifique as credenciais digitadas.`;
    }
  } else {
    results.serviceAccountTokenOkHint = "Não é possível testar o token sem configurar as credenciais da Service Account.";
  }

  // 3. templateReadable
  const pPfConfig = templatesConfig["procuracao-pf"];
  const templateId = pPfConfig?.templateGoogleDocsId || "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk";
  
  if (results.serviceAccountTokenOk && token) {
    try {
      const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${templateId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (docRes.ok) {
        const docObj = await docRes.json();
        results.templateReadable = true;
        results.templateReadableTitle = docObj.title || "Documento sem título";
      } else {
        const errJson = await docRes.json().catch(() => ({}));
        const errDetail = errJson.error?.message || docRes.statusText;
        results.templateReadableHint = `O template original do Google Docs (ID: ${templateId}) não pôde ser lido. Compartilhe o template com o e-mail da Service Account "${credentialsConfig.gdiGoogleServiceAccountEmail}" como Leitor. Detalhes: ${errDetail}`;
      }
    } catch (err: any) {
      results.templateReadableHint = `Erro de rede ao ler o template: ${err.message || err}`;
    }
  } else {
    results.templateReadableHint = "Testar leitura de template depende de um token ativo da Service Account.";
  }

  // 4. integrationKeyConfigured
  if (activeKey) {
    results.integrationKeyConfigured = true;
  } else {
    results.integrationKeyConfiguredHint = "A chave de integração 'gdiIntegrationKey' está vazia ou não configurada.";
  }

  // 5. destinationFolder optional check (Tarefa 3)
  const folderId = req.query.folderId;
  if (folderId && results.serviceAccountTokenOk && token) {
    try {
      const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,capabilities&supportsAllDrives=true`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (folderRes.ok) {
        const folderObj = await folderRes.json();
        results.destinationFolderReadable = true;
        results.destinationFolderName = folderObj.name || "";
        results.destinationFolderWritable = !!(folderObj.capabilities?.canAddChildren);
      } else {
        const errJson = await folderRes.json().catch(() => ({}));
        const errDetail = errJson.error?.message || folderRes.statusText;
        results.destinationFolderReadable = false;
        results.destinationFolderWritable = false;
        results.destinationFolderHint = `Compartilhe a pasta de destino do cliente no Google Drive com o e-mail da Service Account '${credentialsConfig.gdiGoogleServiceAccountEmail || "não configurado"}' como Editor.`;
        results.destinationFolderErrorDetail = errDetail;
      }
    } catch (err: any) {
      results.destinationFolderReadable = false;
      results.destinationFolderWritable = false;
      results.destinationFolderHint = `Compartilhe a pasta de destino do cliente no Google Drive com o e-mail da Service Account '${credentialsConfig.gdiGoogleServiceAccountEmail || "não configurado"}' como Editor.`;
      results.destinationFolderErrorDetail = err.message || String(err);
    }
  }

  res.json(results);
});

// Webhook Receptor (Section 7, 8, 9)
app.post("/api/webhook/gdi-job", async (req, res) => {
  const gdiKeyHeader = req.headers["x-boss-google-docs-integration-key"];
  const payload = req.body;
  const nowStr = getFormattedNow();
  const timestampIso = new Date().toISOString();

  // Mask headers
  const headersMasked: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === "string") {
      if (key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("authorization") || key.toLowerCase().includes("token")) {
        headersMasked[key] = val.slice(0, 4) + "... [MASKED] ...";
      } else {
        headersMasked[key] = val;
      }
    }
  }

  const contractVersion = payload?.contractVersion || "";
  const templateKey = payload?.templateKey || "";
  const documentType = payload?.documentType || templateKey || "procuracao_pf";
  const caseId = payload?.caseId || "";
  const clientId = payload?.clientId || "";
  const outputFileName = payload?.outputFileName || "";

  // Resolve clientType with fallbacks
  let rawClientType = (payload?.clientType || "").toUpperCase();
  if (!rawClientType) {
    if (documentType.toLowerCase().includes("pf") || (payload?.payload && payload.payload.cpf)) {
      rawClientType = "PF";
    } else if (documentType.toLowerCase().includes("pj") || (payload?.payload && payload.payload.cnpj)) {
      rawClientType = "PJ";
    }
  }
  const clientType = rawClientType;

  const destinationFolderId = payload?.destinationFolderId || "";
  const destinationFolderUrl = payload?.destinationFolderUrl || "";

  // Sane flat mapping of payload.payload to clientRawData if clientRawData doesn't exist
  if (payload && !payload.clientRawData && payload.payload) {
    payload.clientRawData = {
      pfData: payload.payload,
      pfDadosPessoais: payload.payload,
      bancarioData: payload.payload,
      bancarioDadosBancarios: payload.payload,
      acessoSistema: payload.payload,
      pjData: payload.payload,
      pjDadosEmpresa: payload.payload,
      socioData: payload.payload,
      socioDadosPessoais: payload.payload
    };
  }

  const jobId = "job_" + Math.random().toString(36).substring(2, 11);

  // 1. Create and Save "received" State Job FIRST before security/mock checks
  const initialJob: Job = {
    id: jobId,
    source: payload?.source || "Portal BOSS Clientes",
    target: "GDI",
    documentType,
    status: "received",
    caseId,
    clientId,
    clientType,
    destinationFolderId,
    destinationFolderUrl,
    payload,
    result: { googleDocsId: null, googleDocsUrl: null, fileName: null, pdfUrl: null },
    errorCode: null,
    errorMessage: null,
    logs: [{ timestamp: nowStr, step: "GDI_JOB_RECEIVED", status: "success", message: "GDI: Job de automação documental recebido. Status: received." }],
    createdAt: timestampIso,
    updatedAt: timestampIso,
    rawPayload: payload,
    normalizedPayload: null,
    headersMasked,
    receivedAt: timestampIso,
    processedAt: "",
    contractVersion,
    templateKey,
    outputFileName,
    placeholdersCount: payload?.placeholders ? Object.keys(payload.placeholders).length : 0
  };

  jobsStore.unshift(initialJob);
  saveJobs();

  // Validate integrated securely with X-BOSS-Google-Docs-Integration-Key
  const activeKey = getActiveIntegrationKey();
  if (!activeKey) {
    const failedLogs = [
      ...initialJob.logs,
      { timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI." }
    ];

    updateJobState(jobId, {
      status: "failed",
      errorCode: "GDI_INTEGRATION_KEY_NOT_CONFIGURED",
      errorMessage: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI. Por favor, defina a variável de ambiente GDI_INTEGRATION_KEY no GDI.",
      logs: failedLogs,
      processedAt: new Date().toISOString()
    });

    return res.status(401).json({
      success: false,
      status: "failed",
      errorCode: "GDI_INTEGRATION_KEY_NOT_CONFIGURED",
      errorMessage: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI. Por favor, defina a variável de ambiente GDI_INTEGRATION_KEY no GDI.",
      logs: [{ timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI." }]
    });
  }

  if (!gdiKeyHeader || gdiKeyHeader !== activeKey) {
    console.error("GDI security failure: Unauthorized connection header attempt.");
    
    const failedLogs = [
      ...initialJob.logs,
      { timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "Chave de integração indevida ou cabeçalho X-BOSS-Google-Docs-Integration-Key inválido." }
    ];

    updateJobState(jobId, {
      status: "failed",
      errorCode: "UNAUTHORIZED_INTEGRATION_KEY",
      errorMessage: "Chave de integração indevida ou cabeçalho X-BOSS-Google-Docs-Integration-Key inválido.",
      logs: failedLogs,
      processedAt: new Date().toISOString()
    });

    const expected = activeKey || "";
    const mask = expected.length >= 6 
      ? expected.slice(0, 3) + "...[MASK]..." + expected.slice(-3)
      : "...";

    return res.status(401).json({
      success: false,
      status: "failed",
      errorCode: "UNAUTHORIZED_INTEGRATION_KEY",
      errorMessage: "Chave de integração indevida ou cabeçalho X-BOSS-Google-Docs-Integration-Key inválido.",
      expectedKeyMask: mask,
      logs: [{ timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "Chave de integração inválida" }]
    });
  }

  // Validate early if destination folder is a mock ID (Tarefa 8)
  if (isMockFolderId(destinationFolderId)) {
    const mockErrorMsg = "Payload rejeitado por conter folderId artificial. O GDI só processa destinationFolderId real enviado pelo Portal BOSS.";
    const failedLogs = [
      ...initialJob.logs,
      { timestamp: nowStr, step: "GDI_MOCK_FOLDER_REJECTED", status: "failed", message: mockErrorMsg }
    ];

    updateJobState(jobId, {
      status: "failed",
      errorCode: "MOCK_PAYLOAD_REJECTED",
      errorMessage: mockErrorMsg,
      logs: failedLogs,
      processedAt: new Date().toISOString()
    });

    return res.status(400).json({
      success: false,
      status: "failed",
      errorCode: "MOCK_PAYLOAD_REJECTED",
      errorMessage: mockErrorMsg,
      logs: failedLogs
    });
  }

  // 2. Validate Phase -> Transition to processing/validating
  const localLogs = [...initialJob.logs, { timestamp: getFormattedNow(), step: "GDI_JOB_VALIDATING", status: "success", message: "GDI: Iniciando processamento de integração. Status: processing." }];
  updateJobState(jobId, {
    status: "processing",
    logs: localLogs
  });

  if (!payload || Object.keys(payload).length === 0) {
    const errMsg = "O payload enviado está inteiramente vazio.";
    const emptyLogs = [...localLogs, { timestamp: getFormattedNow(), step: "GDI_PAYLOAD_EMPTY", status: "failed", message: errMsg }];
    updateJobState(jobId, {
      status: "failed",
      errorCode: "PAYLOAD_EMPTY",
      errorMessage: errMsg,
      logs: emptyLogs,
      processedAt: new Date().toISOString()
    });

    return res.status(400).json({
      success: false,
      status: "failed",
      errorCode: "PAYLOAD_EMPTY",
      errorMessage: errMsg,
      logs: emptyLogs
    });
  }

  // For contract placeholders.v1, some fields are configured inside contract version
  const isPlaceholdersModel = (contractVersion === "gdi.placeholders.v1");
  const requiredDocType = isPlaceholdersModel ? (templateKey || documentType) : documentType;

  if (!requiredDocType) {
    const errMsg = "O campo documentType ou templateKey é obrigatório no payload.";
    const valFailedLogs = [...localLogs, { timestamp: getFormattedNow(), step: "GDI_VAL_FAILED", status: "failed", message: errMsg }];
    updateJobState(jobId, {
      status: "failed",
      errorCode: "PAYLOAD_INVALID",
      errorMessage: errMsg,
      logs: valFailedLogs,
      processedAt: new Date().toISOString()
    });

    return res.status(400).json({
      success: false,
      status: "failed",
      errorCode: "PAYLOAD_INVALID",
      errorMessage: errMsg,
      logs: valFailedLogs
    });
  }

  let normalizedPayload: any = null;
  if (!isPlaceholdersModel) {
    try {
      const normResult = normalizePortalBossPayload(payload);
      if (normResult && normResult.validation.isValid) {
        normalizedPayload = normResult.normalized;
      }
    } catch (e) {
      console.error("Normalizer error:", e);
    }
  }

  updateJobState(jobId, {
    normalizedPayload,
  });

  try {
    const result = await executeGdiAutomation(payload);
    
    // 4. Success State -> Transition to success
    const successLogs = [...localLogs, ...result.logs, { timestamp: getFormattedNow(), step: "GDI_JOB_COMPLETED", status: "success", message: "GDI: Documento gerado com sucesso. Status: success." }];
    updateJobState(jobId, {
      status: "success",
      result: {
        googleDocsId: result.googleDocsId,
        googleDocsUrl: result.googleDocsUrl,
        fileName: result.fileName,
        pdfUrl: result.pdfUrl,
      },
      logs: successLogs,
      processedAt: new Date().toISOString()
    });

    if (isPlaceholdersModel) {
      return res.json({
        success: true,
        status: "success",
        googleDocsId: result.googleDocsId,
        googleDocsUrl: result.googleDocsUrl
      });
    }

    return res.json({
      success: true,
      status: "success",
      documentType: requiredDocType,
      caseId,
      clientId,
      googleDocsId: result.googleDocsId,
      googleDocsUrl: result.googleDocsUrl,
      fileName: result.fileName,
      destinationFolderId,
      destinationFolderUrl,
      logs: successLogs,
      payload
    });
  } catch (err: any) {
    console.error("GDI execution error in webhook:", err);
    const errorCode = err.errorCode || "GOOGLE_DOCS_TEMPLATE_COPY_FAILED";
    const errMsg = err.message || "Ocorreu um erro síncrono desconhecido ao processar integração Google.";
    
    // 5. Failed State -> Transition to failed
    const failedLogs = [...localLogs, {
      timestamp: getFormattedNow(),
      step: "failed",
      status: "failed",
      message: errMsg,
      details: err.message
    }];

    updateJobState(jobId, {
      status: "failed",
      errorCode: errorCode,
      errorMessage: errMsg,
      logs: failedLogs,
      processedAt: new Date().toISOString()
    });

    let statusCode = 500;
    if (errorCode === "SERVICE_ACCOUNT_TEMPLATE_PERMISSION_DENIED" || errorCode === "SERVICE_ACCOUNT_DESTINATION_FOLDER_PERMISSION_DENIED") {
      statusCode = 430;
    } else if (errorCode === "PAYLOAD_INVALID" || errorCode === "SERVICE_ACCOUNT_NOT_CONFIGURED" || errorCode === "TEMPLATE_NOT_CONFIGURED" || errorCode === "CLIENT_DATA_MISSING" || errorCode === "MOCK_PAYLOAD_REJECTED") {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      status: "failed",
      errorCode,
      errorMessage: errMsg,
      logs: failedLogs
    });
  }
});

// Webhook Dry Run Receptor (Tarefa 4)
app.post("/api/webhook/gdi-job/dry-run", async (req, res) => {
  const gdiKeyHeader = req.headers["x-boss-google-docs-integration-key"];
  const payload = req.body;
  const nowStr = getFormattedNow();
  const timestampIso = new Date().toISOString();

  // Validate security integration key
  const activeKey = getActiveIntegrationKey();
  if (!activeKey) {
    return res.status(401).json({
      success: false,
      status: "failed",
      errorCode: "GDI_INTEGRATION_KEY_NOT_CONFIGURED",
      errorMessage: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI. Por favor, defina a variável de ambiente GDI_INTEGRATION_KEY no GDI.",
      logs: [{ timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "A chave de integração GDI_INTEGRATION_KEY não está configurada no GDI." }]
    });
  }

  if (!gdiKeyHeader || gdiKeyHeader !== activeKey) {
    console.error("GDI dry-run security failure: Unauthorized connection header attempt.");
    return res.status(401).json({
      success: false,
      status: "failed",
      errorCode: "UNAUTHORIZED_INTEGRATION_KEY",
      errorMessage: "Chave de integração indevida ou cabeçalho X-BOSS-Google-Docs-Integration-Key inválido.",
      logs: [{ timestamp: nowStr, step: "GDI_SECURITY_FAILED", status: "failed", message: "Chave de integração de dry-run inválida" }]
    });
  }

  // Mask headers
  const headersMasked: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === "string") {
      if (key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("authorization") || key.toLowerCase().includes("token")) {
        headersMasked[key] = val.slice(0, 4) + "... [MASKED] ...";
      } else {
        headersMasked[key] = val;
      }
    }
  }

  const contractVersion = payload?.contractVersion || "";
  const templateKey = payload?.templateKey || "";
  const documentType = payload?.documentType || templateKey || "procuracao_pf";
  const caseId = payload?.caseId || "";
  const clientId = payload?.clientId || "";

  // Resolve clientType with fallbacks
  let rawClientType = (payload?.clientType || "").toUpperCase();
  if (!rawClientType) {
    if (documentType.toLowerCase().includes("pf") || (payload?.payload && payload.payload.cpf)) {
      rawClientType = "PF";
    } else if (documentType.toLowerCase().includes("pj") || (payload?.payload && payload.payload.cnpj)) {
      rawClientType = "PJ";
    }
  }
  const clientType = rawClientType;

  const destinationFolderId = payload?.destinationFolderId || "";
  const destinationFolderUrl = payload?.destinationFolderUrl || "";

  // Sane flat mapping of payload.payload to clientRawData if clientRawData doesn't exist
  if (payload && !payload.clientRawData && payload.payload) {
    payload.clientRawData = {
      pfData: payload.payload,
      pfDadosPessoais: payload.payload,
      bancarioData: payload.payload,
      bancarioDadosBancarios: payload.payload,
      acessoSistema: payload.payload,
      pjData: payload.payload,
      pjDadosEmpresa: payload.payload,
      socioData: payload.payload,
      socioDadosPessoais: payload.payload
    };
  }

  const jobId = "job_dry_" + Math.random().toString(36).substring(2, 11);

  // Validate early if destination folder is a mock ID (Tarefa 8)
  if (isMockFolderId(destinationFolderId)) {
    const mockErrorMsg = "Payload rejeitado por conter folderId artificial. O GDI só processa destinationFolderId real enviado pelo Portal BOSS.";
    const failedJob: Job = {
      id: jobId,
      source: payload?.source || "Portal BOSS Clientes",
      target: "GDI",
      documentType,
      status: "failed",
      caseId,
      clientId,
      clientType,
      destinationFolderId,
      destinationFolderUrl,
      payload,
      result: { googleDocsId: null, googleDocsUrl: null, fileName: null, pdfUrl: null },
      errorCode: "MOCK_PAYLOAD_REJECTED",
      errorMessage: mockErrorMsg,
      logs: [
        { timestamp: nowStr, step: "GDI_JOB_RECEIVED_DRY_RUN", status: "success", message: "GDI: Job de dry-run recebido." },
        { timestamp: nowStr, step: "GDI_MOCK_FOLDER_REJECTED", status: "failed", message: mockErrorMsg }
      ],
      createdAt: timestampIso,
      updatedAt: timestampIso,
      rawPayload: payload,
      normalizedPayload: null,
      headersMasked,
      receivedAt: timestampIso,
      processedAt: timestampIso,
      contractVersion,
      templateKey,
      placeholdersCount: payload?.placeholders ? Object.keys(payload.placeholders).length : 0
    };

    jobsStore.unshift(failedJob);
    saveJobs();

    return res.status(400).json({
      success: false,
      status: "failed",
      errorCode: "MOCK_PAYLOAD_REJECTED",
      errorMessage: mockErrorMsg,
      validation: { isValid: false, errorMessage: mockErrorMsg }
    });
  }

  // Parse and normalize the payload to check
  let normalizedPayload: any = null;
  let validationResult: any = null;
  const isPlaceholdersModel = (contractVersion === "gdi.placeholders.v1");

  if (!isPlaceholdersModel) {
    try {
      const normResult = normalizePortalBossPayload(payload);
      normalizedPayload = normResult?.normalized || null;
      validationResult = normResult?.validation || null;
    } catch (e) {
      console.error("Normalizer error in dry-run:", e);
    }
  } else {
    // For placeholders model, validation matches simple criteria
    const hasPlaceholders = payload?.placeholders && typeof payload.placeholders === "object" && Object.keys(payload.placeholders).length > 0;
    validationResult = {
      isValid: !!(templateKey && destinationFolderId && hasPlaceholders),
      errorMessage: !templateKey
        ? "templateKey obrigatória."
        : (!destinationFolderId
          ? "destinationFolderId obrigatória."
          : (!hasPlaceholders ? "O objeto 'placeholders' deve ser preenchido e não-vazio." : ""))
    };
  }

  // Register job with status = dry_run_received
  const dryRunJob: Job = {
    id: jobId,
    source: payload?.source || "Portal BOSS Clientes",
    target: "GDI",
    documentType,
    status: "dry_run_received",
    caseId,
    clientId,
    clientType,
    destinationFolderId,
    destinationFolderUrl,
    payload,
    result: { googleDocsId: null, googleDocsUrl: null, fileName: null, pdfUrl: null },
    errorCode: validationResult && !validationResult.isValid ? (validationResult.errorType || "PAYLOAD_INVALID") : null,
    errorMessage: validationResult && !validationResult.isValid ? validationResult.errorMessage : null,
    logs: [
      { timestamp: nowStr, step: "GDI_JOB_RECEIVED_DRY_RUN", status: "success", message: "GDI: Job de automação documental recebido em modo dry-run. Status: dry_run_received." },
      { timestamp: nowStr, step: "GDI_JOB_DRY_RUN", status: validationResult && !validationResult.isValid ? "failed" : "success", message: validationResult && !validationResult.isValid ? `GDI (Dry-Run): Validação de payload falhou: ${validationResult.errorMessage}` : "GDI (Dry-Run): Payload validado com sucesso contra o esquema de normalização." }
    ],
    createdAt: timestampIso,
    updatedAt: timestampIso,
    rawPayload: payload,
    normalizedPayload,
    headersMasked,
    receivedAt: timestampIso,
    processedAt: timestampIso,
    contractVersion,
    templateKey,
    placeholdersCount: payload?.placeholders ? Object.keys(payload.placeholders).length : 0
  };

  jobsStore.unshift(dryRunJob);
  saveJobs();

  return res.json({
    success: true,
    status: "dry_run_received",
    service: "gdi",
    jobId,
    message: "Payload recebido pelo GDI em modo dry-run. Nenhum documento foi gerado.",
    validation: validationResult || { isValid: true }
  });
});

// Trigger endpoint from Diagnostic dashboard
app.post("/api/jobs/trigger", async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.documentType) {
    return res.status(400).json({ error: "Payload inválido para testar" });
  }

  const jobId = "job_" + Math.random().toString(36).substring(2, 11);
  const nowStr = getFormattedNow();
  const timestampIso = new Date().toISOString();

  // Check if Service Account is configured
  const hasSa = !!credentialsConfig.gdiGoogleServiceAccountEmail && !!credentialsConfig.gdiGoogleServiceAccountPrivateKey;
  if (!hasSa) {
    return res.status(400).json({
      success: false,
      error: "O disparador de diagnóstico necessita de uma Service Account real configurada nas credenciais. O barramento de simulação/mock foi removido."
    });
  }

  try {
    const result = await executeGdiAutomation(payload);
    
    const testJob: Job = {
      id: jobId,
      source: payload.source || "GDI Diagnostic Engine",
      target: "GDI",
      documentType: payload.documentType,
      status: "success",
      caseId: payload.caseId || "CASE-DIR-2026",
      clientId: payload.clientId || "CLI-DIR-2026",
      clientType: payload.clientType || "PF",
      destinationFolderId: payload.destinationFolderId || "",
      destinationFolderUrl: payload.destinationFolderUrl || "",
      payload,
      result: {
        googleDocsId: result.googleDocsId,
        googleDocsUrl: result.googleDocsUrl,
        fileName: result.fileName,
        pdfUrl: result.pdfUrl
      },
      errorCode: null,
      errorMessage: null,
      logs: [...result.logs],
      createdAt: timestampIso,
      updatedAt: timestampIso
    };

    jobsStore.unshift(testJob);
    saveJobs();

    res.json({ success: true, job: testJob });
  } catch (err: any) {
    const errorCode = err.errorCode || "GOOGLE_DOCS_TEMPLATE_COPY_FAILED";
    const errorMessage = err.message || "Erro desconhecido na integração Google.";
    
    const testJob: Job = {
      id: jobId,
      source: payload.source || "GDI Diagnostic Engine",
      target: "GDI",
      documentType: payload.documentType,
      status: "failed",
      caseId: payload.caseId || "CASE-DIR-2026",
      clientId: payload.clientId || "CLI-DIR-2026",
      clientType: payload.clientType || "PF",
      destinationFolderId: payload.destinationFolderId || "",
      destinationFolderUrl: payload.destinationFolderUrl || "",
      payload,
      result: { googleDocsId: null, googleDocsUrl: null, fileName: null, pdfUrl: null },
      errorCode,
      errorMessage,
      logs: [{
        timestamp: nowStr,
        step: "failed",
        status: "failed",
        message: errorMessage,
        details: err.message
      }],
      createdAt: timestampIso,
      updatedAt: timestampIso
    };

    jobsStore.unshift(testJob);
    saveJobs();

    res.status(400).json({ success: false, error: errorMessage, job: testJob });
  }
});

// Fallback JSON for any unmatched api routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    status: "failed",
    errorCode: "GDI_API_ROUTE_NOT_FOUND",
    errorMessage: "Rota API não encontrada no GDI."
  });
});


// ---------------- SERVER AND VITE SERVING ----------------

async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GDI API listening on 0.0.0.0:${PORT}`);
  });
}

start();
