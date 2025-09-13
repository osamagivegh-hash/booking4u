@echo off
set GIT_PAGER=
git commit -m "Remove BackendStatus component to eliminate automatic 30-second refresh"
git push origin main
echo Changes pushed successfully!
