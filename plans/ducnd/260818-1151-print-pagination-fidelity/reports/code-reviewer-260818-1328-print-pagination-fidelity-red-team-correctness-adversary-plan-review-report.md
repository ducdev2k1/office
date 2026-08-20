# Red-team plan review — Correctness Adversary / Fact Checker

Plan: `plans/ducnd/260818-1151-print-pagination-fidelity/`
Lens: correctness / data-integrity / rendering-wrongness. No auth or network surface in the touched code.
Empirical checks: `/usr/bin/google-chrome --headless=new` + CDP `Page.printToPDF` (throwaway scripts, not committed).

---

## Finding 1: `#root { display: none }` in `@media print` makes continuous-mode printing output blank pages

- **Severity:** Critical
- **Location:** Phase 4, "Cấu trúc DOM" → CSS block; contradicts Phase 4 "Requirements" bullet 4 and Success Criteria line 152.
- **Flaw:** The proposed print CSS hides `#root` unconditionally. The only escape hatch the plan offers is behavioural ("Nếu `viewMode !== 'paged'` → không build"), but not building `#print-root` leaves it empty while `#root` is still hidden by CSS.
- **Failure scenario:** User switches to continuous view (`menu.view.continuousMode`, `apps/docs/src/modules/header/components/MenuBar.tsx`), presses Ctrl+P → `beforeprint` fires, builder bails, `#root` hidden, `#print-root` empty → one blank page. Same for the window between mount and first successful pagination, and for any doc where `editor` is still `null`.
- **Evidence:** phase-04 lines 61-63 (`#root { display: none !important }`), phase-04 line 22 and line 152 (must keep old behaviour when not paged); phase-04 step 7 also removes the `.doc-editor` print rules at `apps/docs/src/assets/styles/styles.css:432-444` that the continuous path depends on.
- **Fix:** Gate on a body/root class toggled by the builder (`document.body.classList.toggle('print-paged', built)`), scope both `#root` and `#print-root` rules under it, and keep the existing `.doc-editor` print rules for the non-paged path.

---

## Finding 2: sliding-window print silently truncates content — `pageCount` undercounts, and `MAX_PAGES` caps it

- **Severity:** Critical
- **Location:** Phase 2 "contentOffsets" + Success Criteria (`contentOffsets.length === breaks.length + 1`); Phase 4 "Cấu trúc DOM" (`lặp pageCount lần`).
- **Flaw:** `pageCount = breaks.length + 1` is not the number of pages the engine actually laid out. Two independent sources of divergence.
  1. `while (y > pageTop + usable) pageTop += paperH + PAGE_GAP;` advances `pageTop` by 1..N pages **without pushing a break**. A block taller than the usable area therefore consumes pages that `breaks` never records.
  2. `if (breaks.length >= MAX_PAGES - 1) return;` stops recording breaks at 50 pages, but the document keeps flowing.
- **Failure scenario:** A doc containing one full-page image or a 3-page-tall table renders 4 pages on screen but `pageCount` reports 2. P4 builds 2 `.print-page` windows at `contentOffsets[0..1]`; everything between `contentOffsets[1] + usable` and the end of the document is clipped by `.print-clip { overflow: hidden }` and is **gone from the PDF**. Today the browser repaginates and prints all of it — so this is a data-loss regression, not just a count mismatch. The same happens to every page past 50.
- **Evidence:** `apps/docs/src/modules/editor/utils/pagination.utils.ts:85` (the `while` with no `breaks.push`), `:63` (`MAX_PAGES` guard), `:95` (`return { breaks, spacers, forced }`), `apps/docs/src/modules/editor/hooks/usePagination.ts:47` (`setPageCount(result.breaks.length + 1)`), `apps/docs/src/modules/editor/components/EditorCanvas.tsx:115-119` (`isOverLimit` warning shows the >50 case is reachable in production). phase-02 line 111 asserts the wrong invariant.
- **Fix:** Derive page count from the final `pageTop` (`pageTop / (paperH + PAGE_GAP) + 1`), emit a `contentOffsets` entry for **every** page including the ones the `while` skips, and make P4 refuse to print (or fall back to browser repagination) when the engine hit `MAX_PAGES`. Add a P4 acceptance case for a >50-page doc and for a single block taller than one page — neither exists today.

---

## Finding 3: the DOM clone loses its style scope — the "line wrap cannot differ" premise is false as specified

- **Severity:** Critical
- **Location:** Phase 4, "Vì sao sliding-window chứ không slice DOM" ("Cùng DOM, cùng width, cùng font, cùng CSS → line wrap **không thể lệch**") and step 3.
- **Flaw:** `view.dom` carries `class="doc-editor ProseMirror"`, but the paged layout comes from the **ancestor-scoped** rule `.is-paged .doc-editor`. Inside `#print-root > .print-page > .print-clip > .print-content` there is no `.is-paged` ancestor, so the clone falls back to the base `.doc-editor` rule. Separately, the existing print block `display: none`s the very spacer elements the plan says the clone will carry over.
- **Failure scenario:** Default margins are 15mm left/right → `mmToPx(15) = 57px`. Screen content width = `794 - 57 - 57 = 680px`. Cloned content width = `794 - 82 - 82 - 2px border = 628px`. Every paragraph rewraps ~8% narrower, gains lines, the clone grows taller than what the engine measured, and each window clips mid-paragraph while the page count no longer matches. On top of that the clone regains `border: 1px solid #c8cacc`, `box-shadow`, `min-height: calc(var(--paper-h) + 48px)`, and forced page-break nodes regain the blue dashed `content: 'Page break'` label (the `.is-paged` rule that hides them does not apply).
- **Evidence:** `apps/docs/src/modules/editor/hooks/useDocsEditor.ts:56` (`editorProps: { attributes: { class: 'doc-editor' } }`), `apps/docs/src/assets/styles/styles.css:155-169` (base `.doc-editor`: `padding: 72px 82px`, `border: 1px`, `min-height`), `:171-179` (`.is-paged .doc-editor` padding = margins), `:181-183` (`.is-paged [data-type='page-break'] { display: none }`), `:333-345` (visible page-break marker), `:401-405` (`@media print` `display:none` for `.page-stack`, `.page-break-marker`, `.page-break-spacer`), `apps/docs/src/types/docs.types.ts:43,46` (default margins + `mmToPx`).
- **Fix:** Wrap each `.print-content` in a `<div class="is-paged">` (or apply `.is-paged` to `#print-root`), explicitly re-declare the `--margin-*`/`--stack-h` vars on the wrapper, and delete/scope the `display:none` rules for `.page-break-spacer`/`.page-break-marker` so they survive inside `#print-root`. Add a P4 acceptance check that asserts `clone.scrollHeight === editor.view.dom.scrollHeight` before building windows — that single assert catches the whole class of bug.

---

## Finding 4: Phase 7's IME/caret mitigation rests on two misread ProseMirror APIs, and decoration positions are never mapped

- **Severity:** High
- **Location:** Phase 7, "Decoration" and Risk Assessment row "Inline widget phá caret / IME tiếng Việt".
- **Flaw (a):** `ignoreSelection` does not mean "ProseMirror bỏ qua khi tính selection". Per the prosemirror-view reference: _"When set (defaults to false), selection changes **inside the widget** are ignored, and don't cause ProseMirror to try and re-sync the selection with its selection state."_ It only matters when the widget DOM contains editable content. Since the plan also sets `contentEditable = 'false'`, `ignoreSelection` is a no-op and contributes **zero** IME protection. The high-severity risk in the plan is therefore unmitigated.
- **Flaw (b):** `view.posAtCoords()` returns `{ pos: number, inside: number } | null`, not a position. Phase 7 line 43 uses the return value directly as the ProseMirror position.
- **Flaw (c):** the plugin's `apply` returns the previous `PageBreaks` verbatim and never maps positions through `tr.mapping`. At block level a stale offset is mostly harmless; at line level it is not.
- **Failure scenario:** User types `dduongwf` mid-paragraph near a page boundary. `runPagination` bails for the whole composition (`editor.view.composing` → reschedule), so the inline spacer stays pinned at its pre-composition absolute position while text shifts right by 1..8 positions. `decorations(state)` re-creates the widget at that stale inline offset every re-render, dropping a `display:block`, `contenteditable=false` `<div>` **inside the active composition range**. Chromium aborts the composition; the user loses the diacritic or the whole syllable. This is exactly the failure the plan's gate (step 10) is meant to catch, but the mitigations listed cannot prevent it.
- **Evidence:** prosemirror-view reference for `Decoration.widget` spec and `posAtCoords` (https://prosemirror.net/docs/ref/); `@tiptap/pm ^3.30.1` at `apps/docs/package.json:36`; `apps/docs/src/modules/editor/utils/pagination.utils.ts:102-105` (`apply` with no `tr.mapping`), `:115-126` (widget construction), `apps/docs/src/modules/editor/hooks/usePagination.ts:33-36` (`composing` bail-out); phase-07 lines 43, 70, 74-75, 141.
- **Fix:** Map `breaks` through `tr.mapping` in `apply` (or drop decorations entirely on any doc-changing tr until the next recompute). Use `posAtCoords(...)?.pos` with a null check. Delete `ignoreSelection` from the mitigation column and replace it with a real one — e.g. suppress inline spacers entirely while `view.composing` is true, and evaluate `relaxedSide` instead.

---

## Finding 5: `print-check.mjs` has no way to get a document into the browser — every criterion that cites it is unverifiable

- **Severity:** High
- **Location:** Phase 1, "Print fidelity check (zero-dep)" step 4 ("Page.navigate → dev server URL với doc fixture") and Success Criteria line 79.
- **Flaw:** Documents live in IndexedDB and are addressed by `/edit/:id`. A freshly spawned headless Chrome uses a throwaway profile with an empty IndexedDB, so `/edit/<anything>` resolves to no doc. The plan specifies no seeding step, no `?fixture=` dev route, and no mechanism to switch paperSize/orientation programmatically.
- **Failure scenario:** The script runs, navigates, reads `window.__pageCount === 1` for an empty editor, prints a 1-page PDF, and reports "khớp". Every downstream gate then passes vacuously: P2 step 9, P4 success criteria (1/3/12/50 pages × 3 papers × 2 orientations), P7 step 15, P8 step 8. The team ships Finding 2's truncation with a green check.
- **Evidence:** `apps/docs/src/App.tsx:8-11` (routes `/` and `/edit/:id` only), `apps/docs/src/services/docs.service.ts:14-22` and `:118` (IndexedDB-backed `DocRecord` hydration), `apps/docs/src/hooks/useDocs.ts:157-161` (`pageSetup` written through `updateDoc`); phase-01 lines 42-46, 73, 79; phase-04 line 141.
- **Fix:** Add an explicit seeding step to Phase 1 — `Runtime.evaluate` that writes a `DocRecord` (content + `pageSetup`) into IndexedDB via the app's own service before `Page.navigate`, or a DEV-only `window.__seedDoc(record)` hook next to `window.__pageCount`. Also make the script wait for pagination to settle (poll `__pageCount` for stability) instead of a fixed delay, and pin fonts locally — `styles.css:1` `@import` pulls Roboto from fonts.googleapis.com, so an offline runner measures different metrics than a developer's machine.

---

## Finding 6: "Clone 1 lần, dùng chung qua CSS" is architecturally impossible; the real cost is N full document copies built synchronously in `beforeprint`

- **Severity:** High
- **Location:** `plan.md` "Rủi ro xuyên suốt" row "Clone DOM 50 trang tốn memory lúc in" (rated **Thấp**), vs Phase 4 step 3.
- **Flaw:** Each `.print-page` needs its own `.print-content` at a different `top`, so one DOM node cannot be shared across pages. Phase 4 step 3 correctly says "một **clone riêng** của `clone`". The plan.md mitigation contradicts its own phase file, and the "Thấp" rating is derived from the impossible mitigation.
- **Failure scenario:** A 50-page document is cloned 50 times — 50× the entire ProseMirror DOM, including every `<img>`, `<table>`, and colgroup — inside a synchronous `beforeprint` handler. The main thread blocks; Chrome's print pipeline may snapshot before layout of the last clones settles; on a modest laptop this is seconds of freeze and hundreds of MB. The Phase 4 risk table's own escape ("nếu >1s cân nhắc `MAX_PAGES` cho print") reintroduces Finding 2's truncation as the fix.
- **Evidence:** `plan.md:99` vs `phase-04.md:133` and `phase-04.md:162`; `MAX_PAGES = 50` at `apps/docs/src/modules/editor/utils/pagination.utils.ts:7`.
- **Fix:** Correct the plan.md row (remove the impossible mitigation, raise severity), and set a hard budget in Phase 4's acceptance criteria: measure `buildPrintRoot` wall time for a 50-page doc with 20 images and fail the phase above a stated threshold. Evaluate the cheaper alternative first — one clone plus `N` `.print-page` elements that each use `clip-path`/`transform` on a shared `position: fixed` layer is not possible either, so if the budget fails the honest fallback is per-page DOM slicing, which must be decided before P7 (P7 assumes P4 needs no change).

---

## Finding 7: `normalizePageSetup` call-site list is factually wrong and misses the real read boundary → `NaN` CSS variables

- **Severity:** Medium
- **Location:** Phase 3, "Normalizer" ("Grep các chỗ đó: `usePagination.ts`, `usePrintSetup.ts`, `EditorCanvas.tsx`, `PageSetupPanel.tsx`") and Related Code Files.
- **Flaw:** `EditorCanvas.tsx` never reads `activeDoc.pageSetup` (it only forwards an `onPageSetupChange` callback), and `PageSetupPanel.tsx` receives `setup` as a prop rather than defaulting it. Meanwhile the actual hydration boundary — `docs.service.ts:20`, where every `DocRecord` coming out of storage gets `pageSetup: doc.pageSetup ?? DEFAULT_PAGE_SETUP()` — is not in the list at all. `usePagination.ts` has three separate default sites, not one. `DocRuler.tsx:78` and `DocVerticalRuler.tsx:43` spread `...pageSetup` when writing margins, so they propagate whatever partial object they were given.
- **Failure scenario:** P5 adds `--header-margin: ${mmToPx(setup.headerMargin)}px` to `pageStyle` (`usePagination.ts:102-114`, an un-normalized site). For any doc stored before P3, `setup.headerMargin` is `undefined` → `mmToPx(undefined)` = `Math.round(NaN)` = `NaN` → `--header-margin: NaNpx` is an invalid declaration and is dropped → `.page-header { top: <unset> }` on a `position: absolute` box resolves to the static position, i.e. y=0 of `.page`, outside the top margin and behind `.doc-editor` (`z-index: 1`). Header text becomes invisible or overlaps body text, and nothing throws.
- **Evidence:** `apps/docs/src/services/docs.service.ts:20`; `apps/docs/src/modules/editor/hooks/usePagination.ts:37,103,117`; `apps/docs/src/modules/editor/components/EditorCanvas.tsx` (no `pageSetup` read — grep returns zero hits); `apps/docs/src/modules/editor/components/PageSetupPanel.tsx:21-27`; `apps/docs/src/components/ruler/DocRuler.tsx:76-80`; `apps/docs/src/components/ruler/DocVerticalRuler.tsx:41-45`; `apps/docs/src/types/docs.types.ts:46`; phase-03 line 85, lines 121-127.
- **Fix:** Normalize once at `docs.service.ts:20` (the storage read boundary) so every consumer receives a complete `PageSetup`, and make `mmToPx` reject non-finite input rather than emitting `NaN`. Correct the file list in phase-03.

---

## Finding 8: header/footer and page numbers are placed entirely inside `aria-hidden="true"` with no accessible alternative

- **Severity:** Medium
- **Location:** Phase 5, "Architecture" step 3 ("Giữ `aria-hidden=\"true\"` ở container") and Non-functional requirements.
- **Flaw:** `.page-stack` is `aria-hidden` because it is purely decorative today (empty `<div class="page">` elements). P5 moves real, user-authored content — header text, footer text, document title, date, page numbers — into that subtree and keeps the attribute. That content then exists nowhere in the accessibility tree: it is not in the ProseMirror document, not in the statusbar (the plan's own open question confirms `Statusbar` only shows word/char count), and not exposed anywhere else.
- **Failure scenario:** A screen-reader user configures a footer via the P6 dialog, applies it, and gets no confirmation that anything happened — the preview line in the dialog is the only accessible surface, and it disappears on close. They also cannot determine the current page or total page count anywhere in the app.
- **Evidence:** `apps/docs/src/modules/editor/components/EditorCanvas.tsx:126-131` (`aria-hidden="true"` container), `:107-112` (`PageScrollIndicator` is the only page-position affordance); phase-05 lines 31-33, 93, 104; `plan.md:112` (open question about Statusbar).
- **Fix:** Keep the visual layer `aria-hidden`, but add one accessible surface — page count / current page in `Statusbar`, and make the P6 dialog's applied values announced via a live region or reflected in an accessible summary. Decide this now rather than leaving it as an open question, because P5 is what creates the regression.

---

## Finding 9: the blank-page mitigation is guesswork, and `--paper-w/h` cannot match `@page size` because they are rounded to whole pixels

- **Severity:** Medium
- **Location:** Phase 4, Risk Assessment row "Trang trắng thừa do rounding subpixel" → `height: calc(var(--paper-h) - 1px)`; `plan.md:96`.
- **Flaw:** `mmToPx` rounds to integer pixels, so `--paper-w/--paper-h` drift from the `@page { size: Xmm Ymm }` box by up to 0.5px per axis, in either direction. Subtracting 1px from height only addresses one of the four ways an extra page appears, and does nothing for the width axis.
- **Failure scenario / empirical result:** I reproduced the extra-page behaviour with headless Chrome + `Page.printToPDF { preferCSSPageSize: true }` on three `.print-page`-shaped divs:
  - `overflow:hidden; position:relative; break-after:page` with `height` exactly equal to the page height → **4 pages** for 3 divs.
  - A4 landscape, `width: 1123px` (= `mmToPx(297)`), `height: 793px` (= `mmToPx(210) - 1`), with a stray `body { margin: 8px }` → **4 pages**. Reducing the width to 1122px did **not** fix it; zeroing the body margin did.
    So the actual trigger in the landscape case is a stray margin in the `#print-root` ancestor chain, not the `-1px`. The plan never specifies `#print-root { margin: 0; padding: 0 }` or `.print-page { margin: 0 }`, and it relies on Tailwind preflight for `body { margin: 0 }` without saying so.
- **Evidence:** `apps/docs/src/types/docs.types.ts:46` (`Math.round`), `:48-53` (`getPaperSizePx`); `apps/docs/src/modules/editor/hooks/usePrintSetup.ts:20` (`@page` written in **mm**, while all layout is in rounded px); `apps/docs/src/assets/styles/styles.css:1-3` (Tailwind preflight is the only thing zeroing `body` margin); phase-04 lines 68, 85, 160.
- **Fix:** Express `.print-page` width/height in the same `mm` unit as `@page size` instead of rounded px, explicitly zero margin/padding on `#print-root` and `.print-page`, and keep `:last-child { break-after: auto }`. Then re-run the page-count check per paper size × orientation — the empirical matrix above shows portrait passing and landscape failing, so a single A4-portrait check is not sufficient evidence.

---

## Verified as correct (do not churn on these)

- `break-after: page` **does** work on a `position: relative; overflow: hidden` block in normal flow under headless Chrome `Page.printToPDF` — 3 divs → 3 pages. `overflow: hidden` makes the box monolithic (no break _inside_), but breaks _between_ siblings are unaffected. `overflow: clip` behaves identically.
- `preferCSSPageSize: true` **does** honor an `@page { size: 210mm 148mm }` rule injected at runtime via a `<style>` appended in a `beforeprint` handler — MediaBox came back `594.96 × 420pt`.
- `beforeprint` **does** fire for CDP `Page.printToPDF`, and DOM built inside that handler **is** included in the PDF. This also confirms the plan's double-build risk empirically: building eagerly _and_ in `beforeprint` produced 6 pages for a 3-page document, so the idempotency guard in phase-04 line 106 is mandatory, not defensive.
- Chrome's PDF output is **not** object-stream compressed (no `/ObjStm`, no `/Type /XRef`), so counting `/Type /Page` in the raw bytes is reliable, and `/Count N` is present as a cross-check.
- `document.fonts.ready` is already used at `apps/docs/src/modules/editor/hooks/usePagination.ts:97-100`; P4's proposed use is consistent with it. Note it is awaited _outside_ `beforeprint` there — P4 must do the same, since a `beforeprint` handler cannot await.
- No custom ProseMirror node views exist in `apps/docs/src` or `packages/`, so `view.dom.cloneNode(true)` will not hit node-view teardown problems. Widget decorations are real DOM children and do clone.

## Unresolved questions

1. If Finding 2's fix requires emitting page entries for over-tall blocks, does P4 ship before P7, or does P7's line-level split become a prerequisite for correct print output?
2. `MAX_PAGES = 50` — with sliding-window print, exceeding it becomes silent content loss rather than a cosmetic cap. Raise it, or hard-block printing above it?
3. i18n `{date}` — P3 proposes a new `Intl.DateTimeFormat` call with `locale: string`, duplicating `packages/i18n/src/formatters.ts:1-24` (`LOCALE_TAGS` maps `vi → vi-VN`, `en → en-US`). Reuse `formatDateTime` with the typed `Locale`, or accept the duplication and the `string` widening?
4. P3's `pages = pageCount + startAt - 1` makes `{pages}` the last displayed number, not the document's page total. Is that the intended semantic for the `tokens.pages` label?
