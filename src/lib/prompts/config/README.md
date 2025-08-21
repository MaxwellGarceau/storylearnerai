# Folder structure

- `general.json` contains general instructions used on every prompt
- `template.json` contains the prompt template with placeholders
- `to-language.json` contains the baseline rules when translating TO a language
  Ex: Spanish TO English would use the "en" key in `to-language.json`
- `native-to-target/` contains customization dependent on 1) what the user's native language is and 2) what language they are translating TO
  Ex: `/native-to-target/spanish/en.json` equates to "the user is a native Spanish speaker and we're fetching native language specific prompts for when they are translating FROM Spanish TO English".
  - `/native-to-target/spanish` is the native language of the user. The `en.json` file contains rules to use when they are translating from Spanish to English.
