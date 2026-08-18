export type FileKind = 'docs' | 'sheets' | 'slides';

export interface FileRecord {
  id: string;
  title: string;
  kind: FileKind;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  starred: boolean;
  deletedAt: string | null;
}

export interface TemplateDef {
  id: string;
  label: string;
}

export interface ProductConfig {
  kind: FileKind;
  name: string;
  createLabel: string;
  startLabel: string;
  blankLabel: string;
  editorPath: (id: string) => string;
  accentVar: string;
  templates: TemplateDef[];
}

export type FileSort = 'lastOpened' | 'updated' | 'name';

export type FileView = 'list' | 'grid';

export type FileTab = 'recent' | 'starred' | 'trash';

export interface FileHomeActions {
  onCreate: () => void;
  /** Mo file (vd .docx) tu may len web de edit — tuy chon theo tung product. */
  onOpenFromDevice?: (file: File) => Promise<void> | void;
  onOpen: (id: string) => void;
  onStar: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
}
