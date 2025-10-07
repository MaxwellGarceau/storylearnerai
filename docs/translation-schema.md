## Translation Schema

This document describes the new normalized schema for storing full-text translations and their tokenized representation.

### Table: `translations`
- **id**: UUID primary key (`gen_random_uuid()`)
- **from_language**: VARCHAR(10) – source language code (e.g., `en`)
- **to_language**: VARCHAR(10) – target language code (e.g., `es`)
- **from_language_id**: INTEGER – FK → `languages(id)`
- **to_language_id**: INTEGER – FK → `languages(id)`
- **original_text**: TEXT – full original text
- **translated_text**: TEXT – full translated text
- **difficulty_level**: VARCHAR(10) – CEFR-like level (e.g., `A1`, `B2`)
- **created_at / updated_at**: TIMESTAMPTZ – managed by trigger `update_updated_at_column()`

Indexes: `created_at`, `from_language`, `to_language`, `difficulty_level`.

### Table: `translation_tokens`
Stores the ordered token sequence for each translation. Order is preserved via `token_index`.

- **id**: UUID primary key
- **translation_id**: UUID FK → `translations(id)` (ON DELETE CASCADE)
- **token_index**: INTEGER – sequence order (0-based recommended)
- **token_type**: VARCHAR(20) – `word`, `punctuation`, or `whitespace`

Word-specific nullable fields:
- **to_word**, **to_lemma**, **from_word**, **from_lemma**: TEXT
- **pos**: VARCHAR(50) – part of speech
- **difficulty**: VARCHAR(10)
- **from_definition**: TEXT – definition for source token when available

Generic token value:
- **token_value**: TEXT – used for non-word tokens (punctuation/whitespace)

Constraints:
- `valid_word_token`: when `token_type = 'word'`, requires `to_word`, `to_lemma`, and `from_word` to be non-null
- `valid_non_word_token`: when `token_type != 'word'`, requires `token_value` to be non-null

Indexes and constraints: `translation_id`, UNIQUE `(translation_id, token_index)` to enforce 1:1 index per translation, `to_lemma` (partial where not null).

### Notes
- The previous `saved_translations` table is replaced by `translations`.
- `vocabulary.translation_id` now references `translations(id)`.
- Dropping and resetting the DB will apply these migrations in order.

