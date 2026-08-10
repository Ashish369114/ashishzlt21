# Workspace Rules

## Git Feature-Branch Workflow Rule
For any code edits, bug fixes, or feature additions:
1. **Pull Latest `dev`**: Always check out `dev` and pull/fetch the latest code from `company-repo dev` (`origin/dev`).
2. **Create Feature Branch**: Create a dedicated local feature branch (e.g. `feature/...` or `fix/...`) for your latest changes.
3. **Compare & Conflict Check**: Compare the feature branch against company `dev` (`git diff dev <feature-branch>`) and check for any merge conflicts.
4. **Merge & Push**: If there are no conflicts and zero regressions, merge the clean feature branch into `dev` and push to `company-repo dev` (and sync `AAPchanges` as requested).
5. **Track Changes**: Maintain a clear summary of every change made across all commits and files.
