## Vocabulary Saving Behavior

## Vocabulary upsert modal consolidation

- The save and edit flows now share a single UI component: `VocabularyUpsertModal`.
- `VocabularySaveModal` and `VocabularyEditModal` are thin wrappers around this unified component to preserve existing imports/usages.
- Create mode (`mode="create"`) supports language selection and duplicate checks via `checkVocabularyExists`.
- Edit mode (`mode="edit"`) displays read-only language info and updates the word via `updateVocabularyWord`.
- Localization keys are reused; no user-facing text changes were introduced.

### Native dropdowns

- Language, part of speech, and frequency fields now use native `<select>` elements for a standard dropdown experience (no slide-in menus).

### Wrapper usage examples

```tsx
// Save (create) wrapper
<VocabularySaveModal
  onClose={onClose}
  currentLanguageId={currentLanguageId}
  currentFromLanguageId={currentFromLanguageId}
  initialData={initialData}
  onSaveSuccess={onSaveSuccess}
/>
```

```tsx
// Edit wrapper
<VocabularyEditModal
  vocabulary={vocabulary}
  onClose={onClose}
  onSaveSuccess={onSaveSuccess}
/>
```

- `from_word`, `target_word`
- `from_language_id`, `target_language_id`
- `from_word_context`, `target_word_context` (nullable)
- `definition: null`

### Saving Indicator and Pending Translation

- On click, if the translation is not yet available, the button switches to a localized "Saving..." state with a spinner and waits for the translation to arrive.
- As soon as `targetWord` is provided (e.g., after `onBeforeOpen` triggers translation), the save proceeds automatically.
- When saved, the button shows a disabled "Saved" state.

### TODO

- Add auto-generated `definition` to the save payload once available from the translation pipeline.

### Implementation Notes

- Implementation is in `src/components/vocabulary/buttons/VocabularySaveButton.tsx`.
- The save flow uses `useVocabulary().saveVocabularyWord` which handles user checks, toasts, and refresh.

### Saved Translation Linking

- When a user saves a word while reading a saved story, the `saved_translation_id` of that story is persisted with the vocabulary record.
- The ID is threaded via navigation state from the sidebar, through `StoryReaderPage` → `StoryRender` → `StoryContent` → `InteractiveText`, and exposed on the `InteractiveTextContext` as `savedTranslationId`.
- `WordMenu` reads `savedTranslationId` from context and passes it to `VocabularySaveButton`, which includes it in the `VocabularyInsert` payload as `saved_translation_id`.
- This enables querying vocabulary by the story it came from and keeping provenance.
- Saved vocabulary words are highlighted in story text (`InteractiveText`) with a yellow background when the language pair matches.

### Localization

- New keys added:
  - `vocabulary.saving` (en: "Saving...", es: "Guardando...")
