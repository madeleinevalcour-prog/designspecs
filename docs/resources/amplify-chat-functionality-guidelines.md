# Amplify Chat — Functionality Guidelines

**For designers and PMs integrating Amplify chat into their area (Modern UI)**

## How to use this document

These guidelines describe how Amplify chat is intended to behave when it touches your area of the product. They accompany the shared chat components. Use them to decide how chat should show up, carry context, and move users through workflows that involve your pages.

The behavioral principles are area-agnostic. A worked **Search** example runs through the document to show how they apply in practice, since Search is the first area being integrated. Adapt the example to your own workflows.

A note on sourcing: the principles below combine direction from the Amplify roadmap (Dockable Chat Phase II, APF-266, and Phase III, APF-278) with additional product goals for docked and full-page chat. Where something is still directional rather than committed scope, it is called out as such.

## Core concepts

Amplify chat appears in two surfaces that share the same conversation and context:

**Docked chat** is the persistent panel that stays with the user as they move around Bullhorn. It does not need to be re-opened each time the user navigates to a new record or page.

**Full-page chat** is the expanded, standalone chat experience. It is a valid entry point to a workflow, not just an overflow view of the dock.

**Pop over** is an alternate presentation of the docked chat. Using a button in the top left of the panel, the user can switch the dock into a pop over: a resizeable, moveable window that overlays the page content rather than pushing it aside. The docked appearance is the default, and the pop over retains all the same functionality as the docked version. Unlike a modal, the pop over has no scrim or overlay behind it. The user can still click anything on the page beneath it and continue interacting with the underlying content while chat stays open.

The surfaces are continuous. A conversation started in one is available in the other, and context follows the user between them.

## Principle 1: Context persists across navigation

Chat should not reset when the user moves between pages or records. The conversation, and the working context behind it (the entities in play, an active search, applied filters, the user's stated intent), carries across the navigation.

This is the foundation everything else builds on. Before chat can guide a user through a multi-page task, it has to hold state through the page change.

**Search example:** A user builds a search on a job record. When chat takes them to the candidate list, the search criteria and results carry over intact. The user does not rebuild the search or re-explain what they were doing.

**What to define for your area:** What context objects matter in your workflows (records, searches, filters, selections), and which of them must survive a navigation for the workflow to feel continuous.

## Principle 2: Chat can drive cross-page workflows

Chat is not only present on every page. It can actively move the user through a workflow that spans multiple pages, and it maintains context as it moves them.

This works in both directions:

Docked chat can carry a user from where they are into the next relevant page in their task.

Full-page chat can also be a starting point that brings the user into another page when the workflow calls for it. A user can begin in full-page chat and be taken to the relevant record or list to continue the task.

**Search example:** From a job record, chat helps the user build a search, then navigates them to the candidate list with the results applied. Equivalently, a user could start in full-page chat, describe the candidates they are looking for, and be brought to the candidate list with that search already running.

**What to define for your area:** Which workflows legitimately cross pages, what the natural next page is at each step, and what state must be handed off at each transition.

## Principle 3: Chat follows the user everywhere

Chat should be available anywhere in Bullhorn, not only on records that have deep chat support today.

On pages that are not yet supported with area-specific context, chat gracefully degrades to global chat behavior rather than disappearing. The user always has a consistent chat surface; the depth of context awareness varies by page.

**What to define for your area:** Which of your pages support rich, context-aware chat versus which fall back to global chat, so expectations are clear and the fallback is intentional rather than a dead end.

## Principle 4: History is always reachable

Chat history is available in the dock. Users can return to a previous conversation and carry it into a new context rather than starting over.

**What to define for your area:** Whether past conversations in your area need to be resumable, and what it means to re-enter an old conversation from a different page than where it started.

## Principle 5: The two surfaces stay aligned

Docked and full-page chat should feel like one assistant, not two. The docked experience should align with global chat UX so that moving between surfaces is seamless and the user does not have to relearn the interaction in each place.

**What to define for your area:** Any area-specific affordances that need to behave consistently whether the user is in the dock or full-page.

## Applying this to your area: a checklist

When integrating Amplify chat into your area, work through the following:

1. Identify the workflows in your area that chat should support, and which of them cross more than one page.
2. For each workflow, list the context that must persist through navigation (records, searches, filters, selections, intent).
3. Define the entry points: can this workflow start from docked chat, from full-page chat, or both, and where does each entry point take the user.
4. Map the page-to-page handoffs: at each transition, what state is passed and what does the destination page do with it.
5. Mark which of your pages support context-aware chat and which fall back to global chat behavior.
6. Confirm the experience is continuous across docked and full-page surfaces and consistent with global chat UX.

## Open questions and directional items

The following are known goals but not yet fully specified. Treat them as direction to design toward, and confirm scope with the Amplify team before committing:

Cross-page workflow orchestration (Principle 2) is an active goal but the detailed interaction patterns are still being defined.

The behavior of chat on unsupported pages (Principle 3) is directional; the exact fallback experience should be confirmed per page.

Roadmap sequencing between Phase II and Phase III is implied by the roadmap ordering rather than fixed dates.

## Source references

Dockable Chat: Phase II — better context switching and history (APF-266)

Dockable Chat: Phase III — take Chat anywhere in Bullhorn (APF-278)

Additional docked and full-page chat goals provided by the Amplify design lead (cross-page workflow orchestration; full-page chat as a navigation entry point).
