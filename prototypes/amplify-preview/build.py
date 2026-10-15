import os, re, base64, glob, urllib.parse
# Builds the Amplify chat + candidate preview prototype into docs-site/prototypes/amplify-preview/index.html.
# Run from anywhere:  python3 prototypes/amplify-preview/build.py
# Inlines the token CSS, the ats-ui component CSS and the Novo icons used, so the output is one file.
HERE=os.path.dirname(os.path.abspath(__file__))
R=os.path.abspath(os.path.join(HERE,"..",".."))
OUT=HERE
tok="".join(open(f"{R}/tokens/css/{n}.css").read() for n in ["primitives","semantic","components","typography","elevation"])
lib=f"{R}/components/projects/ats-ui/src/lib"
want=["icon/icon.css","button/button.css","icon-container/icon-container.css","icon-button-no-container/icon-button-no-container.css",
 "novo-chip/novo-chip.css","search-input/search-input.css","menu/dropdown-card.css","menu/menu-option.css",
 "bowling-alley/bowling-alley-shell.css","bowling-alley/bowling-alley.css","bowling-alley/tooltip.css",
 "amplify-chat/docked/conversation.css","amplify-chat/reply/chat-block.css","amplify-chat/reply/user-turn.css",
 "amplify-chat/user-messages/user-bubble.css","amplify-chat/text/text.css","amplify-chat/text/link.css",
 "amplify-chat/input/amplify-chat-container.css","amplify-chat/input/chat-input.css","amplify-chat/input/amplify-text-area.css",
 "amplify-chat/input/button-row.css","amplify-chat/input/global-chat-container.css","amplify-chat/input/amplify-context-container.css",
 "amplify-chat/full-page/full-page.css","amplify-chat/clarifying-questions/clarifying-questions.css","amplify-chat/clarifying-questions/clarify-option.css","amplify-chat/clarifying-questions/clarify-key.css","amplify-chat/clarifying-questions/clarify-something-else.css","card/card.css","checkbox/checkbox.css","amplify-chat/docked/docked-chat.css","amplify-chat/sources/sources-row.css","novo-data-table/novo-data-table.css"]
comp="".join(f"\n/* ==== {w} ==== */\n"+open(f"{lib}/{w}").read() for w in want if os.path.exists(f"{lib}/{w}"))
src=open(f"{OUT}/src.html").read().replace("/*SCRIPT*/",open(f"{OUT}/script.js").read())
used=sorted(set(re.findall(r'data-i="([a-z0-9-]+)"',src))|set(re.findall(r"ic\('([a-z0-9-]+)'",src)))
icd=f"{lib}/../../assets/icons"
css=[]
for n in used:
    p=f"{icd}/{n}.svg"
    if not os.path.exists(p): print("MISSING ICON",n); continue
    d="data:image/svg+xml;base64,"+base64.b64encode(open(p,"rb").read()).decode()
    css.append(f'[data-i="{n}"]{{--ats-icon:url("{d}")}}')
html=src.replace("/*TOKENS*/",tok).replace("/*COMPONENTS*/",comp).replace("/*ICONS*/","\n".join(css))
os.makedirs(f"{R}/docs-site/prototypes/amplify-preview",exist_ok=True)
open(f"{R}/docs-site/prototypes/amplify-preview/index.html","w").write(html)
print("ok",len(html),"icons",len(used))
