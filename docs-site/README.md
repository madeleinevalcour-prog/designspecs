# Design documentation site

Static site of Novo design documentation, built in the Soft notebook style.
Every page is a self-contained HTML file. `index.html` is the landing page;
individual docs live in `docs/`.

## One-time setup: connect to GitHub and Vercel

You only do this once. After it's done, every push auto-deploys.

1. Create an empty repository on GitHub (no README, so it doesn't conflict).
2. From inside this folder, add the remote and push:

   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git branch -M main
   git push -u origin main
   ```

   (This folder is already a git repository with an initial commit, so there's
   nothing to `git init`.)

3. In Vercel: New Project → Import the repo. It's a plain static site, so leave
   the framework preset as "Other" and the build/output settings empty — Vercel
   serves the files as-is. Deploy.

You'll get a `https://<project>.vercel.app` URL. That's the link you share.

## Adding or updating a doc

1. Add the new page as `docs/<name>.html` (the skill produces this).
2. Add a matching link in `index.html`.
3. Commit and push:

   ```bash
   git add .
   git commit -m "Add <name> documentation"
   git push
   ```

Vercel redeploys automatically on push; the URL updates in a few seconds.

## Notes

- Pages are self-contained and need no build step.
- Keep the Soft notebook style consistent across pages so the site reads as one
  system (see the skill's style spec).
