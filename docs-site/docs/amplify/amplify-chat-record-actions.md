# Amplify Chat: primary actions on records in chat

How to handle actions a user can apply to records Amplify returns in chat, such as "Add 5 contacts" on a list of suggested contacts. Covers both record tables and record cards.

Mockups:

- Table: `amplify-chat-record-actions.html`
- Cards: `amplify-chat-record-actions-cards.html`

## Core decisions (tables and cards)

### The action is attached to the records, not the response

- The primary action lives in an action bar attached to the records it affects. It does not sit on the follow-up row or the response-controls row.
- Follow-ups send a message to Amplify. The primary action writes to Bullhorn. They are different kinds of action and need different homes.
- Principles: Gestalt proximity and common region; H4 consistency and standards.
- Research doc §1: Salesforce renders an "agentic card with a data table and multiple actions". Microsoft inline widgets allow "up to two primary actions (e.g., Approve, Edit, Download)". Assessment: "Make confirmation cards the only way chat can write data."

### Follow-ups stay visible whatever is selected

- Selection belongs to the records, not the conversation. Follow-ups and response controls (copy, thumbs, save) don't change when the selection changes.
- Hiding follow-ups on selection would take away a path the user had a moment ago, and cause layout shifts.
- Principles: Amplify Design Reference principle 2 (AI "should only add control — never remove it"); H3 user control and freedom.
- Research doc §1: follow-ups are "Chips under the latest response".

### Order within the response

1. Records (table or cards)
2. Action bar
3. Sources row
4. Follow-ups
5. Response controls

### Split button for the primary action

- The left segment runs the default action. The chevron segment opens a menu of other actions.
- Don't use a single button with a chevron. Users can't tell whether a click runs the action or opens the menu.
- Principles: H7 flexibility and efficiency; Rams 4, understandable.
- No check icon on the button. A checkmark reads as "done" before anything has happened (H1 visibility of system status; Rams 6, honest).
- Use a split button when one action is clearly the default and there are about 2–4 alternatives. Use separate buttons (one filled, the rest secondary) when two or three actions carry equal weight.

### Label states the verb and the count

- The label names the action and the number of records: "Add 5 contacts". Use sentence case.
- The count updates live as records are selected or deselected.
- A selection count ("5 of 5 selected") sits in the same bar, so the user can check the scope without counting checkboxes.
- Principles: H1; H6 recognition rather than recall.
- Research doc §5: "Use an action preview with a specific verb for any write or outbound message… with a button that names the action ('Send 12 emails,' 'Update 3 submissions')".

### Zero selected

- The bar stays in place. The button is disabled and reads "Select contacts to add".
- Hiding the bar would make the layout jump.
- Principle: Rams 8, thorough (zero, one and many states all designed).

### Completion state with undo

- After the action runs, the bar changes to a confirmation, e.g. "5 contacts added to Bullhorn · View in Bullhorn ↗", with Undo.
- The affected records update at the same moment: status changes and checkboxes lock.
- Principles: H1; H3; Gestalt common fate.
- Research doc §1: Microsoft requires "a confirmation of the completion of the action… in the form of a card". Assessment: "Treat navigation-out as a deliberate, labelled action. Use 'Open in Bullhorn ↗'".

### Actions are graded by risk

- Low-risk actions (adding contacts) run in one click, with undo.
- Higher-risk actions in the menu (for example, adding records to an Outreach sequence) open an action preview before anything runs. The menu item says so.
- Principles: H5 error prevention; Amplify "no auto-act without review".
- Research doc §4: "Risk-graded approvals (Microsoft Cowork). Low-risk actions (draft a note) need one click. Higher-risk ones (mass Outreach, status changes on Placements) show a risk indicator and a fuller preview."

## Tables

- The action bar sits inside the table card's border, as a footer row below the last row.
- Select-all stays in the table header checkbox (checked, indeterminate or empty to match the selection).
- The bar holds the selection count (left) and the split button (right).
- Added rows get a subtle background, show "Added to Bullhorn" in the status column, and lock their checkboxes.
- Principle: Gestalt common region. The records and their action share one boundary.

## Cards

- Cards don't share a border, so the action bar is the last item in the card list.
  - It uses the card styling (border/default, 8px radius, general/level 1 shadow) and the same 8px gap as between cards, so it reads as part of the list.
  - Principles: Gestalt similarity and proximity.
- Don't wrap the cards in an outer container. That puts a border inside a border, against the Modern UI "clean" principle (separation from tonal borders and spacing, not heavy lines).
- Cards have no header row, so select-all moves into the action bar.
  - The select-all checkbox lines up with each card's checkbox (Gestalt continuity), next to the count ("3 of 3 selected").
  - Principles: H1; H6; H7.
- The bar sticks to the bottom of the chat viewport while the list is in view. Cards are about 132px tall, so five or more would push the action off screen.
  - Principles: H1; H6.
  - The research doc doesn't cover this. Sticky bulk-action bars in list views (Linear, Gmail) are from product knowledge.
- On completion, each added card swaps its match chip for "Added to Bullhorn", takes the subtle background, and locks its checkbox.
  - The change is carried by text and the locked checkbox, not by color alone (Modern UI: never signal state with color alone).
- The split button, labels, menu, completion state and undo are the same as on tables, so users who learn the pattern in one place can use it in the other.
  - Principles: H4; Rams 7, long-lasting.

## Sources

- `ai-chat-ui-patterns-research.md` (project research doc)
- `Amplify Design Reference.md` (project design principles)
- Modern UI (Novo) design system foundations
- Figma, Component Migration file: table screen node 6267:181805; card screen node 6267:179652
