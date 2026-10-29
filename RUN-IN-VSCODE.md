# Run in VS Code — step by step (Tanglish)

Ithu **VS Code-la project-a open panni local-a run panna** vendiyadhu mattum.
Rendu vaazhi irukku — **A (ZIP, easiest)** illa **B (git clone)**. Edhuvum onnu pothum.

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
