# Company Prospect tab mockup

HTML mockup of the Company record's Prospect tab, restyled in Modern UI. Static, sample data only.

| File | What |
|------|------|
| `src.html` | Page shell and bowling alley markup. Placeholders are filled by the build. |
| `page.css` | Prototype layer: page layout and the Prospect cards (not in ats-ui yet). Tokens only. |
| `script.js` | Sample data, rendering, bowling alley collapse, header tab overflow. |
| `build.py` | Inlines `tokens/css`, the ats-ui component CSS and the icons used into one file. |

Output: `docs-site/prototypes/company-prospect/index.html` (generated; don't hand-edit).

```bash
python3 prototypes/company-prospect/build.py
```

Real ats-ui components: bowling alley, record header, button, icon container, novo-chip, search input (pill), card, novo-data-table, novo-list item (+ item-header, item-data, link-text), AmplifyChatChatListItem `prospect-contact` (+ relevance-signals), checkbox, card footer.
Prototype-only: intel tiles, coverage stats, job-row layout wrapper, avatar overlap, job slideout shell (same pattern as the amplify-preview prototype).
The first job row (Senior Project Manager) opens the job slideout; close with the × or Escape.

URL settings: `nav=collapsed` · `job=1` (open the slideout) · `sel=1` (preselect the two strong-match contacts, which shows the Add to outreach bar)
