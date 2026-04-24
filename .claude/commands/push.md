Stage all modified tracked files, commit with a summary of recent changes, and push to GitHub origin/main.

Steps:
1. Run `git status` and `git diff --stat` to see what changed
2. Run `git log --oneline -5` to match the existing commit message style
3. Stage changed files with `git add` (specific files only — never `git add -A` blindly; skip .env and any secrets)
4. Write a concise commit message summarising what changed (1–2 sentences, imperative mood). End every commit message with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
5. Commit and push to origin main
6. Confirm the push succeeded and print the short commit SHA
