import { Extension } from '@tiptap/core';

export interface IndentOptions {
  types: string[];
  defaultFirstLineIndent: number;
  defaultLeftIndent: number;
  defaultRightIndent: number;
  minIndent: number;
  maxIndent: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Set first line indent in millimeters
       */
      setFirstLineIndent: (indentMm: number) => ReturnType;
      /**
       * Set left indent in millimeters
       */
      setLeftIndent: (indentMm: number) => ReturnType;
      /**
       * Set right indent in millimeters
       */
      setRightIndent: (indentMm: number) => ReturnType;
      /**
       * Set all indents at once
       */
      setIndents: (indents: {
        firstLineIndent?: number;
        leftIndent?: number;
        rightIndent?: number;
      }) => ReturnType;
      /**
       * Reset indents to 0
       */
      resetIndents: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      defaultFirstLineIndent: 0,
      defaultLeftIndent: 0,
      defaultRightIndent: 0,
      minIndent: -50,
      maxIndent: 150,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          firstLineIndent: {
            default: this.options.defaultFirstLineIndent,
            parseHTML: (element) => {
              const style = element.style.textIndent;
              if (!style) return 0;
              const match = style.match(/([-\d.]+)mm/);
              return match?.[1] ? parseFloat(match[1]) : 0;
            },
            renderHTML: (attributes) => {
              const val = attributes.firstLineIndent;
              if (!val || val === 0) return {};
              return {
                style: `text-indent: ${val}mm;`,
              };
            },
          },
          leftIndent: {
            default: this.options.defaultLeftIndent,
            parseHTML: (element) => {
              const style = element.style.marginLeft || element.style.paddingLeft;
              if (!style) return 0;
              const match = style.match(/([-\d.]+)mm/);
              return match?.[1] ? parseFloat(match[1]) : 0;
            },
            renderHTML: (attributes) => {
              const val = attributes.leftIndent;
              if (!val || val === 0) return {};
              return {
                style: `margin-left: ${val}mm;`,
              };
            },
          },
          rightIndent: {
            default: this.options.defaultRightIndent,
            parseHTML: (element) => {
              const style = element.style.marginRight || element.style.paddingRight;
              if (!style) return 0;
              const match = style.match(/([-\d.]+)mm/);
              return match?.[1] ? parseFloat(match[1]) : 0;
            },
            renderHTML: (attributes) => {
              const val = attributes.rightIndent;
              if (!val || val === 0) return {};
              return {
                style: `margin-right: ${val}mm;`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFirstLineIndent:
        (indentMm: number) =>
        ({ commands }) => {
          return this.options.types.some((type) =>
            commands.updateAttributes(type, { firstLineIndent: indentMm }),
          );
        },
      setLeftIndent:
        (indentMm: number) =>
        ({ commands }) => {
          return this.options.types.some((type) =>
            commands.updateAttributes(type, { leftIndent: indentMm }),
          );
        },
      setRightIndent:
        (indentMm: number) =>
        ({ commands }) => {
          return this.options.types.some((type) =>
            commands.updateAttributes(type, { rightIndent: indentMm }),
          );
        },
      setIndents:
        (indents) =>
        ({ commands }) => {
          return this.options.types.some((type) => commands.updateAttributes(type, indents));
        },
      resetIndents:
        () =>
        ({ commands }) => {
          return this.options.types.some((type) =>
            commands.updateAttributes(type, {
              firstLineIndent: 0,
              leftIndent: 0,
              rightIndent: 0,
            }),
          );
        },
    };
  },
});
