## Translation Flow

### Overview

The translation flow supports selecting both a from language (source) and a to language (target). The UI and services are generalized to use these selections end-to-end.

### UI Components

- Translate Page (`src/pages/TranslatePage.tsx`) renders `StoryContainer` and the sidebar.
- `StoryContainer` manages translation form state and submits requests to `translationService.translate`.
- `FullPageStoryInput` displays the full-page input and opens `OptionsModal` for settings.
- `OptionsModal` includes:
  - Source language selector (fromLanguage)
  - Target language selector (toLanguage)
  - Difficulty selector
  - Vocabulary selection filtered by the current language pair
- `LanguageSelector` lists available languages from `useLanguages()` and is used for both from/to via a configurable label.

### Defaults

- `fromLanguage` now defaults to the signed-in user's `native_language` from their profile (via `UserService.getOrCreateUser`).
- If the user profile is unavailable or not loaded yet, the fallback remains `'es'` (Spanish).
- `language` (toLanguage) defaults to `'en'` and difficulty defaults to `'a1'`.

### Language Data

- `useLanguages()` loads languages from the database and provides helpers:
  - `getLanguageName(code)` returns display name by code
  - `getLanguageCode(name)` maps human names to codes
  - `getLanguageIdByCode(code)` gets DB id for a language

### Service Layer

- `translationService.translate` accepts a `TranslationRequest` containing:
  - `text`, `fromLanguage`, `toLanguage`, `difficulty`, optional `selectedVocabulary`
- It builds prompts via `generalPromptConfigService`, which uses:
  - Language and difficulty settings for target-language guidance
  - Native-to-target (from→to) guidance when available

### Vocabulary Handling

- Vocabulary selection is filtered for the current language pair (`fromLanguage` → `toLanguage`).
- The service validates inclusion of selected target-language words in the target-language translation.

### Story Reader

- `StoryReaderPage` uses the language codes in `TranslationResponse` and displays human-readable names via `useLanguages().getLanguageName`.
- Save actions pass human-readable language names which are converted back to codes via `getLanguageCode`.

### Notes

- Current supported codes: `en`, `es` (see `src/types/llm/prompts.ts`).
- Copy in i18n resources that explicitly mentions English is preserved; UI labels and data flow use the dynamic from/to selections.
