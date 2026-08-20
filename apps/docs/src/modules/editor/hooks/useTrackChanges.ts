import { useMemo, useState } from 'react';
import type { TrackSuggestion, SuggestionStore } from '@office/tiptap-extensions';

export const useTrackChanges = (suggestionStore: SuggestionStore, suggestions: TrackSuggestion[]) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  const pendingSuggestions = useMemo(
    () => suggestions.filter((s) => s.status === 'pending'),
    [suggestions],
  );

  const selectedSuggestion = useMemo(
    () => (selectedSuggestionId ? suggestionStore.getSuggestion(selectedSuggestionId) : null),
    [selectedSuggestionId, suggestions, suggestionStore],
  );

  const handleSelectSuggestion = (suggestionId: string) => {
    setSelectedSuggestionId(suggestionId);
  };

  const handleAcceptSuggestion = (sugId: string) => {
    suggestionStore.acceptSuggestion(sugId);
    setSelectedSuggestionId(null);
  };

  const handleRejectSuggestion = (sugId: string) => {
    suggestionStore.rejectSuggestion(sugId);
    setSelectedSuggestionId(null);
  };

  const handleSelectNextSuggestion = () => {
    if (pendingSuggestions.length === 0) return;
    const currentIndex = pendingSuggestions.findIndex((s) => s.id === selectedSuggestionId);
    const next = pendingSuggestions[(currentIndex + 1) % pendingSuggestions.length];
    if (next) setSelectedSuggestionId(next.id);
  };

  const handleSelectPrevSuggestion = () => {
    if (pendingSuggestions.length === 0) return;
    const currentIndex = pendingSuggestions.findIndex((s) => s.id === selectedSuggestionId);
    const prev =
      pendingSuggestions[(currentIndex - 1 + pendingSuggestions.length) % pendingSuggestions.length];
    if (prev) setSelectedSuggestionId(prev.id);
  };

  return {
    isSuggesting,
    setIsSuggesting,
    selectedSuggestion,
    selectedSuggestionId,
    setSelectedSuggestionId,
    pendingSuggestions,
    handleSelectSuggestion,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleSelectNextSuggestion,
    handleSelectPrevSuggestion,
  };
};
