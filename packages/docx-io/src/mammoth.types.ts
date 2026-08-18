export interface MammothConvertInput {
  arrayBuffer: ArrayBuffer;
}

export interface MammothConvertResult {
  value: string;
  messages: unknown[];
}

export interface MammothApi {
  convertToHtml: (input: MammothConvertInput) => Promise<MammothConvertResult>;
  extractRawText: (input: MammothConvertInput) => Promise<MammothConvertResult>;
}
