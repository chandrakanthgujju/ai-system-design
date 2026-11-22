export type Stage = {
  id: string
  name: string
  input: string
  output: string
  failure: string
  metric: string
}

export type Meter = {
  used: number
  cap: number
  unit: string
}

export type Option = {
  id: string
  title: string
  summary: string
  holds: boolean
  feedback: string
  meter?: Meter
}

export type Question = {
  id: string
  prompt: string
  detail?: string
  options: Option[]
}

export type Constraint = {
  label: string
  value: string
}

export type Brief = {
  slug: string
  number: string
  title: string
  question: string
  minutes: number
  product: string
  constraints: Constraint[]
  situation: string[]
  stagesCaption: string
  stages: Stage[]
  exhibit?: "traces"
  interaction: "choices" | "context" | "incident" | "review"
  questions: Question[]
  principle: string
  principleDetail: string
}

export type ContextBlock = {
  id: string
  name: string
  detail: string
  tokens: number
  kind: "record" | "overflow" | "forbidden" | "untrusted"
}

export type TraceHit = {
  title: string
  note: string
  hit: boolean
}

export type TraceColumn = {
  name: string
  hits: TraceHit[]
}

export type TraceQuery = {
  query: string
  columns: TraceColumn[]
}

export type IncidentStep = {
  id: string
  prompt: string
  options: Option[]
}

export const CONTEXT_BUDGET = 6000

export const contextBlocks: ContextBlock[] = [
  {
    id: "spine",
    name: "Account spine",
    detail: "Name, plan, owner, renewal date, ARR. Structured fields from the CRM.",
    tokens: 180,
    kind: "record",
  },
  {
    id: "touch",
    name: "Last touch",
    detail:
      "One line the CRM already stores: date, channel, who, and what changed.",
    tokens: 70,
    kind: "record",
  },
  {
    id: "emails5",
    name: "Last five emails, trimmed",
    detail: "Subject, sender, and the first part of the body. Useful for tone.",
    tokens: 1600,
    kind: "record",
  },
  {
    id: "emailsAll",
    name: "Full email history",
    detail: "Two years of threads, untrimmed.",
    tokens: 11000,
    kind: "overflow",
  },
  {
    id: "opps",
    name: "Open opportunities",
    detail: "Stage, amount, close date, and the recorded next step.",
    tokens: 280,
    kind: "record",
  },
  {
    id: "tickets",
    name: "Open ticket titles and status",
    detail: "Twelve lines. Enough to know whether they are waiting on you.",
    tokens: 420,
    kind: "record",
  },
  {
    id: "threads",
    name: "Full ticket threads",
    detail: "Every reply on every open ticket.",
    tokens: 7800,
    kind: "overflow",
  },
  {
    id: "usage",
    name: "Usage metrics",
    detail: "Active seats and feature use, last 30 days against the prior 30.",
    tokens: 200,
    kind: "record",
  },
  {
    id: "nda",
    name: "Mutual NDA, full text",
    detail: "Forty pages of legal text attached to the account.",
    tokens: 14000,
    kind: "forbidden",
  },
  {
    id: "similar",
    name: "Similar-customer stories",
    detail:
      "Retrieved writeups of other accounts. Analogy, not a record of this one.",
    tokens: 1800,
    kind: "untrusted",
  },
]

export const retrievalTraces: TraceQuery[] = [
  {
    query: "What does control CC6.1 require for logical access?",
    columns: [
      {
        name: "Dense only",
        hits: [
          {
            title: "Access control, overview",
            note: "Right neighborhood. The control id is not in the passage.",
            hit: false,
          },
          {
            title: "Password length standard",
            note: "Nearby topic. Does not answer CC6.1.",
            hit: false,
          },
          {
            title: "Vendor remote access",
            note: "A different control, pulled in by shared wording.",
            hit: false,
          },
        ],
      },
      {
        name: "Lexical only",
        hits: [
          {
            title: "CC6.1, logical access clause",
            note: "The exact id is in the passage, with the requirement.",
            hit: true,
          },
          {
            title: "CC6.2, user registration",
            note: "Adjacent control. The shared prefix ranks it high.",
            hit: false,
          },
          {
            title: "CC6.1 evidence spreadsheet",
            note: "The id matches. The passage is a file name, not the clause.",
            hit: false,
          },
        ],
      },
      {
        name: "Hybrid, then rerank",
        hits: [
          {
            title: "CC6.1, logical access clause",
            note: "Lexical finds it. The reranker puts the clause above the spreadsheet.",
            hit: true,
          },
          {
            title: "CC6.2, user registration",
            note: "Kept as a neighbor, demoted.",
            hit: false,
          },
          {
            title: "Access control, overview",
            note: "Dense candidate, demoted once the clause is present.",
            hit: false,
          },
        ],
      },
    ],
  },
  {
    query: "Who is allowed to approve a production change?",
    columns: [
      {
        name: "Dense only",
        hits: [
          {
            title: "Change management, approval roles",
            note: "The paraphrase lands on the section that names the role.",
            hit: true,
          },
          {
            title: "Production deploy standard",
            note: "Related procedure. Not the approval rule.",
            hit: false,
          },
          {
            title: "Emergency change path",
            note: "A neighbor the question did not ask for.",
            hit: false,
          },
        ],
      },
      {
        name: "Lexical only",
        hits: [
          {
            title: "Glossary entry for “approve”",
            note: "The word matches. The passage is a definition in another policy.",
            hit: false,
          },
          {
            title: "Production outage template",
            note: "“Production” matches. There is no approver in the text.",
            hit: false,
          },
          {
            title: "Access review calendar",
            note: "Shared vocabulary, wrong task.",
            hit: false,
          },
        ],
      },
      {
        name: "Hybrid, then rerank",
        hits: [
          {
            title: "Change management, approval roles",
            note: "Dense finds the paraphrase. Rerank keeps it first.",
            hit: true,
          },
          {
            title: "Production deploy standard",
            note: "Useful context, ranked under the role clause.",
            hit: false,
          },
          {
            title: "Emergency change path",
            note: "Still available, not cited unless the question asks.",
            hit: false,
          },
        ],
      },
    ],
  },
]

export const incidentSteps: IncidentStep[] = [
  {
    id: "operate.first",
    prompt:
      "Thumbs-down doubled at 14:10. Traffic shape is unchanged. Nothing deployed the model. What do you open first?",
    options: [
      {
        id: "restart",
        title: "Restart the generator",
        summary: "Treat it as a bad process and bounce the service.",
        holds: false,
        feedback:
          "A restart does not explain a step change at 14:10, and it throws away the in-memory evidence you have not looked at. If the failure is in the index, the new process will keep quoting the old clause.",
      },
      {
        id: "slice",
        title: "Slice the new failures by document",
        summary:
          "Group thumbs-down since 13:30 by the document id on the trace, and compare to the morning.",
        holds: true,
        feedback:
          "Eighty percent of the new downvotes cite the access-control policy, whose PDF was replaced at 13:40. Everything else is flat. The incident is a corpus event, not a model event. You only know that because the trace carries a document id.",
      },
      {
        id: "temperature",
        title: "Lower the temperature",
        summary: "Make the model less creative and watch the chart.",
        holds: false,
        feedback:
          "Temperature does not move a citation from one clause to another in any way you can reason about, and changing it during the incident gives you a second variable. The chart would stay bad, and you would have spent the hour on the wrong stage.",
      },
      {
        id: "reembed",
        title: "Re-embed the entire corpus",
        summary: "Assume the index is stale and rebuild it from scratch.",
        holds: false,
        feedback:
          "A full rebuild is slow, expensive, and it does not say what is wrong. If the replace operation appended chunks instead of swapping versions, the rebuild repeats the bug with cleaner logs. Find the slice before you touch the index.",
      },
    ],
  },
  {
    id: "operate.diff",
    prompt:
      "The damage is concentrated on the access-control policy, replaced at 13:40. What do you compare next?",
    options: [
      {
        id: "one-answer",
        title: "Read one bad answer and edit the prompt",
        summary: "The quote looks outdated. Add “prefer the newest policy.”",
        holds: false,
        feedback:
          "One answer cannot tell you whether retrieval returned the old clause, the new clause, or both. A prompt instruction to “prefer the newest” is how you hide an index that contains two truths. You still do not know which stage broke.",
      },
      {
        id: "diff-passages",
        title: "Diff retrieved passages on a fixed query set",
        summary:
          "Replay the saved queries from the morning against the current index. Compare passage ids and document versions.",
        holds: true,
        feedback:
          "The fixed query “CC6.1” now returns two chunks: today’s clause and last quarter’s clause, both still live. Generation is quoting the old one about half the time. Retrieval changed. The model did not. You can see that because you stored passage ids and versions, not only the final answer.",
      },
      {
        id: "rollback-model",
        title: "Roll the model back to yesterday’s id",
        summary: "Undo the last known change, even though the deploy log is empty.",
        holds: false,
        feedback:
          "There is no model change to roll back. Spending the rollback anyway tells you nothing and risks a config drift you will then have to explain. The deploy log was the check. It is already negative.",
      },
      {
        id: "flush-cache",
        title: "Flush the answer cache and stop there",
        summary: "Old answers might be stuck in a cache from before 13:40.",
        holds: false,
        feedback:
          "A flush is reasonable once you know cached answers are part of it. You do not know that yet. If the cache key omits the corpus version, the flush fixes the next ten minutes and the bug returns on the first miss. Look at what retrieval returns before you erase the evidence.",
      },
    ],
  },
  {
    id: "operate.fix",
    prompt:
      "Old and new chunks for CC6.1 are both in the index. The model quotes the old clause. What is the fix?",
    options: [
      {
        id: "prompt-newer",
        title: "Instruct the model to prefer the newer policy",
        summary: "Leave both versions indexed. Disambiguate in the prompt.",
        holds: false,
        feedback:
          "The model now has two passages that both look authoritative, and a sentence asking it to notice dates. That fails closed some of the time and fails open the rest. The index is asserting two current truths. Stop asserting the old one.",
      },
      {
        id: "ttl",
        title: "Set a five-minute cache TTL",
        summary: "Let bad answers age out quickly.",
        holds: false,
        feedback:
          "The cache is not the source. Retrieval still returns the retired clause, so a short TTL just regenerates the wrong quote more often. TTLs do not version a corpus.",
      },
      {
        id: "version-delete",
        title: "Delete-by-version on replace, and version the cache key",
        summary:
          "Committing a new document removes the previous version’s chunks in the same operation. The cache key includes the corpus version. The answer shows the policy’s effective date.",
        holds: true,
        feedback:
          "Replace means replace. The old CC6.1 chunks are deleted when the new version commits, not on a later cleanup job that may fail open. Exact-query cache entries from the previous corpus version miss immediately, because the version is in the key. The cited passage can only be one that still exists.",
      },
      {
        id: "readd",
        title: "Re-add the new PDF with a higher embed weight",
        summary: "Keep both, but bias search toward the file you just uploaded.",
        holds: false,
        feedback:
          "You now have three copies and a weight you will forget to remove. Rare tokens such as CC6.1 will keep matching the old lexical postings. Bias is not a delete.",
      },
    ],
  },
  {
    id: "operate.page",
    prompt:
      "What do you add so the next bad replace pages you before the thumbs-down chart does?",
    options: [
      {
        id: "latency-alert",
        title: "A global latency alert",
        summary: "Page if p95 crosses the ceiling.",
        holds: false,
        feedback:
          "Today’s incident was fast. The wrong clause returned inside the latency budget. A latency page stays green through the whole event.",
      },
      {
        id: "pinned",
        title: "A pinned query, and downvotes by document",
        summary:
          "Nightly eval runs “CC6.1” and expects the current clause hash. Alert on thumbs-down rate for a single document id, not only the global rate.",
        holds: true,
        feedback:
          "The pinned query fails the moment the expected clause is missing or a second version is present. You do not wait for employees to notice. The per-document downvote alert catches the cases the pinned set does not cover, and it does not drown in the global rate, which barely moved.",
      },
      {
        id: "weekly-read",
        title: "A weekly human read of ten answers",
        summary: "Put it on the Friday calendar.",
        holds: false,
        feedback:
          "A weekly sample is a useful audit and a useless page. This incident lasted an afternoon. Ten answers on Friday would have found it after the policy had already been misquoted for three days.",
      },
      {
        id: "answer-only",
        title: "Log the final answer text and nothing else",
        summary: "Keep storage small. Reconstruct the rest if you need to.",
        holds: false,
        feedback:
          "From the answer alone you cannot tell a retrieval miss from a generation miss, and you cannot see the document version. Reconstructing it later means re-running a system that has already changed. Log stage, passage id, document version, model id, abstain bit, token counts, and latency per stage. Redact the question body on a short retention if the questions are sensitive. Keep the ids.",
      },
    ],
  },
]

export const reviewSynthesis =
  "This holds. The draft is produced before anyone is waiting, the context is an allowlist, money stays behind a person and a code check, and the gate is the slice that can lose money rather than the average of the easy mail. Auto-send can come later, for intents whose worst case is tone, and only after a shadow week. It is not the first release."

export const briefs: Brief[] = [
  {
    slug: "budgets",
    number: "01",
    title: "Budgets",
    question: "What can you afford to run before anyone is willing to wait?",
    minutes: 8,
    product: "Reply suggestions on a live support call",
    constraints: [
      { label: "Ceiling", value: "800ms allowance" },
      { label: "Cost", value: "$0.002 a suggestion" },
      { label: "Volume", value: "40k tickets a day" },
      { label: "Abstain", value: "Show nothing if unsure" },
    ],
    situation: [
      "A support agent is on a live call. Beside the ticket, the product may show a two-sentence reply the agent can read aloud. If it appears after the agent has already spoken, it is not a suggestion. If it quotes a policy the retrieval did not return, it is worse than silence.",
      "The figures below are planning allowances, not a measured p95. Real tail latency is not the sum of stage tails. The sum is a conservative sketch you use before you have a trace, to decide which designs you are even allowed to attempt.",
    ],
    stagesCaption:
      "Select a stage. The contracts are the design. The model is one of them.",
    stages: [
      {
        id: "ticket",
        name: "Ticket read",
        input: "Ticket id from the call the agent already has open.",
        output: "Subject, product, plan, and the last three messages.",
        failure: "Reading a stale replica and suggesting a reply to a message the customer already corrected.",
        metric: "Read latency and replica lag.",
      },
      {
        id: "embed",
        name: "Embed the question",
        input: "The customer’s latest message, not the whole thread.",
        output: "A query vector, plus the lexical terms: product, plan, error code.",
        failure: "Embedding the entire thread, so the question is diluted by signatures and quoted history.",
        metric: "Embed latency and tokens sent to the embedding model.",
      },
      {
        id: "search",
        name: "Hybrid search",
        input: "The vector and the lexical terms.",
        output: "Top passages, each with a score and a passage id.",
        failure: "Returning passages with no score, which means you cannot abstain.",
        metric: "Top score, empty rate, and search latency.",
      },
      {
        id: "draft",
        name: "Draft",
        input: "A short instruction, the ticket skeleton, and at most three passages.",
        output: "Two sentences, or an explicit abstain.",
        failure: "A paragraph the agent will not read, or a policy sentence with no passage behind it.",
        metric: "Abstain rate, output tokens, and generation latency.",
      },
      {
        id: "rules",
        name: "Rules check",
        input: "The draft and the passage ids that were shown to the model.",
        output: "Show the draft, or drop it.",
        failure: "A suggestion that promises a refund, names an entitlement, or cites a clause that was not in the passages.",
        metric: "Drop rate by rule.",
      },
    ],
    interaction: "choices",
    questions: [
      {
        id: "budgets.stack",
        prompt: "Which stack fits the call?",
        detail:
          "Allowances, as a sketch: ticket read 50ms, embed 40ms, hybrid search 45ms, a reranker 120ms, rules 10ms. A small model writing two sentences is 220ms. A large model with three policies pasted into the prompt is about 1,150ms. An agent that searches, reads, drafts, and critiques is four turns.",
        options: [
          {
            id: "large",
            title: "One large call, policies pasted in",
            summary:
              "No search. Three policy documents live in the prompt. The model writes the suggestion from memory of that prompt.",
            holds: false,
            meter: { used: 1200, cap: 800, unit: "ms" },
            feedback:
              "The allowance is already over 800ms before you have paid for the policies in the prompt, and the planning cost is about $0.018, nine times the ceiling. There is also nothing to cite. When the pasted policy is the wrong year’s version, the model will still answer, because you gave it no score it can fail.",
          },
          {
            id: "small",
            title: "Retrieve, then a small model",
            summary:
              "Hybrid search, three passages, a small model, two sentences, and an abstain when the top score is weak. No reranker.",
            holds: true,
            meter: { used: 365, cap: 800, unit: "ms" },
            feedback:
              "Ticket 50, embed 40, search 45, generate 220, rules 10. The sketch sums to 365ms, under both the 800ms ceiling and a later 450ms one, and the planning cost sits near $0.0004. You gave up the reranker. That is the right cut on a live call: adding it puts you at 485ms, which is the first thing that will not survive the tighter ceiling. Abstain is what makes the missing reranker safe. A weak top score shows nothing.",
          },
          {
            id: "agent",
            title: "An agent that checks its own work",
            summary:
              "Search, read three documents, draft, then a second call to critique the draft. Cap the loop at four turns.",
            holds: false,
            meter: { used: 4000, cap: 800, unit: "ms" },
            feedback:
              "Four turns is a few seconds and a few cents. The agent is doing research the agent on the phone does not have time for. A critique pass also tends to rewrite a grounded sentence into a smoother one that no longer matches the passage. The quality bar on this product is “silent unless cited,” not “a more polished paragraph.”",
          },
        ],
      },
      {
        id: "budgets.cut",
        prompt: "Generation slips from 220ms to 400ms. The sketch no longer fits a 450ms ceiling. What do you cut first?",
        detail:
          "The retrieve-then-small-model stack was 365ms. It still fits 800ms, and it still fits 450ms at 220ms of generation. This question is the next model you try, the one that writes the same two sentences more slowly.",
        options: [
          {
            id: "drop-retrieval",
            title: "Drop retrieval",
            summary: "Keep the slower model. Let it answer from the instruction alone.",
            holds: false,
            feedback:
              "You saved the search and the embed, about 85ms, and you removed the only evidence the suggestion had. The slower model will quote policy it was not given. On a live call that is the failure this system exists to prevent. Retrieval is not the elastic stage.",
          },
          {
            id: "drop-rules",
            title: "Drop the rules check",
            summary: "Ten milliseconds back. Show the draft as the model wrote it.",
            holds: false,
            feedback:
              "Ten milliseconds was never why the sketch broke. The check is what stops a suggestion that promises a refund or cites a clause the passages do not contain. Cutting the cheapest safety stage is what teams do when they treat the budget as a number to hit rather than a description of the product.",
          },
          {
            id: "cap-output",
            title: "Make generation smaller",
            summary:
              "Stay on a small model, cap the draft at two short sentences, and do not add the reranker you were considering.",
            holds: true,
            feedback:
              "Generation is the elastic stage. Output tokens and model size are where the allowance actually moves. The search stays, because without it you cannot abstain honestly. The rules stay, because they are 10ms and they are the last gate. The reranker stays out: it costs more than the overrun you are trying to pay for.",
          },
          {
            id: "stream",
            title: "Stream tokens into the panel",
            summary: "Show the draft as it arrives so the agent sees something sooner.",
            holds: false,
            feedback:
              "Streaming improves time-to-first-token. It does not improve the time until a guarded suggestion is safe to show. The rules check needs the whole draft. If you reveal tokens before that check, the agent can read a promise you were about to drop. The p95 of a suggestion you are willing to put on a live call does not move.",
          },
        ],
      },
    ],
    principle: "Write the budget first. The model you can afford is a consequence.",
    principleDetail:
      "On a live call the product is the silence as much as the suggestion. Retrieval earns its place because it gives you a score to abstain on. A reranker, a large model, and an agent loop are reasonable tools, and none of them fit inside what the agent on the phone can wait for. When the sketch breaks, shrink generation. Do not spend the safety stage, and do not confuse streaming with a budget.",
  },
  {
    slug: "retrieval",
    number: "02",
    title: "Retrieval",
    question: "What has to be true for a citation to be a passage that still exists?",
    minutes: 10,
    product: "Policy questions for employees",
    constraints: [
      { label: "Ceiling", value: "2.5s allowance" },
      { label: "Cite", value: "A passage, or silence" },
      { label: "Corpus", value: "1,200 policies, weekly edits" },
      { label: "Queries", value: "Ids and paraphrases" },
    ],
    situation: [
      "Employees ask an internal assistant about policy. Some questions name a control id, a product, or a form number. Others are paraphrases: “who approves a production change?” An answer that does not quote a passage is not an answer you can ship. A passage from last quarter’s PDF is an incident even when the sentence is fluent.",
      "This is a different budget from the live call. Two and a half seconds is acceptable, and a wrong clause is the harm. The channel, the chunk, and the version contract are the design.",
    ],
    stagesCaption:
      "The reference path. The decisions below are which parts you can drop and still cite honestly.",
    stages: [
      {
        id: "ingest",
        name: "Versioned ingest",
        input: "A document id and an immutable version: the bytes, the effective date, the owner.",
        output: "A committed version, or no change at all.",
        failure: "Appending the new file’s chunks beside the old ones and calling it an update.",
        metric: "Versions live per document. A document with two current versions is a page.",
      },
      {
        id: "chunk",
        name: "Chunk under the heading",
        input: "The version’s text, split on headings rather than on a character count.",
        output: "A passage whose prefix is the heading path, such as SOC 2 / Logical access / CC6.1.",
        failure: "A 512-token slice that separates a clause from the id that makes it retrievable.",
        metric: "Share of chunks that contain a complete clause, and chunks with an empty heading path.",
      },
      {
        id: "channels",
        name: "Two channels",
        input: "The question, embedded, and the same question as lexical terms.",
        output: "A dense list and a BM25 list.",
        failure: "Running only the channel that looked good on the demo questions.",
        metric: "Recall of a pinned set, split into id-queries and paraphrase-queries.",
      },
      {
        id: "fuse",
        name: "Fuse",
        input: "Both lists.",
        output: "One candidate pool, fused by rank rather than by raw score. The scores are not on the same scale.",
        failure: "Adding a cosine to a BM25 score and wondering why one channel always wins.",
        metric: "How often the eventual answer’s passage was present in only one channel.",
      },
      {
        id: "rerank",
        name: "Rerank",
        input: "The top candidates, about twenty.",
        output: "Four passages in the order a cross-encoder prefers.",
        failure: "Reranking the top fifty on every query because the offline number went up, and missing the latency ceiling.",
        metric: "Rerank latency, and whether the cited passage moved.",
      },
      {
        id: "cite",
        name: "Cite or abstain",
        input: "The four passages and the question.",
        output: "A quote that is a span inside one returned passage, plus the passage id and the effective date. Or silence.",
        failure: "A citation that names a document the model remembers but the retriever did not return.",
        metric: "Abstain rate, and the rate of quotes that do not match the returned text.",
      },
    ],
    exhibit: "traces",
    interaction: "choices",
    questions: [
      {
        id: "retrieval.channel",
        prompt: "Which channel do you ship?",
        detail:
          "The traces above are the same two questions employees actually ask. One names an id. One does not use the words in the heading.",
        options: [
          {
            id: "dense",
            title: "Dense only",
            summary: "One embedding model, one nearest-neighbor index. Simple to operate.",
            holds: false,
            feedback:
              "The paraphrase looks solved, which is why this survives a demo. CC6.1 does not. A control id is a rare token, and the neighborhood of “access control” is a pile of passages that are about the right theme and are not the clause. You cannot cite a passage you did not retrieve.",
          },
          {
            id: "lexical",
            title: "Lexical only",
            summary: "BM25 over the heading path and the body. Exact strings rank first.",
            holds: false,
            feedback:
              "CC6.1 comes back, along with a spreadsheet named after it. The approval question does not. People do not reuse the heading when they ask. A lexical index that cannot answer a paraphrase will look precise in evals you wrote with the policy’s own words, and lost on the questions employees send.",
          },
          {
            id: "hybrid",
            title: "Hybrid, then a reranker",
            summary:
              "BM25 and dense, fused by rank, then a cross-encoder over the union. Cite a span from the reranked four, or abstain.",
            holds: true,
            feedback:
              "Each channel catches the query the other drops, and the reranker is what stops a filename that contains CC6.1 from outranking the clause. The allowance here is 2.5 seconds, so a reranker’s roughly 120 to 150ms fits. It did not fit on the live support call. The ceiling is what makes this a different design, not a better opinion about rerankers.",
          },
        ],
      },
      {
        id: "retrieval.chunk",
        prompt: "How do you chunk a policy?",
        detail:
          "Clauses are short. They inherit their meaning from the heading above them. Pages mix several clauses. Tables appear. A few PDFs are scans and need a text pass before any of this matters.",
        options: [
          {
            id: "fixed",
            title: "512 tokens, split on characters",
            summary: "Even chunks, a little overlap, the same settings as the tutorial.",
            holds: false,
            feedback:
              "A character split cuts CC6.1’s requirement away from the id, or away from the heading that says it is about logical access. The chunk that reaches the model then reads like a fragment, and the model completes it. Overlap does not put the heading back.",
          },
          {
            id: "page",
            title: "One chunk per page",
            summary: "Keep the PDF’s pagination. Cite “page 14.”",
            holds: false,
            feedback:
              "Page 14 contains the clause you need and two neighbors you do not. The citation stops being a passage and becomes an invitation for the model to quote whichever sentence on that page sounds like the answer. Pages are also a property of the file, not of the policy. A re-export moves the page numbers.",
          },
          {
            id: "structure",
            title: "Split on headings, and keep the path",
            summary:
              "One clause, intact, prefixed with the heading path. The citation is that passage.",
            holds: true,
            feedback:
              "The heading path is why a short clause is retrievable at all: the words “logical access” may never appear in the clause body. Keeping the clause intact means the span you cite still contains the requirement. Scanned pages still need a text extraction check before they enter this path. A chunker cannot repair a page that came through as an image.",
          },
        ],
      },
      {
        id: "retrieval.fresh",
        prompt: "A policy PDF is replaced on Tuesday. What is the index contract?",
        options: [
          {
            id: "once",
            title: "Embed on first ingest",
            summary: "Re-index only when someone files a ticket that the answers look old.",
            holds: false,
            feedback:
              "Last quarter’s clause remains the nearest neighbor, and it remains a lexical hit for CC6.1. The model will quote it with a citation, which is the dangerous case: the answer looks sourced. Staleness that still cites is how this product breaks trust.",
          },
          {
            id: "weekly",
            title: "Re-embed the corpus every Sunday",
            summary: "A full rebuild on a cron. Simple, and eventually correct.",
            holds: false,
            feedback:
              "You are correct on Monday morning and wrong from Tuesday until Sunday. You also pay to re-embed files that did not change. A weekly job is a backfill, not a contract. The person who replaced the PDF believes the assistant reads the file they just published.",
          },
          {
            id: "versioned",
            title: "Swap versions, and key the cache on the corpus",
            summary:
              "The commit that adds the new chunks deletes the previous version’s chunks. Cache keys include the corpus version. Answers show the effective date.",
            holds: true,
            feedback:
              "Replace means one current version. Doing the delete in the same operation as the insert means a failed job does not leave both, and it does not leave neither: you commit the swap. The cache key is the part people forget. An exact-query cache from 13:00 will keep serving the old answer until its TTL, with a citation that no longer matches the index, unless the version is in the key.",
          },
        ],
      },
    ],
    principle: "Exact identifiers need a lexical channel. A citation is a passage that still exists.",
    principleDetail:
      "Dense search is how paraphrases find a section that does not share their words. It is a poor tool for CC6.1, a filename collision, or any token the embedding model has barely seen. Hybrid retrieval plus a reranker fits here because the ceiling allows it and the harm is a wrong clause. None of that matters if a replaced PDF leaves the old chunks in place. Version the document, delete the previous version on commit, and put that version in the cache key.",
  },
  {
    slug: "context",
    number: "03",
    title: "Context",
    question: "What are you willing to put in the window, and what do you refuse?",
    minutes: 8,
    product: "A 150-word account brief before a sales call",
    constraints: [
      { label: "Length", value: "About 150 words" },
      { label: "Window", value: "6,000 token allowance" },
      { label: "When", value: "Generated at booking" },
      { label: "Refuse", value: "Legal text stays out" },
    ],
    situation: [
      "A seller has a call in an hour. They want a brief: who this account is, what is open, what changed recently, and whether support is on fire. They will skim it. They will not read a digest of forty emails, and they will trust a sentence that sounds specific.",
      "The brief is generated when the meeting is booked, stored, and regenerated if a new email or ticket arrives. Opening it is a read. The 6,000 tokens are the allowance for the generation call, not a target. A mutual NDA sits on the account. It must not enter the prompt.",
    ],
    stagesCaption:
      "The click path never calls the model. Selection happens one stage earlier, when the meeting is booked.",
    stages: [
      {
        id: "trigger",
        name: "Meeting booked",
        input: "An account id and a start time.",
        output: "A job, not a chat turn.",
        failure: "Waiting until the seller opens the brief, then making them watch a spinner.",
        metric: "Share of meetings that have a stored brief ten minutes before the start.",
      },
      {
        id: "select",
        name: "Select blocks",
        input: "An allowlist of block types, and a deny class for legal text.",
        output: "A set of blocks under the token allowance.",
        failure: "Concatenating every object on the account until the window is full.",
        metric: "Tokens per brief, and blocks rejected by class.",
      },
      {
        id: "order",
        name: "Order the window",
        input: "The selected blocks and the instruction.",
        output: "Spine and instruction at the top, evidence after, the abstain rule where the model will still see it.",
        failure: "Burying “say it is not in the record” under a thread the model attends to instead.",
        metric: "Manual review of briefs that invented a last touch. There should be a source id or the words “not in the record.”",
      },
      {
        id: "store",
        name: "Generate and store",
        input: "The ordered window.",
        output: "The brief, the block ids it was allowed to use, and a hash of those blocks.",
        failure: "Storing the prose without the ids, so you cannot explain a sentence later.",
        metric: "Generation failures and briefs served with a stale hash.",
      },
      {
        id: "read",
        name: "Read on open",
        input: "The meeting id.",
        output: "The stored brief. No model call.",
        failure: "A click path that regenerates from scratch because it was easier to reuse the chat handler.",
        metric: "Open latency. This hop should look like a database read.",
      },
    ],
    interaction: "context",
    questions: [],
    principle: "Context is a product decision. Select, order, and refuse.",
    principleDetail:
      "The window is not a junk drawer you fill until the model stops accepting tokens. Structured fields answer structured questions: the last-touch line beats two years of mail if the question is “what changed.” Raw mail is for tone, and it is optional. Legal text is a class you refuse before a prompt is built, not a hope that the instruction will ignore it. Generate when the meeting is booked. The seller’s click is a read.",
  },
  {
    slug: "control",
    number: "04",
    title: "Control",
    question: "Which steps are code, which step is a judgment, and who can move money?",
    minutes: 9,
    product: "Refund a support order",
    constraints: [
      { label: "Ceiling", value: "3s for the recommendation" },
      { label: "Money", value: "A person confirms" },
      { label: "Cap", value: "Above $200 needs a lead" },
      { label: "Retry", value: "A refund must not run twice" },
    ],
    situation: [
      "From the support tool, an agent asks whether this order can be refunded. The system may look up the order, read the policy for that product and region, and recommend a yes or a no. It may not move the money on its own. Above $200, a lead has to be the one who confirms.",
      "The path is known before the model is involved. Load the order, load the rule, judge the case, check the caps, ask a person, then call the refund API. The interesting design choice is not how to make an agent discover those steps. It is where a judgment is actually required.",
    ],
    stagesCaption:
      "Six hops. Only one of them is a model, and it is not the hop that touches the payment service.",
    stages: [
      {
        id: "load",
        name: "Load the order",
        input: "Order id.",
        output: "Amount, currency, SKU, region, age of the order, prior refunds.",
        failure: "Asking the model to parse an order id out of a paragraph the agent already clicked.",
        metric: "Lookup errors. This hop is ordinary service code.",
      },
      {
        id: "policy",
        name: "Retrieve the rule",
        input: "SKU and region.",
        output: "The refund clauses that apply, each with an id.",
        failure: "Sending the entire policy manual and trusting the model to find the regional exception.",
        metric: "Queries that retrieve zero clauses. Those abstain.",
      },
      {
        id: "judge",
        name: "Judge",
        input: "The order fields and the clauses.",
        output: "A structured proposal: eligible, amount, reason, clause id.",
        failure: "A paragraph the rest of the system cannot check.",
        metric: "Schema failures, and clause ids that were not in the retrieved set.",
      },
      {
        id: "engine",
        name: "Policy engine",
        input: "The proposal, the order, the caller’s role.",
        output: "Allow confirm, require a lead, or reject. The engine is code.",
        failure: "Encoding the $200 cap as a sentence in the prompt and discovering it in finance three weeks later.",
        metric: "Proposals the engine rejected, by reason.",
      },
      {
        id: "confirm",
        name: "Human confirm",
        input: "Amount, reason, clause text, and who is allowed to press the button.",
        output: "A decision id, created once.",
        failure: "A confirm button that calls the model again and may get a different amount.",
        metric: "Confirms, edits, and abandons.",
      },
      {
        id: "refund",
        name: "Refund API",
        input: "Decision id, idempotency key of order id plus decision id.",
        output: "One refund, or the same refund returned on retry.",
        failure: "A tool the model can call, with retries implemented as “call it again.”",
        metric: "Duplicate refund attempts refused by the idempotency key. The number should be visible, and it should never be a surprise.",
      },
    ],
    interaction: "choices",
    questions: [
      {
        id: "control.shape",
        prompt: "Which shape do you ship?",
        detail:
          "An agent earns its loop when the next step depends on what you find and a wrong step is cheap to undo. Keep that case in mind while you look at a refund.",
        options: [
          {
            id: "agent",
            title: "An agent with a refund tool",
            summary:
              "Tools: lookup order, search policy, issue refund. The loop is capped at twelve steps.",
            holds: false,
            feedback:
              "The steps were known before the first call. The loop adds retries you did not budget, and issue_refund sits inside it. A confused step, a tool error the model “helpfully” retries, or a second turn that forgets it already refunded, and the money moves twice. Twelve is not a control. It is a longer blast radius.",
          },
          {
            id: "single",
            title: "One model call that may refund",
            summary:
              "No loop. The same call looks up the order, reads the policy, and may call issue_refund before it returns.",
            holds: false,
            feedback:
              "You removed the loop and kept the hazard. The side effect is still a tool the model can fire, and a retry of the HTTP request can fire it again if the tool itself is not idempotent. One call is not the same thing as a workflow. It is an agent with the counter set to one.",
          },
          {
            id: "workflow",
            title: "A workflow with one judgment",
            summary:
              "Code loads the order and the clauses. One model call returns a proposal. Code enforces the caps. A person confirms. Code calls the refund API.",
            holds: true,
            feedback:
              "The model is used where the text of a clause has to be applied to a case. Everything around that is deterministic and testable without a model. The recommendation can take the three seconds you allowed. The refund itself can be slower, and it does not share the recommendation’s failure modes.",
          },
        ],
      },
      {
        id: "control.output",
        prompt: "What does the model return?",
        options: [
          {
            id: "prose",
            title: "A paragraph the tool prints",
            summary: "“This order qualifies for a refund of $40 under the 30-day rule.”",
            holds: false,
            feedback:
              "You cannot enforce a cap on a paragraph, you cannot tell a lead-only case from a normal one, and you cannot check that the cited rule was among the clauses you retrieved. The UI will look finished. The checks will live in a comment.",
          },
          {
            id: "json",
            title: "Schema-checked JSON, clause id included",
            summary:
              "eligible, amount, reason, clause_id. Reject the response when the schema fails or the clause id was not retrieved.",
            holds: true,
            feedback:
              "The amount is a proposal, not a charge. The schema gives the policy engine something to enforce, and the clause id check stops a fluent citation of a rule this SKU does not have. A failed schema is an abstain: the agent sees “no recommendation,” not a best-effort paragraph.",
          },
        ],
      },
      {
        id: "control.money",
        prompt: "Who moves the money?",
        options: [
          {
            id: "model",
            title: "The model, once eligible is true",
            summary:
              "The workflow already checked. Letting the model call the API saves a click.",
            holds: false,
            feedback:
              "Eligible is a recommendation. The model is not a principal in your payment system, and it should not be on the request that reaches it. Retries, double-clicks, and a second opinion from a regenerated call are all ordinary. None of them may create a second refund.",
          },
          {
            id: "human",
            title: "A person, then a server call with an idempotency key",
            summary:
              "The confirm screen shows amount, reason, and clause. Above $200 the button requires a lead. The key is order id plus decision id.",
            holds: true,
            feedback:
              "The role check is code, not a line in the prompt. The idempotency key makes a retry return the original refund instead of creating one. The decision id is created at confirm time, once, so a regenerated proposal cannot reuse a confirmation the person has not seen. The model is absent from this hop.",
          },
        ],
      },
    ],
    principle:
      "If the steps are known, write a workflow. The model makes a judgment inside it. Side effects stay in code.",
    principleDetail:
      "An agent fits when the path depends on what you find and a wrong step is cheap to undo: open research, a draft nobody has sent, a search you can run twice. A refund is the opposite. Put the judgment in a schema you can reject, point the clause id at a passage you actually retrieved, and keep the payment call behind a person, a role check, and an idempotency key.",
  },
  {
    slug: "evals",
    number: "05",
    title: "Evals",
    question: "Which failure is expensive enough that the average is not allowed to hide it?",
    minutes: 9,
    product: "Invoice fields that get booked",
    constraints: [
      { label: "Harm", value: "A wrong total is a loss" },
      { label: "Miss", value: "A missing field is a retry" },
      { label: "Layouts", value: "Eight, plus phone photos" },
      { label: "Bar", value: "Beat today’s OCR on the slices that leak" },
    ],
    situation: [
      "The extractor reads a vendor invoice and proposes vendor, invoice number, date, currency, total, and line items. Downstream books the total. A wrong total is money. A missing invoice number is a retry a person can finish. Credit notes use the same layout and mean the opposite sign.",
      "You will not get a perfect model. You will get a gate: the conditions under which a document may skip a person. The eval is that gate, written down before you tune the prompt. Otherwise the prompt will define the test.",
    ],
    stagesCaption:
      "The ship path. A document that fails the gate is routed to a person. That route is a feature, not a fallback you hope to delete.",
    stages: [
      {
        id: "sample",
        name: "Stratified sample",
        input: "Layouts, capture type, currency, and credit notes, chosen on purpose.",
        output: "A holdout the model’s author does not tune against, and a dev set they may.",
        failure: "Thirty clean PDFs from the vendor you already handle well.",
        metric: "Count per slice. A slice with four examples cannot gate anything.",
      },
      {
        id: "labels",
        name: "Labels on the harm",
        input: "The document and a person.",
        output: "Exact total, currency, and sign. Softer fields labeled as the product actually needs them.",
        failure: "Letting a second model be the only judge of the total.",
        metric: "Label disagreements on money fields, adjudicated. The rate tells you how hard the slice really is.",
      },
      {
        id: "slices",
        name: "Slice metrics",
        input: "Predictions and labels.",
        output: "Exact match on total and currency, per slice. A separate route-to-human rate.",
        failure: "One fuzzy accuracy number for the whole set.",
        metric: "The photo slice and the credit-note slice, read on their own.",
      },
      {
        id: "gate",
        name: "Gate",
        input: "The slice metrics and the route rate.",
        output: "Ship, or do not. The gate is a line in the eval config, not a feeling in a review.",
        failure: "Shipping because the average crossed 95% while phone photos sit at 80% on the total.",
        metric: "Whether a release can pass while a critical slice fails. It should not be able to.",
      },
      {
        id: "shadow",
        name: "Shadow",
        input: "Live documents, the current OCR system, and the new extractor, side by side.",
        output: "Diffs on the critical fields. The current system still books.",
        failure: "Replacing the booking path the day the offline gate passes.",
        metric: "Live disagreement rate by slice, for a week.",
      },
      {
        id: "route",
        name: "Route",
        input: "A document the gate does not trust: low confidence, a credit note, a currency the slice has not cleared.",
        output: "A person, with the proposal shown as a proposal.",
        failure: "Auto-booking the uncertain ones because the queue was long that day.",
        metric: "Route rate, and the error rate inside the routed set once people correct it.",
      },
    ],
    interaction: "choices",
    questions: [
      {
        id: "evals.set",
        prompt: "Which set are you unwilling to ship without?",
        options: [
          {
            id: "happy",
            title: "Thirty clean PDFs from the top vendor",
            summary: "Fast to label. This is what the current rules already parse.",
            holds: false,
            feedback:
              "That set is the distribution you already handle. A new extractor will look excellent on it and say nothing about phone photos, a total printed in the footer, a second currency, or a credit note. Those are the documents the current system drops on the floor. They are the only reason to build this.",
          },
          {
            id: "stratified",
            title: "A stratified holdout, thin slices oversampled",
            summary:
              "Layout, digital versus photo, currency, and credit notes. The rare slices are a larger share of the set than of traffic.",
            holds: true,
            feedback:
              "Traffic is mostly easy digital invoices from two vendors. A random week of production will be ninety percent easy and will bless an extractor that fails on photos. Oversample the thin slices in the eval, and do not “correct” the metric back to the traffic weights when you read the gate. Keep a traffic-weighted number too, if you want to know volume. Do not let it be the gate.",
          },
        ],
      },
      {
        id: "evals.metric",
        prompt: "Which number is allowed to block a release?",
        options: [
          {
            id: "fuzzy",
            title: "One fuzzy score across all fields",
            summary: "Close strings count. The release needs a single average above the current system.",
            holds: false,
            feedback:
              "A 97% average can hide a double-digit error rate on total. Downstream books total. Fuzzy match will also mark a wrong decimal as nearly right. The average is a health metric. It is not a gate. Use it in a dashboard if it helps you notice drift. Do not let a release pass on it.",
          },
          {
            id: "field",
            title: "Exact match on total and currency, per slice",
            summary:
              "Those two fields gate the release. Other fields are reported and do not gate. Route-to-human is its own number.",
            holds: true,
            feedback:
              "The harm is a wrong amount or a wrong currency, including the sign on a credit note. A missing invoice number is a retry, so it can miss without blocking the release, and you still watch it. Read the photo slice separately from the digital slice. A gate that is allowed to pass while photos fail is not a gate on the harm.",
          },
        ],
      },
      {
        id: "evals.judge",
        prompt: "Who is allowed to score a money field?",
        options: [
          {
            id: "llm",
            title: "A second model, as the only judge",
            summary: "Cheaper than labeling. The judge scores the extractor’s JSON against the document.",
            holds: false,
            feedback:
              "The judge shares the extractor’s blind spots. A footer total that both models read as a subtotal becomes an agreement, and agreement is what you would ship on. A model judge is a reasonable assistant for a field where exact match is the wrong test, such as a normalized address, and only with a person spot-checking it. It is not a source of truth for money.",
          },
          {
            id: "labels",
            title: "Human labels for total, currency, and sign",
            summary:
              "People label the money fields. A model judge is allowed only on soft fields, and it is sampled.",
            holds: true,
            feedback:
              "Money fields are cheap to label and expensive to get wrong, which is the best possible trade for a human label. Keep the judge, if you want it, on the address line, and audit a sample so a systematic judge error cannot become the spec. When two labelers disagree on a total, that document is telling you the layout is ambiguous. Route that layout to a person in the product, too.",
          },
        ],
      },
      {
        id: "evals.ship",
        prompt: "How does a passing offline gate enter the booking path?",
        options: [
          {
            id: "replace",
            title: "Replace the current system when the holdout passes",
            summary: "Friday’s release books model totals directly.",
            holds: false,
            feedback:
              "The holdout is not next week’s invoices. A vendor will change a footer, a new currency will show up, and the offline number will not have seen it. Replacing the booking path on the day the file passes is how a good eval still ships a loss.",
          },
          {
            id: "shadow",
            title: "Shadow for a week, and book agreements only after",
            summary:
              "Run both. The current system still books. Diff the critical fields. Auto-book later only where the live slices clear the same gate. Disagreements go to a person.",
            holds: true,
            feedback:
              "Shadowing is the eval you could not write in advance, because the documents had not arrived yet. Keep the current system as the book of record until the live photo slice and the live credit-note slice clear the same bar as the holdout. v1 can auto-book the cases both systems agree on, if you want the queue to shrink. It does not auto-book a diff.",
          },
        ],
      },
    ],
    principle:
      "A ship gate is the slice and the metric that match the harm. An average hides the field that moves money.",
    principleDetail:
      "Decide the gate before you tune. Oversample the layouts that lose money, label those fields with people, and refuse a release that passes overall while a critical slice fails. A second model can help you read a soft field. It cannot be the only judge of a total. When the offline gate passes, shadow live traffic and let the current system keep booking until the live slices agree.",
  },
  {
    slug: "operate",
    number: "06",
    title: "Operate",
    question: "When the answers get worse on a Tuesday, which stage do you look at first?",
    minutes: 8,
    product: "The policy assistant, six weeks after launch",
    constraints: [
      { label: "Symptom", value: "Thumbs-down doubled, 14:10" },
      { label: "Deploy", value: "No model change" },
      { label: "Corpus", value: "One PDF replaced at 13:40" },
      { label: "Users", value: "Employees, mid-afternoon" },
    ],
    situation: [
      "The policy assistant from the retrieval brief has been live for six weeks. On Tuesday at 14:10 the thumbs-down rate doubles. Volume and latency look normal. The model id has not changed. At 13:40 someone replaced the access-control policy PDF, which is what they are supposed to do when a policy changes.",
      "You are not told that up front as a fact you may skip to. You are told the chart. The ladder below is the order of checks. A wrong check tells you what that check would actually have shown, which is usually nothing that explains Tuesday.",
    ],
    stagesCaption:
      "What you can debug is exactly what you recorded. Select a stage and read the metric before you start the ladder.",
    stages: [
      {
        id: "trace",
        name: "Trace by stage",
        input: "A request id.",
        output: "Latency, passage ids, document versions, model id, abstain bit, token counts.",
        failure: "A log line that says “answered” and stores the prose.",
        metric: "Whether a random bad request can be reconstructed a day later without rerunning it.",
      },
      {
        id: "slice",
        name: "Slice the symptom",
        input: "Thumbs-down since the step change, joined to document id.",
        output: "A rate per document, compared to the morning.",
        failure: "Staring at the global rate, which moved, and treating every document as suspect.",
        metric: "The document whose rate moved, and the ones that did not.",
      },
      {
        id: "diff",
        name: "Diff retrieval",
        input: "A fixed query set you stored, replayed against the current index.",
        output: "Passage ids and versions, before and after 13:40.",
        failure: "Editing the prompt because one quote looked old.",
        metric: "Queries that gained a second live version of the same clause.",
      },
      {
        id: "swap",
        name: "Swap the version",
        input: "The new PDF.",
        output: "One current version. The previous chunks are gone in the same commit.",
        failure: "A cleanup job that deletes old chunks later, and fails open.",
        metric: "Documents with more than one current version. The count should be zero.",
      },
      {
        id: "cache",
        name: "Cache key",
        input: "The normalized question and the corpus version.",
        output: "A hit only when both match.",
        failure: "A key of the question text alone, so Tuesday’s wrong answer survives the fix until the TTL.",
        metric: "Cache hit rate by corpus version. After a swap, the old version’s hit rate should fall to zero.",
      },
      {
        id: "pin",
        name: "Pinned query",
        input: "“CC6.1,” nightly, expecting the current clause hash.",
        output: "A failed eval when the clause is missing or duplicated.",
        failure: "Discovering the bad replace from the thumbs-down chart, hours later.",
        metric: "Time from a bad ingest to a page. It should not depend on an employee noticing.",
      },
    ],
    interaction: "incident",
    questions: [],
    principle: "Version the corpus, and log every stage. Otherwise Tuesday is a guess.",
    principleDetail:
      "The model did not change. The index grew a second opinion and kept both. You find that by slicing the symptom to a document, then diffing retrieval on queries you stored, not by restarting a service or editing a prompt. The fix is a version swap in one commit and a cache key that includes the version. The page, next time, is a pinned query that expects a clause hash, plus a downvote rate that can fire for a single document.",
  },
  {
    slug: "review",
    number: "07",
    title: "Design review",
    question: "Can you keep the budget, the context, the side effects, and the gate in one design?",
    minutes: 10,
    product: "Triage for a twelve-person support inbox",
    constraints: [
      { label: "Volume", value: "600 emails a day" },
      { label: "Team", value: "Twelve people" },
      { label: "Draft", value: "Intent, macro, reply" },
      { label: "Harm", value: "Refunds and exceptions" },
    ],
    situation: [
      "A twelve-person support team wants the inbox to classify each email, pick one of their macros, and draft a reply. Macros include ordinary how-to answers. They also include refunds and “we will make an exception.” About six hundred emails arrive a day. Most are repetitive. A few move money or promise something the policy does not.",
      "v1 is a draft a person can send. It is not an auto-reply. Use the budgets, the context, the control flow, and the gate from the earlier briefs. The note at the bottom is the design you actually chose.",
    ],
    stagesCaption:
      "One system, four decisions. The stages are the shape the decisions have to fit.",
    stages: [
      {
        id: "arrive",
        name: "Arrive",
        input: "An email, already in the queue.",
        output: "A worker job. Nobody is waiting on a click.",
        failure: "Leaving the model on the open path, so the inbox spinner is a generation.",
        metric: "Time from received to a stored draft, and open latency of that draft.",
      },
      {
        id: "intent",
        name: "Intent",
        input: "The email and a closed set of intents.",
        output: "One intent, or “unknown.” Unknown stays in the unsorted queue.",
        failure: "Forcing a macro on a mail that matched none of them.",
        metric: "Unknown rate. A sudden drop means you started guessing.",
      },
      {
        id: "allow",
        name: "Allowlist",
        input: "The intent.",
        output: "The few macros that are legal for it, plus the last three orders as fields.",
        failure: "The help center, every macro, and the customer record, stuffed into one prompt.",
        metric: "Macro id present on every non-abstain draft. Drafts that blend two macros.",
      },
      {
        id: "draft",
        name: "Draft",
        input: "The email, the allowed macros, the order fields.",
        output: "Intent, macro id, and a draft bound to that macro. Or an empty draft.",
        failure: "A reply that answers the customer without naming the macro it came from.",
        metric: "Schema failures. Those abstain.",
      },
      {
        id: "send",
        name: "Send",
        input: "A person, looking at the draft.",
        output: "They send, they edit, or they discard. Refunds and exceptions show the amount and the clause, and follow the refund workflow.",
        failure: "A confidence threshold that sends on its own.",
        metric: "Send, edit, and discard rates by intent. Discard rate is a quality signal.",
      },
      {
        id: "gate",
        name: "Gate",
        input: "Macro-id accuracy, sliced by intent, with refund and exception read alone.",
        output: "Whether a macro is even allowed to be suggested.",
        failure: "A single accuracy number for the week’s mail.",
        metric: "The money slices, the shadow diffs, and a weekly human read of ordinary drafts.",
      },
    ],
    interaction: "review",
    questions: [
      {
        id: "review.path",
        prompt: "When is the draft produced?",
        options: [
          {
            id: "sync",
            title: "When someone opens the email",
            summary:
              "One call, p95 two seconds, the draft streams into the pane they just opened.",
            holds: false,
            feedback:
              "The email has already been sitting in the queue. Nobody is waiting during those minutes, and you spent the latency on the moment a person is ready to read. The open now depends on a model. A slow provider becomes a slow inbox, which is a worse product than a missing draft.",
          },
          {
            id: "precompute",
            title: "On arrival, in a worker",
            summary:
              "Store the intent, the macro id, and the draft. Opening the email is a read. A later “shorten this” can be a small call of its own.",
            holds: true,
            feedback:
              "Generate while the mail is waiting, not while the person is. The open is a database read, so it stays fast when the model is not. If the team wants “make this firmer,” that is a second, smaller call on the click path, and it should rewrite the draft they already have. It should not re-pick the macro.",
          },
        ],
      },
      {
        id: "review.context",
        prompt: "What is the model allowed to see?",
        options: [
          {
            id: "stuff",
            title: "The help center, every macro, and the customer",
            summary: "More context is safer. The model can choose what it needs.",
            holds: false,
            feedback:
              "It will blend three macros and a help-center article into a reply that matches none of them, and you will have no macro id to measure. “More context” here is how you lose the ability to say which answer was proposed. The customer record also contains notes the drafter does not need and should not quote.",
          },
          {
            id: "allowlist",
            title: "The macros legal for that intent, and the last three orders",
            summary:
              "Orders are structured fields. The draft must name a macro id from the allowlist. If none fit, the draft is empty and the mail stays unsorted.",
            holds: true,
            feedback:
              "The allowlist is what makes the draft evalable: a macro id is a label, and a reply with no macro id is an abstain. Three orders answer “where is my shipment” without a biography of the customer. Unknown intent does not get a best guess. It stays in the queue, which is the honest state.",
          },
        ],
      },
      {
        id: "review.send",
        prompt: "Who is allowed to send?",
        options: [
          {
            id: "auto",
            title: "The model, above a confidence of 0.9",
            summary:
              "Including refunds, if the score is high enough. The team is small and the queue is the bottleneck.",
            holds: false,
            feedback:
              "Confidence is not a control, and 0.9 is not a policy. A refund and an exception are side effects with a person and a clause behind them, the same shape as the refund workflow: a proposal, a role, a confirm, an idempotency key. Auto-sending them because the queue is long is how a triage tool becomes an unsupervised payments tool. v1 does not auto-send.",
          },
          {
            id: "human",
            title: "A person sends. Money requires the refund workflow.",
            summary:
              "Every reply is sent by someone. Refund and exception drafts show the amount and the clause, and the refund itself goes through code, role, and an idempotency key.",
            holds: true,
            feedback:
              "The draft is a proposal sitting in the composer. Edit and discard are first-class, and their rates tell you whether the macro was right. Money does not take a shortcut through this inbox. It reuses the workflow where a person confirms and the payment call is idempotent. Tone-only intents can be considered for auto-send later. They are not in this release.",
          },
        ],
      },
      {
        id: "review.gate",
        prompt: "What has to be true before a macro may be suggested?",
        options: [
          {
            id: "average",
            title: "Ninety percent accuracy on a week of mail",
            summary: "One number. If the week clears it, turn suggestions on for every intent.",
            holds: false,
            feedback:
              "Refunds are a small slice of six hundred emails. They will not move a weekly average, and they are the harm. A model that is perfect at password resets and wrong at refunds passes this bar. You would turn on the dangerous macro because the easy mail carried it.",
          },
          {
            id: "slices",
            title: "Macro-id accuracy by intent, gated on the money slices",
            summary:
              "Refund and exception have a hard gate. Shadow for five days. A person reads a weekly sample of ordinary drafts. No auto-send in v1.",
            holds: true,
            feedback:
              "Suggest a macro only where its slice has earned it. The money slices gate themselves: if exception-identification is weak, that macro is not offered and those emails stay manual. Five shadow days show you the intents the holdout did not contain. The weekly read is how you notice a polite draft that picked the right macro and still said the wrong thing. It is an audit, not the page.",
          },
        ],
      },
    ],
    principle:
      "A production feature is a workflow with a judgment in it, operated against a gate that matches the harm.",
    principleDetail:
      "Precompute the work nobody is waiting on. Give the model an allowlist, not a pile, so the output names a macro you can measure. Keep refunds and exceptions behind a person and a code check. Gate the slices that lose money, shadow before you trust live mail, and leave auto-send out of the first release.",
  },
]

export function getBrief(slug: string): Brief | undefined {
  return briefs.find((brief) => brief.slug === slug)
}

export function briefIndex(slug: string): number {
  return briefs.findIndex((brief) => brief.slug === slug)
}
