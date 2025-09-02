## Vocabulary Saving Behavior

- The `VocabularySaveButton` now saves a word immediately on click.
- The modal form (`VocabularySaveModal`) is no longer invoked from the button.
- The save payload includes:
  - `original_word`, `translated_word`
  - `from_language_id`, `translated_language_id`
  - `original_word_context`, `translated_word_context` (nullable)
  - `definition: null`

### TODO

- Add auto-generated `definition` to the save payload once available from the translation pipeline.

### Implementation Notes

- Implementation is in `src/components/vocabulary/VocabularySaveButton.tsx`.
- The save flow uses `useVocabulary().saveVocabularyWord` which handles user checks, toasts, and refresh.
- Saved vocabulary words are highlighted in story text (`InteractiveText`) with a yellow background when the language pair matches.

