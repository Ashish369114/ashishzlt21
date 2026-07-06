# Changelog

## 2026-07-06
- Fix: Renamed embedded `settings` field on the `School` model to `schoolSettings` to avoid conflict with standalone `Settings` model.
- Fix: Created missing `Settings` documents for existing schools during testing to ensure API returns distinct settings per school.
- Test: Ran backend unit tests — all tests passed.

Notes: If any client code relies on an embedded `settings` property on School documents, update payloads to use `schoolSettings` or use the separate `/api/settings/:schoolId` endpoints instead.
