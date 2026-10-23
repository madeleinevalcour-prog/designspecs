import os, re, base64, glob, urllib.parse
# Builds the Company Prospect tab mockup into docs-site/prototypes/company-prospect/index.html.
# Run from anywhere:  python3 prototypes/company-prospect/build.py
# Inlines the token CSS, the ats-ui component CSS and the Novo icons used, so the output is one file.
HERE=os.path.dirname(os.path.abspath(__file__))
R=os.path.abspath(os.path.join(HERE,"..",".."))
OUT=HERE
tok="".join(open(f"{R}/tokens/css/{n}.css").read() for n in ["primitives","semantic","components","typography","elevation"])
lib=f"{R}/components/projects/ats-ui/src/lib"
want=["icon/icon.css","button/button.css","icon-container/icon-container.css","novo-chip/novo-chip.css","search-input/search-input.css",
 "bowling-alley/bowling-alley-shell.css","bowling-alley/bowling-alley.css","bowling-alley/tooltip.css","card/card.css","record-header/record-header.css","novo-data-table/novo-data-table.css","novo-list/novo-list.css","amplify-chat/cards/chat-list-item.css","checkbox/checkbox.css","amplify-chat/selection/selection-bar.css"]
comp="".join(f"\n/* ==== {w} ==== */\n"+open(f"{lib}/{w}").read() for w in want if os.path.exists(f"{lib}/{w}"))
src=open(f"{OUT}/src.html").read().replace("/*PAGE_CSS*/",open(f"{OUT}/page.css").read()).replace("/*SCRIPT*/",open(f"{OUT}/script.js").read())
used=sorted(set(re.findall(r'data-i="([a-z0-9-]+)"',src))|set(re.findall(r"ic\('([a-z0-9-]+)'",src)))
icd=f"{lib}/../../assets/icons"
css=[]
for n in used:
    p=f"{icd}/{n}.svg"
    if not os.path.exists(p): print("MISSING ICON",n); continue
    d="data:image/svg+xml;base64,"+base64.b64encode(open(p,"rb").read()).decode()
    css.append(f'[data-i="{n}"]{{--ats-icon:url("{d}")}}')
html=src.replace("/*TOKENS*/",tok).replace("/*COMPONENTS*/",comp).replace("/*ICONS*/","\n".join(css))
os.makedirs(f"{R}/docs-site/prototypes/company-prospect",exist_ok=True)
open(f"{R}/docs-site/prototypes/company-prospect/index.html","w").write(html)
print("ok",len(html),"icons",len(used))
