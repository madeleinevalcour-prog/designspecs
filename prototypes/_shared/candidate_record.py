"""The shell candidate record for HTML prototypes (Figma candidate-record 3868:89906).

Source of truth: the ats-ui `ats-candidate-record` component
(components/projects/ats-ui/src/lib/candidate-record/). `candidate-record.html` is its
rendered markup, with icons as `data-i` spans, so a prototype gets the same page without Angular.

In a prototype's build.py (before the icons are collected from `src`):

    import sys; sys.path.insert(0, os.path.join(HERE, "..", "_shared"))
    import candidate_record
    want += candidate_record.CSS_FILES
    src = candidate_record.inject(src)

and put `<!--CANDIDATE_RECORD-->` in src.html where the page goes (inside a full-height body).
Refresh `candidate-record.html` from /candidate-record in the showcase when the component changes.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = "<!--CANDIDATE_RECORD-->"

# ats-ui component CSS (relative to ats-ui/src/lib) the candidate record needs.
CSS_FILES = [
    "icon/icon.css", "button/button.css", "icon-container/icon-container.css",
    "icon-button-no-container/icon-button-no-container.css", "novo-chip/novo-chip.css",
    "search-input/search-input.css", "menu/dropdown-card.css", "menu/menu-option.css",
    "bowling-alley/bowling-alley-shell.css", "bowling-alley/bowling-alley.css", "bowling-alley/tooltip.css",
    "record-header/record-header.css", "workflow-stepper/workflow-stepper.css",
    "card/card.css", "card/card-actions.css", "card/card-detail-row.css", "novo-list/novo-list.css",
    "candidate-record/candidate-record.css",
]


def markup():
    return open(os.path.join(HERE, "candidate-record.html"), encoding="utf-8").read()


def inject(src):
    return src.replace(MARK, markup())
