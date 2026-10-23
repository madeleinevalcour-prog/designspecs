import os, re, base64, sys
# Builds the shell candidate record prototype into docs-site/prototypes/candidate-record/index.html.
# Run from anywhere:  python3 prototypes/candidate-record/build.py
# Inlines the token CSS, the ats-ui component CSS and the Novo icons used, so the output is one file.
HERE=os.path.dirname(os.path.abspath(__file__))
R=os.path.abspath(os.path.join(HERE,"..",".."))
sys.path.insert(0, os.path.join(HERE,"..","_shared"))
import candidate_record
tok="".join(open(f"{R}/tokens/css/{n}.css").read() for n in ["primitives","semantic","components","typography","elevation"])
lib=f"{R}/components/projects/ats-ui/src/lib"
want=candidate_record.CSS_FILES
comp="".join(f"\n/* ==== {w} ==== */\n"+open(f"{lib}/{w}").read() for w in want if os.path.exists(f"{lib}/{w}"))
src=candidate_record.inject(open(f"{HERE}/src.html").read())
used=sorted(set(re.findall(r'data-i="([a-z0-9-]+)"',src)))
icd=f"{lib}/../../assets/icons"
css=[]
for n in used:
    p=f"{icd}/{n}.svg"
    if not os.path.exists(p): print("MISSING ICON",n); continue
    d="data:image/svg+xml;base64,"+base64.b64encode(open(p,"rb").read()).decode()
    css.append(f'[data-i="{n}"]{{--ats-icon:url("{d}")}}')
html=src.replace("/*TOKENS*/",tok).replace("/*COMPONENTS*/",comp).replace("/*ICONS*/","\n".join(css))
os.makedirs(f"{R}/docs-site/prototypes/candidate-record",exist_ok=True)
open(f"{R}/docs-site/prototypes/candidate-record/index.html","w").write(html)
print("ok",len(html),"icons",len(used))
