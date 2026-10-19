# Amplify tab prototype

HTML prototype for scheduled prompts (AMP-922), the Amplify header and menu, the Chats panel and the V2 homepage concept.
Documented on `docs-site/docs/amplify-tab-design-decisions.html`.

| File | What |
|------|------|
| `src.html` | Page shell, layout CSS and static markup (bowling alley, header). Placeholders are filled by the build. |
| `script.js` | State, sample data, rendering and interactions. |
| `build.py` | Inlines `tokens/css`, the ats-ui component CSS and the icons used into one file. |

Output: `docs-site/prototypes/amplify-tab/index.html` (generated; don't hand-edit or find-and-replace it). `npm run tokens` and the pre-commit hook rebuild it; `npm run prototypes` rebuilds all prototypes.

## Edit and rebuild

```bash
python3 prototypes/amplify-tab/build.py
```

Icons: any icon used in `script.js` must appear as `data-i="name"` or `ic('name'` somewhere in `src.html` / `script.js`, or it won't be inlined. Missing icons are printed by the build.

## URL settings (used by the docs embeds)

`?embed=1` hides the guide · `v=v1|v2` · `page=home|chat|scheduled` · `chat=<id>` · `setup=1` · `ask=<text>` · `fmt=A|B|C` · `chats=1` · `menu=1` · `expand=1` · `cardmenu=<runId>` · `nav=open|collapsed` · `edit=<scheduleId>` · `scroll=top`
