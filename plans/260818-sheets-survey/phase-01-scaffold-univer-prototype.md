# Phase 1: Scaffold `apps/sheets` + Univer prototype

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 8h
- Muc tieu: tao `apps/sheets` tu trong, cai Univer v0.23 OSS, nhung vao app-shell, xac nhan co the chay workbook thanh cong. Day la nen tang cho toan bo khao sat.

## Requirements

1. Scaffold `apps/sheets` giong `apps/docs`: Vite + React 19 + TypeScript + Tailwind CSS v4.
2. Dung path alias `@/*` (apps/sheets/src/*), tuan thu AGENTS.md: arrow function, const, ES7+.
3. Cai Univer v0.23.0: `@univerjs/core`, `@univerjs/sheets`, `@univerjs/sheets-ui`, `@univerjs/ui`, `@univerjs/engine-rendering` + presets.
4. Nhung `apps/sheets` vao `app-shell` (ShellLayout + TopBar + ProductSwitcher).
5. Tich hop `@office/i18n` cho text giao dien.
6. Khoi tao Univer instance: `createUniver()` voi `UniverSheetsCorePreset` + `UniverSheetsUIPreset` — hien workbook mau tren man hinh.
7. `pnpm --filter @office/sheets typecheck && pnpm --filter @office/sheets build` pass.

## Architecture

```text
apps/sheets/src/
├── main.tsx                    # React entry: render <App />
├── App.tsx                     # ShellLayout + <SheetEditor />
├── components/
│   └── SheetEditor.tsx         # Univer canvas + lifecycle
├── hooks/
│   └── useUniver.ts            # khoi tao/unmount Univer instance
├── services/
│   └── univer-theme.service.ts # theme iNET co ban
├── types/
│   └── sheets.types.ts         # wrapper types
├── assets/
│   └── styles.css              # tokens import, Univer CSS overrides
└── vite-env.d.ts
```

**Univer init pattern** (theo docs v0.23):

```ts
import { LocaleType, mergeLocales } from '@univerjs/core';
import { createUniver, UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import { UniverSheetsUIPreset } from '@univerjs/preset-sheets-ui';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locale/en-US';
import UniverPresetSheetsUIEnUS from '@univerjs/preset-sheets-ui/locale/en-US';

const { univerAPI } = createUniver({
  locale: LocaleType.En_US,
  locales: mergeLocales(UniverPresetSheetsCoreEnUS, UniverPresetSheetsUIEnUS),
  presets: [UniverSheetsCorePreset(), UniverSheetsUIPreset()],
});
```

**useUniver hook**:

```ts
export const useUniver = (containerRef: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;
    const { univerAPI } = createUniver({ ... });
    // mount vao container
    return () => univerAPI.__getInjector().get(Univer).dispose();
  }, []);
};
```

## Related Code Files

- `apps/docs/` — mau scaffold, package.json patterns, vite.config.ts.
- `packages/app-shell/src/ShellLayout.tsx` — dung cho layout chung.
- `packages/i18n/` — dung `useTranslation('sheets')`.
- `packages/ui-kit/` — dung `cn()` helper + tokens.

## Implementation Steps

1. **Tao apps/sheets tu trong**:
   - Copy `apps/docs/package.json` lam template, doi ten thanh `@office/sheets`, bo het tiptap deps.
   - Tao `tsconfig.json` giong apps/docs (extends `../tsconfig.base.json`).
   - Tao `vite.config.ts` giong apps/docs.
   - Tao `src/main.tsx`, `src/App.tsx` co ban.

2. **Cai Univer packages** (trong `apps/sheets/`):

   ```bash
   pnpm add @univerjs/core@0.23.0 @univerjs/sheets@0.23.0 @univerjs/sheets-ui@0.23.0 @univerjs/ui@0.23.0 @univerjs/engine-rendering@0.23.0
   pnpm add @univerjs/preset-sheets-core@0.23.0 @univerjs/preset-sheets-ui@0.23.0
   ```

   Luu y: tat ca phai cung version 0.23.0, khong duoc mixed.

3. **Tao `components/SheetEditor.tsx`**: mount Univer canvas vao `div ref`, lay `univerAPI` tu hook.

4. **Tao `hooks/useUniver.ts`**: khoi tao instance, cleanup on unmount.

5. **Nhung app-shell**: App.tsx render `<ShellLayout><SheetEditor /></ShellLayout>`.

6. **Add `@office/sheets` vao pnpm-workspace.yaml** (neu chua co).

7. **Verify**: `pnpm --filter @office/sheets typecheck && pnpm --filter @office/sheets build` pass.

8. **Smoke test**: `pnpm --filter @office/sheets dev` — kiem tra workbook hien tren man hinh, co the nhap data vao cell.
