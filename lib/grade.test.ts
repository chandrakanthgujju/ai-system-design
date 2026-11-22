import assert from "node:assert/strict"
import { describe, it } from "node:test"
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
