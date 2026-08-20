export { SuggestionPlugin, suggestionPluginKey, type SuggestionItem, type SuggestionOptions, type SuggestionRenderState, type SuggestionState } from './suggestion.plugin';
export {
  anchorToIndex,
  anchorToRelativePos,
  createAnchorFromTypeIndex,
  decodeAnchor,
  encodeAnchor,
  indexToAnchor,
  relativePosToAnchor,
  relativePosToIndex,
  type YjsAnchor,
} from './yjs-anchor.utils';
export {
  getNodeRect,
  getSelectionRect,
  mountPopup,
  type PopupController,
  type PopupOptions,
} from './popup.utils';
export {
  applyUpdateToDoc,
  computeDelta,
  decodeState,
  encodeSnapshot,
  encodeState,
  isStateChanged,
  mergeUpdates,
  snapshotToUpdate,
} from './yjs-snapshot.utils';
export { escapeHtml } from './html.utils';