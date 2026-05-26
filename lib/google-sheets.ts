import { google } from "googleapis";
import { normalizePrivateKey } from "./auth-types";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

function getSpreadsheetId() {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
}

function getSheetName() {
  return process.env.GOOGLE_SHEETS_USER_SHEET_NAME || "Users";
}

function getSheetsScriptUrl() {
  return process.env.GOOGLE_SHEETS_SCRIPT_URL;
}

function isScriptUrlConfigured() {
  return Boolean(getSheetsScriptUrl());
}

function getKeyfilePath() {
  return (
    process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    undefined
  );
}

function getServiceAccountJsonEnv() {
  return process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
}

function normalizeServiceAccountKey(key: string | undefined) {
  return normalizePrivateKey(key);
}

function parseServiceAccountJson(rawJson: string) {
  try {
    const config = JSON.parse(rawJson);
    const clientEmail = typeof config.client_email === "string" ? config.client_email.trim() : "";
    const privateKey = normalizeServiceAccountKey(typeof config.private_key === "string" ? config.private_key : undefined);
    if (!clientEmail || !privateKey) {
      return null;
    }
    return { clientEmail, privateKey };
  } catch {
    return null;
  }
}

function getServiceAccountCredentialsSync(): { clientEmail: string; privateKey: string } | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const privateKey = normalizeServiceAccountKey(rawPrivateKey);

  if (clientEmail && privateKey) {
    return { clientEmail, privateKey };
  }

  const keyfile = getKeyfilePath();
  if (keyfile && fs.existsSync(keyfile)) {
    try {
      const fileContents = fs.readFileSync(keyfile, "utf8");
      return parseServiceAccountJson(fileContents);
    } catch {
      return null;
    }
  }

  const jsonEnv = getServiceAccountJsonEnv();
  if (jsonEnv) {
    return parseServiceAccountJson(jsonEnv);
  }

  return null;
}

export function isSheetsConfigured() {
  return Boolean(
    (getSpreadsheetId() && getServiceAccountCredentialsSync()) ||
      isScriptUrlConfigured(),
  );
}

function assertSheetsConfig() {
  if (!isSheetsConfigured()) {
    throw new Error(
      "Google Sheets credentials not configured. Set GOOGLE_SHEETS_SCRIPT_URL or Google service account credentials in .env.local.",
    );
  }
}

async function getServiceAccountCredentials() {
  const synced = getServiceAccountCredentialsSync();
  if (synced) return synced;

  const keyfile = getKeyfilePath();
  if (keyfile) {
    const fileContents = await fsPromises.readFile(keyfile, "utf8");
    const parsed = parseServiceAccountJson(fileContents);
    if (parsed) return parsed;
  }

  const jsonEnv = getServiceAccountJsonEnv();
  if (jsonEnv) {
    const parsed = parseServiceAccountJson(jsonEnv);
    if (parsed) return parsed;
  }

  throw new Error("Google Sheets service account credentials are unavailable.");
}

const localUsersFilePath = path.join(process.cwd(), "data", "local-users.json");

export type UserSheetRow = {
  fullName: string;
  email: string;
  password: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  trialEndsAt?: string;
  membershipStatus?: string;
  subscriptionTier?: "basic" | "pro" | "ultimate" | "trial" | "none";
};

function normalizeHeaderValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function ensureLocalUsersFile() {
  try {
    await fsPromises.mkdir(path.dirname(localUsersFilePath), { recursive: true });
    await fsPromises.access(localUsersFilePath);
  } catch {
    await fsPromises.writeFile(localUsersFilePath, "[]", "utf8");
  }
}

async function readLocalUsers(): Promise<UserSheetRow[]> {
  await ensureLocalUsersFile();
  try {
    const fileContents = await fsPromises.readFile(localUsersFilePath, "utf8");
    const parsed = JSON.parse(fileContents);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row: unknown) => ({
        fullName: typeof (row as any).fullName === "string" ? (row as any).fullName : "",
        email: typeof (row as any).email === "string" ? (row as any).email.toLowerCase().trim() : "",
        password: typeof (row as any).password === "string" ? (row as any).password : "",
        passwordHash: typeof (row as any).passwordHash === "string" ? (row as any).passwordHash : "",
        salt: typeof (row as any).salt === "string" ? (row as any).salt : "",
        createdAt: typeof (row as any).createdAt === "string" ? (row as any).createdAt : "",
        trialEndsAt: typeof (row as any).trialEndsAt === "string" ? (row as any).trialEndsAt : undefined,
        membershipStatus: typeof (row as any).membershipStatus === "string" ? (row as any).membershipStatus : "trial",
        subscriptionTier: typeof (row as any).subscriptionTier === "string" ? (row as any).subscriptionTier : "trial",
      }))
      .filter((row) => row.email && row.passwordHash && row.salt);
  } catch (err) {
    console.error("Failed to read local user storage:", err);
    return [];
  }
}

async function writeLocalUsers(users: UserSheetRow[]) {
  await ensureLocalUsersFile();
  try {
    await fsPromises.writeFile(localUsersFilePath, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local user storage:", err);
  }
}

async function getSheetsClient() {
  assertSheetsConfig();
  const { clientEmail, privateKey } = await getServiceAccountCredentials();
  const authClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await authClient.authorize();
  return google.sheets({ version: "v4", auth: authClient });
}

async function appendUserRowToSheet(row: UserSheetRow) {
  const client = await getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId()!,
    range: `${getSheetName()}!A:H`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          row.fullName,
          row.email,
          row.password,
          row.passwordHash,
          row.salt,
          row.createdAt,
          row.trialEndsAt,
          row.membershipStatus,
          row.subscriptionTier || "trial",
        ],
      ],
    },
  });
}

async function appendUserViaScript(row: UserSheetRow) {
  const scriptUrl = getSheetsScriptUrl();
  if (!scriptUrl) {
    throw new Error("Google Sheets script URL is not configured.");
  }
  // Try JSON POST first (includes both nested `user` and flattened fields)
  const jsonPayload = {
    action: "appendUser",
    user: {
      fullName: row.fullName,
      email: row.email,
      password: row.password,
      passwordHash: row.passwordHash,
      salt: row.salt,
      createdAt: row.createdAt,
      trialEndsAt: row.trialEndsAt,
      membershipStatus: row.membershipStatus,
      subscriptionTier: row.subscriptionTier || "trial",
    },
    fullName: row.fullName,
    email: row.email,
    password: row.password,
    passwordHash: row.passwordHash,
    salt: row.salt,
    createdAt: row.createdAt,
    trialEndsAt: row.trialEndsAt,
    membershipStatus: row.membershipStatus,
    subscriptionTier: row.subscriptionTier || "trial",
  };

  let response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonPayload),
  });

  if (response.ok) return;

  // If JSON failed, try form-encoded POST (many Apps Script examples use form params)
  const form = new URLSearchParams();
  form.set("action", "appendUser");
  form.set("fullName", row.fullName);
  form.set("email", row.email);
  form.set("password", row.password);
  form.set("passwordHash", row.passwordHash);
  form.set("salt", row.salt);
  form.set("createdAt", row.createdAt);
  if (row.trialEndsAt) form.set("trialEndsAt", row.trialEndsAt);
  if (row.membershipStatus) form.set("membershipStatus", row.membershipStatus);
  if (row.subscriptionTier) form.set("subscriptionTier", row.subscriptionTier);

  response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (response.ok) return;

  // Last resort: send GET with query params (some scripts read parameters from URL)
  const url = new URL(scriptUrl);
  url.searchParams.set("action", "appendUser");
  url.searchParams.set("fullName", row.fullName);
  url.searchParams.set("email", row.email);
  url.searchParams.set("password", row.password);
  url.searchParams.set("passwordHash", row.passwordHash);
  url.searchParams.set("salt", row.salt);
  url.searchParams.set("createdAt", row.createdAt);
  if (row.trialEndsAt) url.searchParams.set("trialEndsAt", row.trialEndsAt);
  if (row.membershipStatus) url.searchParams.set("membershipStatus", row.membershipStatus);
  if (row.subscriptionTier) url.searchParams.set("subscriptionTier", row.subscriptionTier);

  response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to append user via script: ${response.status} ${text}`);
  }
}

async function fetchUsersViaScript(): Promise<UserSheetRow[]> {
  const scriptUrl = getSheetsScriptUrl();
  if (!scriptUrl) {
    return [];
  }

  const url = new URL(scriptUrl);
  url.searchParams.set("action", "getUsers");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch users via script: ${response.status} ${text}`);
  }

  const data = await response.json();
  const users = Array.isArray(data)
    ? data
    : Array.isArray(data?.users)
    ? data.users
    : [];

  return users
    .map((row: any) => ({
      fullName: normalizeHeaderValue(row.fullName),
      email: normalizeHeaderValue(row.email).toLowerCase(),
      password: normalizeHeaderValue(row.password),
      passwordHash: normalizeHeaderValue(row.passwordHash),
      salt: normalizeHeaderValue(row.salt),
      createdAt: normalizeHeaderValue(row.createdAt),
      trialEndsAt: normalizeHeaderValue(row.trialEndsAt),
      membershipStatus: normalizeHeaderValue(row.membershipStatus) || "trial",
      subscriptionTier: normalizeHeaderValue(row.subscriptionTier) || "trial",
    }))
    .filter((row: UserSheetRow) => row.email && row.passwordHash && row.salt);
}

export async function getAllUsers(): Promise<UserSheetRow[]> {
  // Always prioritize local storage as the source of truth for password hashes
  const localUsers = await readLocalUsers();

  if (!isSheetsConfigured()) {
    return localUsers;
  }

  // Try to sync with Google Sheets, but always return local users as the source of truth
  try {
    if (!getServiceAccountCredentialsSync() && isScriptUrlConfigured()) {
      try {
        const scriptUsers = await fetchUsersViaScript();
        // Merge script users with local users, prioritizing local data
        const localUserMap = new Map(localUsers.map(u => [u.email, u]));
        for (const scriptUser of scriptUsers) {
          if (!localUserMap.has(scriptUser.email)) {
            localUserMap.set(scriptUser.email, scriptUser);
          }
        }
        return Array.from(localUserMap.values());
      } catch (err) {
        console.error("Failed to fetch users via script, using local storage:", err);
        return localUsers;
      }
    }

    const client = await getSheetsClient();
    const response = await client.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId()!,
      range: `${getSheetName()}!A:Z`,
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return localUsers;
    }

    // Create column index map from header row
    const headers = values[0].map((h: any) => String(h).trim().toLowerCase());
    const getColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.indexOf(name.toLowerCase());
        if (index !== -1) return index;
      }
      return -1;
    };

    const fullNameCol = getColumnIndex(["fullname", "full name", "name"]);
    const emailCol = getColumnIndex(["email", "e-mail"]);
    const passwordCol = getColumnIndex(["password"]);
    const passwordHashCol = getColumnIndex(["passwordhash", "password hash"]);
    const saltCol = getColumnIndex(["salt"]);
    const createdAtCol = getColumnIndex(["createdat", "created at", "created"]);
    const trialEndsAtCol = getColumnIndex(["trialendsat", "trial ends at", "trial"]);
    const membershipStatusCol = getColumnIndex(["membershipstatus", "membership status", "status"]);
    const subscriptionTierCol = getColumnIndex(["subscriptiontier", "subscription tier", "tier", "plan"]);

    // If required columns are missing, return local users
    if (emailCol === -1 || passwordHashCol === -1 || saltCol === -1) {
      console.error("Required columns (email, passwordHash, salt) not found in Google Sheet, using local storage");
      return localUsers;
    }

    const rows = values.slice(1);
    const sheetUsers: UserSheetRow[] = rows
      .map((row) => ({
        fullName: fullNameCol !== -1 ? normalizeHeaderValue(row[fullNameCol]) : "",
        email: normalizeHeaderValue(row[emailCol]).toLowerCase(),
        password: passwordCol !== -1 ? normalizeHeaderValue(row[passwordCol]) : "",
        passwordHash: normalizeHeaderValue(row[passwordHashCol]),
        salt: normalizeHeaderValue(row[saltCol]),
        createdAt: createdAtCol !== -1 ? normalizeHeaderValue(row[createdAtCol]) : new Date().toISOString(),
        trialEndsAt: trialEndsAtCol !== -1 ? normalizeHeaderValue(row[trialEndsAtCol]) : undefined,
        membershipStatus: membershipStatusCol !== -1 ? normalizeHeaderValue(row[membershipStatusCol]) || "trial" : "trial",
        subscriptionTier: (subscriptionTierCol !== -1 ? normalizeHeaderValue(row[subscriptionTierCol]) || "trial" : "trial") as import("./auth-types").SubscriptionTier,
      }))
      .filter((row) => row.email && row.passwordHash && row.salt);

    // Merge sheet users with local users, prioritizing local data for password hashes
    const localUserMap = new Map(localUsers.map(u => [u.email, u]));
    for (const sheetUser of sheetUsers) {
      const localUser = localUserMap.get(sheetUser.email);
      if (!localUser) {
        // New user from sheet, add to local
        localUserMap.set(sheetUser.email, sheetUser);
      }
      // If user exists locally, keep local data (it has the correct password hash)
    }

    // Sync any local users not in sheet to sheet
    const sheetUserEmails = new Set(sheetUsers.map((user) => user.email));
    for (const localUser of localUsers) {
      if (!sheetUserEmails.has(localUser.email)) {
        try {
          await appendUserRowToSheet(localUser);
        } catch (err) {
          console.error("Failed to migrate local user to Google Sheets:", err);
        }
      }
    }

    return Array.from(localUserMap.values());
  } catch (err) {
    console.error("Failed to fetch users from Google Sheets, using local storage:", err);
    return localUsers;
  }
}

export async function getUserByEmail(
  email: string,
): Promise<UserSheetRow | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const users = await getAllUsers();
    return users.find((row) => row.email === normalizedEmail) ?? null;
  } catch (err) {
    console.error("Failed to resolve user by email:", err);
    return null;
  }
}

export async function appendUser(
  user: Omit<UserSheetRow, "createdAt" | "trialEndsAt" | "membershipStatus">,
): Promise<UserSheetRow> {
  const createdAt = new Date().toISOString();
  const trialEndsAt = new Date(Date.parse(createdAt) + 24 * 60 * 60 * 1000).toISOString();
  const membershipStatus = "trial";
  const subscriptionTier = (user as any).subscriptionTier || "trial";

  const row = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt,
    trialEndsAt,
    membershipStatus,
    subscriptionTier,
  };

  // Always save to local storage first as backup
  const existingUsers = await readLocalUsers();
  await writeLocalUsers([...existingUsers, row]);

  const serviceAccountConfigured = Boolean(getSpreadsheetId() && getServiceAccountCredentialsSync());
  const scriptUrl = getSheetsScriptUrl();

  if (serviceAccountConfigured) {
    try {
      await appendUserRowToSheet(row);
    } catch (err) {
      console.error("Failed to append user to Google Sheets via service account:", err);
    }
  }

  if (scriptUrl) {
    try {
      await appendUserViaScript(row);
    } catch (err) {
      console.error("Failed to append user via Google Sheets script:", err);
    }
  }

  return row;
}
