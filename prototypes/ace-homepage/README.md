# Ace Homepage prototype

HTML prototype for the agent-driven Amplify Home (future, with Ace). Split out of the Amplify tab prototype's V2.
Home is the Amplify landing page: greeting, To do, Suggested, Need to know and Today. Chat, Scheduled and the Chats panel are carried over so Home's links work.

| File | What |
|------|------|
| `src.html` | Page shell, layout CSS and static markup (bowling alley, header). Placeholders are filled by the build. |
| `script.js` | State, sample data, rendering and interactions. |
| `build.py` | Inlines `tokens/css`, the ats-ui component CSS and the icons used into one file. |

Output: `docs-site/prototypes/ace-homepage/index.html` (generated; don't hand-edit or find-and-replace it). `npm run tokens` and the pre-commit hook rebuild it; `npm run prototypes` rebuilds all prototypes.

## Edit and rebuild

```bash
python3 prototypes/ace-homepage/build.py
```

Icons: any icon used in `script.js` must appear as `data-i="name"` or `ic('name'` somewhere in `src.html` / `script.js`, or it won't be inlined. Missing icons are printed by the build.

## URL settings

`?embed=1` hides the guide · `page=home|chat|scheduled` · `chat=<id>` · `setup=1` · `ask=<text>` · `fmt=A|B|C` · `chats=1` · `menu=1` · `expand=1` · `cardmenu=<runId>` · `nav=open|collapsed` · `edit=<scheduleId>` · `scroll=top`
