# Phase 3: Find & Replace (ProseMirror decorations)

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 3h
- Muc tiet: tim kiem + thay the trong editor bang ProseMirror Plugin + Decorations (pattern chuan cua community, khong dung extension tra phi). UI: thanh Ctrl+H (giong gg docs), nut Prev/Next/Replace/Replace all.

## Requirements

1. Plugin `searchReplace` dang ky trong `extensions` (dung `Extension.create` + `addProseMirrorPlugins`).
2. Highlight TAT CA match (Decoration.inline, class `search-match`) + match dang active (class `search-match-active`).
3. Dieu huong Prev/Next qua TextSelection; wrap-around.
4. Replace match hien tai, Replace all (chi thay the trong text node, khong pha mark).
5. Ctrl+H mo/dong bar, focus input find; Esc dong bar.
6. Count hien thi: "x/y matches".
7. Khong lam hong undo: replace dung `view.dispatch(tr)` — undo/redo van hoat dong.

## Architecture

- File: `/home/duc-lta/my-project/office/plans/260816-editor-basics/phase-03-find-replace.md` (file nay) — code se dat o `src/editor/extensions/search-replace.ts` (tao o Phase 6 khi modularize; o Phase 3 code tam trong App.tsx hoac tao file luon — **khuyen nghi tao file luon** de giam viec di chuyen sau).
- State plugin: `PluginKey<SearchState>("searchReplace")` giu `{ query, matches: [{from,to}], index }`.
- DecorationSet tao lai moi khi doc thay doi (debounce 150ms) hoac query doi.
- Tim kiem: duyet `state.doc.descendants`, gop text cua text nodes lien ke trong cung block (vi marks co the cat text node), dung `textContent.toLowerCase().indexOf(query)`.

## Related Code Files

- `/home/duc-lta/my-project/office/apps/web/src/editor/extensions/search-replace.ts` — **create** (hoac tam trong App.tsx).
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: dang ky extension, render FindReplaceBar, Ctrl+H handler.
- `/home/duc-lta/my-project/office/apps/web/src/styles.css` — **modify**: styles `.search-match`, `.search-match-active`, `.find-replace-bar`.

## Implementation Steps

1. **Cau truc extension**:
   ```ts
   export const searchReplace = Extension.create({
     name: 'searchReplace',
     addProseMirrorPlugins() {
       return [searchReplacePlugin]; // Plugin voi state + decorations
     },
   });
   ```
2. **Plugin core**:
   ```ts
   const key = new PluginKey<SearchState>("searchReplace");
   const searchReplacePlugin = new Plugin({
     key,
     state: { init: () => ({ query: "", matches: [], index: 0 }), apply(tr, value) { ... } },
     props: {
       decorations(state) {
         const { matches, index } = key.getState(state);
         if (!matches.length) return null;
         const decos = matches.map((m, i) =>
           Decoration.inline(m.from, m.to, { class: i === index ? "search-match-active" : "search-match" })
         );
         return DecorationSet.create(state.doc, decos);
       },
     },
   });
   ```
   `apply`: neu `tr.getMeta("searchQuery")` → tinh lai matches bang `computeMatches(doc, query)`; neu doc thay doi (docChanged) → recalc index an toan (clamp, giu gan vi tri con tro).
3. **computeMatches** — duyet block theo block de noi text nodes:
   ```ts
   const computeMatches = (doc, query) => {
     if (!query) return [];
     const matches = [];
     doc.descendants((node, pos) => {
       if (!node.isTextblock) return; // chi duyet top-level text blocks
       const text = node.textContent.toLowerCase();
       let from = 0;
       while ((from = text.indexOf(query, from)) !== -1) {
         matches.push({
           from: pos + 1 + from,
           to: pos + 1 + from + query.length,
         });
         from += query.length;
       }
     });
     return matches;
   };
   ```
   (pos+1 vi child offset cua textblock bat dau sau node start.)
4. **Commands** (qua editor.chain): `setQuery(query)` → `view.dispatch(view.state.tr.setMeta("searchQuery", query))`; `nextMatch()` / `prevMatch()` → cap nhat index + `tr.setSelection(TextSelection.create(doc, from, to))` + `view.dispatch(scrollIntoView)`; `replaceCurrent(replacement)` → `tr.insertText(replacement, from, to)`; `replaceAll(replacement)` → insertText nguoc tu cuoi len dau (trach offset dich).
5. **UI FindReplaceBar** (component nho, tam trong App.tsx): input Find + input Replace + buttons Prev/Next/Replace/ReplaceAll + count badge + nut dong (Esc). State React: `findOpen`, `query`, `replacement`.
6. **Ctrl+H**: `window.addEventListener("keydown")` o App useEffect (vi la global shortcut, khong nam trong editor keyboardShortcuts de khong chan khi blur):
   ```ts
   const onKey = (e: KeyboardEvent) => {
     if (e.ctrlKey && e.key.toLowerCase() === 'h') {
       e.preventDefault();
       setFindOpen((v) => !v);
     }
   };
   ```
   Khi bar mo, focus input Find (ref).
7. **CSS**: `.search-match { background: #fbbc04; border-radius: 2px; }`, `.search-match-active { background: #ea4335; color: #fff; }`; bar style giong gg docs (float phai tren, shadow).

## Todo List

- [ ] Tao search-replace extension (Plugin + PluginKey + DecorationSet)
- [ ] computeMatches (duyet textblock, noi text nodes)
- [ ] Commands: setQuery, next/prev, replaceCurrent, replaceAll
- [ ] FindReplaceBar UI + count x/y
- [ ] Ctrl+H toggle + Esc dong + focus find input
- [ ] CSS highlight + bar
- [ ] Test: tim nhieu match, wrap-around, replace all khong pha marks, undo sau replace

## Success Criteria

- Highlight dung moi match, active match noi bat khac mau.
- Prev/Next wrap-around, con tro cuon vao match.
- Replace all thay dung so lan, undo tra ve trang thai cu.
- Ctrl+H mo/dong nhanh, khong chan Ctrl+F cua browser.

## Risk Assessment

| Risk                                             | Mitigation                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Decoration position sai khi marks cat text nodes | Gop textContent theo block truoc khi indexOf, tinh offset tu pos+1 |
| Replace all offset dich                          | Duyet nguoc tu cuoi doc                                            |
| Perf khi doc lon                                 | Debounce recompute 150ms; MVP doc < 50 trang                       |

## Next Steps

- Phase 4 (page setup + page break) — doc lap, co the song song.
