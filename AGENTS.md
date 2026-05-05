# Translation Guidelines

- All user-facing text MUST be wrapped in the `t()` function from `react-i18next`.
- The application supports three languages: English (`en`), French (`fr`), and Arabic (`ar`).
- When adding new content, add the corresponding translation keys to `src/i18n.ts` for all three languages.
- For API-fetched content (like news, sports, stations), if the API does not provide multi-language support, attempt to map the data to translation keys if possible, or store multi-language data in the database.
- Never leave hardcoded strings in the UI.

# Strict User-Defined Rules
- NEVER modify any code without explicit, granular user approval for each specific change.
- NEVER modify any Firestore rules without explicit, granular user approval for each specific change.
- These rules are persistent for this project.
- DO NOT remove match times from the fixture list. Match times must always be displayed in fixtures. Changes to UI or data representation (like showing 'FT' instead of time) should ONLY apply to results or other specific views as explicitly requested.
