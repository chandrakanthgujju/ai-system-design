# Northline

A field course in applied AI system design.

The model is one stage. Northline is the system around it: a latency and cost budget, retrieval you can cite, a context window you refuse to fill, a workflow that keeps side effects in code, an eval gate that matches the harm, and the trace you need when answers get worse on a Tuesday.

You work six production briefs and a design review. Each brief states a product and constraints that do not bend. You choose a design. The course tells you what holds and what breaks, with the numbers from the brief.

Progress stays in this browser (`localStorage`). There is no account and no backend.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What you work through

1. **Budgets** — reply suggestions on a live support call. 800ms, $0.002, show nothing if unsure.
2. **Retrieval** — policy questions that must cite a passage. Exact control ids and paraphrases, and a PDF that gets replaced.
3. **Context** — a 150-word account brief. Pack a 6,000-token window and keep the NDA out.
4. **Control** — refund an order. One judgment inside a workflow. The model does not move money.
5. **Evals** — invoice totals that get booked. The gate is the slice that can lose money, not the average.
6. **Operate** — thumbs-down doubles at 14:10. Slice, diff retrieval, version the corpus.
7. **Design review** — inbox triage. Put the four decisions into one design note.

Planning figures in the briefs are allowances for the exercise, not measured benchmarks.

## Field book

Principles file when you commit a brief, including a design that still breaks. “Holds” means the design survives that brief’s constraints. Clear the notes from the field book. They never leave the browser.
