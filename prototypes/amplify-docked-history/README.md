# Docked chat history prototype

HTML prototype for docked chat parity with global chat: chat history (how it opens, what it shows), the chat name in the header, New chat, the docked starting point and the docked prompt library. Sits on the shell candidate record (`prototypes/_shared/candidate_record.py`).
Documented on `docs-site/docs/amplify-docked-chat-parity-design-decisions.html`.

| File | What |
|------|------|
| `src.html` | Page shell and prototype-layer CSS. `<!--CANDIDATE_RECORD-->` is replaced by the shell candidate record. |
| `script.js` | State, sample data, rendering and interactions. |
| `build.py` | Inlines `tokens/css`, the ats-ui component CSS, the candidate record and the icons used into one file. |

Output: `docs-site/prototypes/amplify-docked-history/index.html` (generated; don't hand-edit it).

## Edit and rebuild

```bash
python3 prototypes/amplify-docked-history/build.py
```

## URL settings (used by the docs embeds)

`?embed=1` hides the guide · `trigger=name|clock` · `type=record|record-link|full` · `menu=1` opens chat history · `chat=<id>` · `lib=1` opens the prompt library · `rec=cand|job`
