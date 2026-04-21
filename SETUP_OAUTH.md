# OAuth Setup (manuell im Supabase Dashboard)

Diese Anleitung beschreibt was Nico nach dem Deployment einmalig in der Supabase-Konsole
und in den jeweiligen Entwicklerportalen einrichten muss.

---

## Google OAuth

### 1. Google Cloud Console

1. Öffne https://console.cloud.google.com
2. Wähle ein bestehendes Projekt oder erstelle ein neues
3. Navigiere zu **APIs & Services → Credentials**
4. Klicke **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `MyCapTable`
7. Authorized redirect URIs – folgenden URI eintragen:
   ```
   https://zmstmhiyfgdrxrqrqzrt.supabase.co/auth/v1/callback
   ```
8. Client ID und Client Secret notieren

### 2. Supabase Dashboard

1. Öffne https://supabase.com/dashboard/project/zmstmhiyfgdrxrqrqzrt
2. Navigiere zu **Authentication → Providers → Google**
3. Toggle auf **Enabled** setzen
4. Client ID und Client Secret eintragen
5. Speichern

---

## Apple OAuth

### 1. Apple Developer Account

1. Öffne https://developer.apple.com/account/
2. Navigiere zu **Certificates, Identifiers & Profiles → Identifiers**
3. Klicke **+** → wähle **Services IDs**
4. Fülle aus:
   - Description: `MyCapTable`
   - Identifier: `de.lmno.mycaptable` (oder deine gewünschte Bundle ID)
5. Aktiviere **Sign In with Apple** → Configure
6. Domains: `mycaptable.vercel.app`
7. Return URLs:
   ```
   https://zmstmhiyfgdrxrqrqzrt.supabase.co/auth/v1/callback
   ```
8. Speichern und die Services ID notieren

### 2. Apple Private Key erstellen

1. In Apple Developer → **Keys → +**
2. Key Name: `MyCapTable Supabase`
3. Aktiviere **Sign In with Apple** → Configure → wähle deine App
4. Key herunterladen (`.p8`-Datei) – wird nur einmal angeboten
5. Key ID notieren

### 3. Supabase Dashboard

1. Öffne https://supabase.com/dashboard/project/zmstmhiyfgdrxrqrqzrt
2. Navigiere zu **Authentication → Providers → Apple**
3. Toggle auf **Enabled** setzen
4. Fülle aus:
   - **Services ID**: `de.lmno.mycaptable`
   - **Apple Team ID**: deine 10-stellige Team ID (im Apple Developer Portal oben rechts)
   - **Key ID**: Key ID aus Schritt 2.5
   - **Private Key**: Inhalt der `.p8`-Datei einfügen
5. Speichern

---

## Vercel Environment Variables

Keine Änderungen nötig – die OAuth-Credentials werden nur in Supabase gespeichert,
nicht als Env-Variable im Vite-Frontend.

---

## Testen

Nach der Konfiguration:

1. Öffne https://mycaptable.vercel.app
2. Füge einen Gesellschafter hinzu
3. Klicke **Speichern** → Login-Modal erscheint
4. Teste **Mit Google anmelden** → Redirect zu Google → zurück zu `/auth/callback` → Dashboard
5. Prüfe in Supabase Dashboard → Authentication → Users ob der User angelegt wurde
6. Prüfe in Supabase → Table Editor → companies ob der Guest State übertragen wurde
