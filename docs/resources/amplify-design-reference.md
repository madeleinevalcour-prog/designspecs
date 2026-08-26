# Amplify Design Reference

A working reference for designers and product managers building within the Amplify product. Covers what Amplify is, how it works, who it's for, and the design principles we should hold ourselves to when building AI experiences.

---

## What is Amplify

Bullhorn Amplify is Bullhorn's AI product for recruitment and staffing agencies. Its core promise is straightforward: more placements, more profit, same team. It does this by running high-volume, repetitive recruiting tasks autonomously — sourcing, screening, outreach, enrichment — so recruiters can focus on the relationship work that only humans can do.

Amplify is not a standalone app. It operates inside Bullhorn (both the Bullhorn Platform and Bullhorn Recruitment Cloud), working on the data already in a firm's system of record. That context matters for design: we're building within an existing workflow and an existing data model, not from a blank canvas.

Amplify is made up of two distinct product layers:

**Digital Workers** are AI-powered team members that run Skills — specific task types like screening, matching, outreach, or data enrichment. They operate 24/7, handle volume, and surface output back into Bullhorn. They are bought as a package and billed by Activity (a single completed AI task).

**Amplify Chat** is a conversational interface built on a staffing-specific LLM. It lets recruiters ask natural language questions, surface insights from their data, and take actions — all without leaving Bullhorn. It's secure (data stays in Bullhorn, not sent to public AI tools), staffing-literate out of the box, and capable of acting, not just answering.

### What makes Amplify different from general AI tools

Amplify is purpose-built for staffing. It understands job orders, candidate profiles, client relationships, and the recruiting lifecycle without requiring configuration from the user. It reads from the same data the recruiter is already working with. And it's secure by design — candidate and client data never leave the Bullhorn environment.

---

## Users

Amplify serves two primary user types, each with different needs and interaction patterns.

**Recruiters** are the primary end users. They use Amplify day-to-day: kicking off screens, reviewing match results, sending outreach, generating candidate presentations, and asking Amplify Chat questions mid-workflow. Their goal is speed and quality — faster placements, better candidates, less manual work. They are often overwhelmed and context-switching constantly.

**Admins** configure and manage Amplify on behalf of their organization. They set up Skills, manage user permissions, and customize prompts in Prompt Studio. They need control and visibility: the ability to understand what Amplify is doing, tune its behavior, and troubleshoot when output is off. Admins care deeply about consistency and predictability.

Secondary users include **Account Managers** (who use Outreach and Present) and **Hiring Managers** (who may interact with Screen output). Amplify is also being extended to serve **finance/ops** functions via Audit and Extract.

---

## Capabilities

Each Digital Worker bundles a set of Skills. Below is the current Skills set and what each one does.

**Enrich** cleans and completes candidate and contact records automatically. It's the foundation — better data makes every other Skill more effective.

**Match** surfaces the best candidates from the existing Bullhorn database for open roles, ranked by AI-driven relevancy. It eliminates the manual keyword search.

**Screen** runs automated candidate interviews via chat or voice, generates summaries, and scores candidates. It can run after hours. A screen that previously took 30–45 minutes per candidate can be reduced to 5–10 minutes.

**Outreach** launches and manages multi-step communication sequences to candidates and contacts. Personalized at scale, tracked in Bullhorn.

**Present** generates branded candidate submission documents automatically, ready to send to clients.

**Prospect** (new) autonomously identifies target companies and high-growth accounts, surfacing the right contacts for business development.

**Transcribe** (new) records and summarizes calls and interviews, extracting key data back into the record. No manual note-taking.

**Verify** (new) flags potentially fraudulent candidate records using AI-powered authenticity signals.

**Audit** (new) runs compliance checks across placements, charges, and billing rules before they reach payroll or clients.

**Extract** (new) pulls timesheet and credentialing data from any format into the database automatically.

In addition to Skills, every record in Bullhorn has access to **Amplify Assistant** — inline AI that offers content generation, recommendations, and quick actions in context. It does not count against Activity allowances.

---

## How Amplify Works

Understanding the mechanics of Amplify is essential to designing for it well. When we understand how output is generated and why it varies, we can design UIs that set the right expectations and help users get the best results.

### What Amplify reads

Amplify reads from Bullhorn records based on the Skill in use and the user's existing permissions. It cannot access data a user doesn't already have permission to see. The data available varies by Skill: Amplify Assistant reads only the open record; Amplify Chat can search across a user's full data set including Analytics; Screen reads the job order and submission data; and so on.

The quality of output is directly tied to the quality of data. Thin records produce thin output. This is a design constraint we need to account for — empty states and insufficient data scenarios are real and common.

### How output is generated

Amplify uses a large language model to interpret the data in a record and produce a response. The model reasons based on what it's been trained on and what it's given. Output is controlled by prompts — sets of instructions that define tone, format, what to include, and what to exclude. Admins can customize prompts in Prompt Studio for any Skill.

A key implication: **prompts are the primary lever for improving output quality**. If output doesn't match expectations, the prompt is the first place to look, not the data. Design should make this legible to users.

### Why output varies

Amplify will not give exactly the same output on the same record twice. This is not a bug. The LLM produces slightly different wording and framing each run. If output is consistently off or unhelpful, that's a signal to investigate (start with the prompt, then the data quality). If it's just worded differently each time, that's working as intended.

This has implications for how we design around AI output: we should not imply exact repeatability, and we should design review moments that help users evaluate output rather than assume it's correct.

---

## Design Principles for AI Software

The following principles are drawn from industry leaders — Google PAIR, IBM Design for AI, Microsoft Responsible AI, and Salesforce — and translated into what they mean for how we build Amplify.

### 1. Solve a real problem, not a technical one

The best AI features start with a clear user need, not a capability looking for a use case. Before designing a new Amplify experience, the question to ask is: what is the recruiter or admin trying to accomplish, and does AI meaningfully help them do it faster or better?

IBM's design team puts it plainly: "Our solutions must primarily address user needs instead of being force-fit to accommodate technical capabilities." Every new capability in Amplify should pass this test.

### 2. AI assists — it does not replace judgment

Amplify's stated purpose is to amplify humans, not replace them. This should be reflected in how we design every interaction. Recruiters should always feel in control of the outcome. That means giving them edit access to AI-generated content, showing them enough context to evaluate AI suggestions, and never designing flows that auto-submit or auto-act without review. It also means that when AI is layered into an established workflow, it should only add control — never remove it. The presence of an AI feature should not reduce what a user can already do. Opening Amplify Chat, for example, should not cause expected record controls elsewhere in the interface to become unavailable or harder to reach. Users who have built muscle memory around existing workflows should not have to give anything up to get AI assistance.

This is especially important in high-stakes moments: candidate submissions, compliance checks, compensation-adjacent workflows.

### 3. Make it legible — show your work

Users trust AI more when they understand where the output came from. This doesn't mean exposing model internals — it means giving users enough signal to evaluate what they're looking at. Which fields were used? What was the job order it matched against? What did the candidate say in the screen that produced this score?

IBM calls this explainability. Google PAIR calls it appropriate disclosure. We call it: don't make the output a black box.

For Amplify specifically, this means designing screens that surface the data source alongside the AI output — not just the summary, but the inputs that generated it.

### 4. Set honest expectations

AI output varies. It hallucinates. It degrades with thin data. We should design for this honestly rather than obscuring it. That means:

Writing UI copy that doesn't overclaim ("Amplify suggests" not "Amplify determined"). Including calibrated confidence signals where appropriate. Making empty and low-quality data states first-class design scenarios. Teaching users what makes output better (more complete records, better prompts) rather than leaving them to guess.

Google PAIR's guidebook is direct on this: "Explain to users what AI can and cannot do." We should do the same in every surface we design.

### 5. Design for the full range of data quality

A screen built only for perfect data will fail constantly in production. Recruiters' databases are messy: incomplete records, outdated contact info, missing fields. Every Amplify experience needs a considered answer for: what happens when the data isn't there? What do we show when Amplify has almost nothing to work with?

This is not an edge case. It is a primary use case for most customers at the point of adoption.

### 6. Build trust progressively

IBM's AI framework uses Knapp's Relational Development Model to describe how humans build trust with AI systems over time: from initial contact → experimentation → integration → bonding. The implication for product design is that trust is not granted upfront — it is earned through consistent, accurate, useful output over time.

New users and new teams need more scaffolding: more explanations, more review moments, more visibility into what Amplify is doing and why. Power users who have seen Amplify perform well over time are ready for more autonomous workflows and less friction.

Design should account for this spectrum. The same recruiter who is skeptical of AI in week one may want to set-and-forget screening in month three. We should build for both.

### 7. Protect user data and make it visible

Amplify's data security model is a genuine differentiator: candidate and client data stays within the Bullhorn environment and is not sent to public AI tools. This is something users care about — customers have called it out explicitly.

Design should make this visible and reinforce it. When we introduce new AI features, being clear about what data is used, where it goes, and who can see it is not legal boilerplate — it's a product value.

### 8. Be honest about errors and limitations

When AI output is wrong or unavailable, say so simply and directly. Do not hide errors behind vague loading states or silent fallbacks. Users who are surprised by AI errors lose trust permanently. Users who are told clearly "Amplify couldn't complete this because the record has no resume on file" can act on that and move on.

Microsoft's responsible AI framework calls this transparency. It applies both to system failures and to the inherent limitations of what a model can reliably do.

### 9. Design for training and adoption, not just day-1 use

Amplify has a measurable impact on recruiter ramp time: customers report 30% faster onboarding for new hires when using Amplify Chat as a training tool. This is a design opportunity we should take seriously.

New recruiter experiences in particular should be designed with guided, scaffolded discovery in mind — not just efficiency. A new hire exploring Amplify Chat for the first time has different needs than a senior recruiter who knows exactly what to ask.

### 10. Measure what matters

Good AI design is not just about the quality of individual outputs — it's about the downstream outcomes those outputs drive. For Amplify, that means designing with success metrics in mind: time-to-fill, gross profit, screen completion rate, placement rate. These are the numbers our customers track, and they should inform which features we prioritize and how we measure whether our design is working.

---

## What Good Looks Like in Practice

When a new Amplify surface is working well, it should:

- Reduce a concrete task duration (e.g., screening a candidate, building a submission packet)
- Surface AI output in a way that the user can evaluate before acting on it
- Make data inputs visible so users know what drove the output
- Handle incomplete data gracefully without breaking the experience
- Use plain, direct language — not AI hype, not hedging jargon
- Keep the recruiter inside Bullhorn rather than sending them elsewhere
- Give admins the controls they need to tune, configure, and troubleshoot

When it's not working well, you'll typically see one or more of these signals: users ignoring AI output and redoing work manually; users confused about why the output looks wrong; admins unable to diagnose what went sideways; or output that looks great in demo conditions and falls apart with real customer data.

---

## References

- [Bullhorn Amplify product page](https://www.bullhorn.com/products/amplify/)
- [Amplify knowledge base](https://kb.bullhorn.com/amplify/Content/Resources/HomePage.htm)
- [IBM Design for AI — Fundamentals](https://www.ibm.com/design/ai/fundamentals)
- [IBM Design for AI — Everyday Ethics](https://www.ibm.com/design/ai/ethics/everyday-ethics)
- [Google PAIR Guidebook](https://pair.withgoogle.com/guidebook/)
- [Microsoft Responsible AI](https://www.microsoft.com/en-us/ai/responsible-ai)
