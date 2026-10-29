# Run in VS Code — step by step (Tanglish)

Ithu **VS Code-la project-a open panni local-a run panna** vendiyadhu mattum.
Rendu vaazhi irukku — **A (ZIP, easiest)** illa **B (git clone)**. Edhuvum onnu pothum.

---

## 0. Ithu oru Pull Request — adha VS Code-la eppadi run panna?

Ithu `main`-la innum merge aagala. So `main`-a clone pannaa site varadhu — **PR branch-a** edukkanum.

**PR link:** https://github.com/Muniyasamy107/trip-tastic/pull/4
**Branch:** `arena/23d9011d-trip-tastic`

### Vaazhi 1 — VS Code GitHub Pull Requests extension (easy)

1. VS Code → Extensions (`Ctrl+Shift+X`) → **GitHub Pull Requests** install pannunga.
2. `Ctrl+Shift+P` → **GitHub Pull Requests: Sign in** (oru thadava).
3. `Ctrl+Shift+P` → **GitHub Pull Requests: Checkout Pull Request** → URL paste pannunga:
   `https://github.com/Muniyasamy107/trip-tastic/pull/4`
4. Terminal (`Ctrl+`` ` ``) → `npm install` → `npm start`. Mudinjadhu.

### Vaazhi 2 — `gh` CLI (terminal mattum)

```powershell
cd $HOME\Desktop
git clone https://github.com/Muniyasamy107/trip-tastic.git triptastic
cd triptastic
gh pr checkout 4
npm install
npm start
```

`gh` install illa-na (Windows): `winget install GitHub.cli` → terminal-a restart pannunga.

### Vaazhi 3 — plain git (gh illa, extension illa)

```powershell
cd $HOME\Desktop
git clone https://github.com/Muniyasamy107/trip-tastic.git triptastic
cd triptastic
git checkout arena/23d9011d-trip-tastic
npm install
npm start
```

> Namma launcher 3000-la aarambikkum, busy-na 3001… ethu free-o adhu, browser-la sari URL-a thaana
> open pannum. Port error varaadhu.

### Vaazhi 4 — Dev Container / Codespaces (VS Code-la container-la run)

Repo-la `.devcontainer/devcontainer.json` irukku (Node 22 + port 5173 forwarded + `npm install`
automatic). Docker irundha:

1. Repo-a clone panni VS Code-la open pannunga.
2. `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**.
3. Container ready aana appuram terminal-la `npm start` — VS Code port 5173-a auto-forward pannum,
   "Open in Browser" click pannunga.

GitHub Codespaces venumna: https://codespaces.new/Muniyasamy107/trip-tastic?quickstart=1
(branch-a `arena/23d9011d-trip-tastic`-a select pannunga).

### Vaazhi 5 — ZIP (git, gh, account ellam vendaam)

https://github.com/Muniyasamy107/trip-tastic/archive/refs/heads/arena/23d9011d-trip-tastic.zip

Extract → VS Code-la folder open → terminal → `npm install` → `npm start`.

---

## A. ZIP download (git thevai illa)

1. Ithu download pannunga:
   **https://github.com/Muniyasamy107/trip-tastic/archive/refs/heads/arena/23d9011d-trip-tastic.zip**
2. ZIP-a right-click → **Extract All** → `C:\Users\<you>\Desktop\triptastic` (path-la **space
   illaadha** folder name vachukkonga; Tamil letters vendaam).
3. VS Code open → **File ▸ Open Folder** → `C:\Users\<you>\Desktop\triptastic`
   (inside-la `package.json`, `src`, `public` folders direct-a theriyanum — extra inner folder
   irundha, adha open pannunga).
4. **Terminal ▸ New Terminal** (VS Code-la `Ctrl` + `` ` ``).
5. Ithu type pannunga:

```powershell
npm install
npm run dev
```

6. Terminal-la `Local: http://localhost:5173/` vandhaa → adha `Ctrl` + **click** pannunga.
   Browser-la site open aagum. Stop panna: `Ctrl` + `C`.

---

## B. git clone (VS Code terminal-la)

```powershell
cd $HOME\Desktop
git clone https://github.com/Muniyasamy107/trip-tastic.git triptastic
cd triptastic
git checkout arena/23d9011d-trip-tastic
```

Apram VS Code: **File ▸ Open Folder ▸** `triptastic` → Terminal:

```powershell
npm install
npm run dev
```

> `main` branch-la innum merge aagala, so `git checkout arena/23d9011d-trip-tastic` **mukkiyam**.
> PR merge aana appuram checkout thevai illa.

---

## C. Namma ready-made launchers (terminal typing vendaam)

| Method | Enna aagum |
| --- | --- |
| **`start-site.bat`** double-click | Node check → `npm install` (first time) → free port-a automatic-a eduthu server start → browser thaana open aagum |
| VS Code-la **`F5`** | *"Trip Tastic — run site (Chrome)"* launch config → dev server + Chrome debug window |
| `Ctrl+Shift+B` | Production build (`npm run build`) → `dist/` |
| Terminal-la `npm start` | `scripts/launch.mjs` — free port + auto browser (Windows/Mac/Linux same) |

`start-site.bat` la **port error varaadhu**: 3000 busy-a irundha 3001, 3002… ethu free-o adhu
edukkum, browser-la correct URL-a open pannum. (`strictPort` off-a irukku.)

---

## D. Common problems → fix

| Symptom | Fix |
| --- | --- |
| `'npm' is not recognized` | Node.js install pannunga: https://nodejs.org (LTS, 20+). VS Code-a **restart** pannunga. |
| `ENOENT package.json` | Wrong folder open. Explorer-la `package.json` theriyudhaa paakunga; illa `cd` pannunga. |
| `EADDRINUSE` / port busy | Already solved — launcher free port edukkum. Vera page-a refresh pannunga. |
| Screen white / blank | `F12` → Console error screenshot anuppunga. `node_modules` delete panni `npm install` retry. |
| Video play aagala | Chrome/Edge latest use pannunga. `prefers-reduced-motion` ON-a irundha (Windows Settings ▸ Accessibility) stills mattum varum — adhu by design. |
| `npm install` slow | First time 1–2 min normal. WiFi check. |

---

## E. Useful commands

```powershell
npm run dev        # dev server (5173, busy-na next port)
npm start          # free port + browser auto-open
npm run build      # production build → dist/
npm run preview    # dist/-a local-a serve pannum
```

Project structure quick map:

```
src/         React components, styles, data
public/      images, brand assets, video/ (4K hero film), design/ spec sheet
scripts/     media render scripts (hero film, design frame, launcher)
.vscode/     F5 launch configs + tasks (already set up)
```

4K hero film-a verify panna: `http://localhost:5173/design/` → *The video pack* section-la
**Download 4K** button irukku.
