# Workspace Rules

## Git Feature-Branch Workflow Rule
From now on, for any code edits or feature additions:
1. **Pull Latest `dev`**: Always check out `dev` and pull latest `company-repo dev`.
2. **Create Feature Branch**: Create a dedicated local feature branch (e.g. `feature/...` or `fix/...`).
3. **Compare & Verify**: Compare feature branch against `dev` (`git diff dev <feature-branch>`) and verify zero unintended regressions.
4. **Merge & Push**: Merge the clean feature branch into `dev` and push to `company-repo dev` (and sync `AAPchanges` as requested).
