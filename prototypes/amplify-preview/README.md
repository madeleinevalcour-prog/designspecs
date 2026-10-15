# Amplify chat + candidate preview prototype

HTML prototype for the conflict between the docked Amplify chat and the candidate preview slideout.
Documented on `docs-site/docs/amplify-preview-design-decisions.html`.

| File | What |
|------|------|
| `src.html` | Page shell, prototype-layer CSS and static markup (bowling alley, workspace row). Placeholders are filled by the build. |
| `script.js` | State, sample data, rendering and interactions for each option. |
| `build.py` | Inlines `tokens/css`, the ats-ui component CSS and the icons used into one file. |

Output: `docs-site/prototypes/amplify-preview/index.html` (generated; don't hand-edit).

## Edit and rebuild

```bash
python3 prototypes/amplify-preview/build.py
```

Icons: any icon used in `script.js` must appear as `data-i="name"` or `ic('name'` somewhere in `src.html` / `script.js`, or it won't be inlined.

## URL settings (used by the docs embeds)

`?embed=1` hides the guide · `opt=current|1|2a|2b` · `preview=<row index>` · `nav=open|collapsed` · `chat=closed` · `mode=pop-over`
