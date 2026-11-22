import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { getBrief, inFlight, trafficCases } from "./course"
import { gradePack, briefHolds, isBriefComplete, emptyProgress } from "./grade"

describe("gradePack", () => {
  it("holds a selected pack under the allowance", () => {
    const grade = gradePack(["spine", "touch", "opps", "tickets", "usage"])
    assert.equal(grade.holds, true)
    assert.ok(grade.tokens < grade.budget)
    assert.ok(grade.orderNote)
  })

  it("breaks when the NDA is included", () => {
    const grade = gradePack(["spine", "touch", "opps", "tickets", "nda"])
    assert.equal(grade.holds, false)
    assert.ok(grade.flags.some((flag) => flag.title === "Legal text is in the prompt"))
  })

  it("breaks an empty pack", () => {
    assert.equal(gradePack([]).holds, false)
  })

  it("breaks when support or open deals are missing", () => {
    const grade = gradePack(["spine", "touch"])
    assert.equal(grade.holds, false)
    assert.ok(grade.flags.some((flag) => flag.tone === "break"))
  })
})

describe("briefs", () => {
  it("files a budget design only after both decisions", () => {
    const partial = {
      ...emptyProgress,
      choices: { "budgets.stack": "small" },
    }
    assert.equal(isBriefComplete("budgets", partial), false)
    const done = {
      ...emptyProgress,
      choices: { "budgets.stack": "small", "budgets.cut": "cap-output" },
    }
    assert.equal(isBriefComplete("budgets", done), true)
    assert.equal(briefHolds("budgets", done), true)
  })

  it("does not hold a large-model stack", () => {
    const done = {
      ...emptyProgress,
      choices: { "budgets.stack": "large", "budgets.cut": "cap-output" },
    }
    assert.equal(briefHolds("budgets", done), false)
  })

  it("completes the incident only after every check", () => {
    assert.equal(isBriefComplete("operate", { ...emptyProgress, incidentStep: 3 }), false)
    assert.equal(isBriefComplete("operate", { ...emptyProgress, incidentStep: 4 }), true)
    assert.equal(briefHolds("operate", { ...emptyProgress, incidentStep: 4 }), true)
  })
})

describe("traffic", () => {
  it("computes in-flight concurrency from rate and hold time", () => {
    const byId = Object.fromEntries(trafficCases.map((item) => [item.id, item]))
    assert.equal(inFlight(byId.policy.rps, byId.policy.seconds), 8)
    assert.equal(inFlight(byId.inbox.rps, byId.inbox.seconds), 8)
    assert.equal(inFlight(byId.public.rps, byId.public.seconds), 480)
  })

  it("holds the fleet for 480 in flight and rejects it for the policy spike", () => {
    const brief = getBrief("traffic")
    assert.ok(brief)
    const policy = brief.questions.find((question) => question.id === "traffic.policy")
    const pub = brief.questions.find((question) => question.id === "traffic.public")
    assert.equal(policy?.options.find((option) => option.id === "pair")?.holds, true)
    assert.equal(policy?.options.find((option) => option.id === "cluster")?.holds, false)
    assert.equal(pub?.options.find((option) => option.id === "fleet")?.holds, true)
    assert.equal(pub?.options.find((option) => option.id === "serverless")?.holds, false)
    const done = {
      ...emptyProgress,
      choices: {
        "traffic.policy": "pair",
        "traffic.inbox": "workers",
        "traffic.public": "fleet",
        "traffic.balancer": "least",
      },
    }
    assert.equal(briefHolds("traffic", done), true)
  })
})
