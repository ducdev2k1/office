export type ShellKind = 'docs' | 'sheets' | 'slides';

export interface ProductIdentity {
  kind: ShellKind;
  name: string;
  accentVar: string;
}
