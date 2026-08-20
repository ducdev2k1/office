export interface OoxmlPackage {
  parts: Map<string, Uint8Array>;
  partOrder: string[];
}

export interface OoxmlPartEntry {
  path: string;
  data: Uint8Array;
}
