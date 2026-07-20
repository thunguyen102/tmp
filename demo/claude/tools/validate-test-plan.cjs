#!/usr/bin/env node
/**
 * validate-test-plan.cjs — Pre-delivery validation for test plan markdown files
 *
 * Ensures test plan files pass all consistency checks before being delivered to end users.
 * Auto-runs before finalizing any test plan documentation.
 *
 * Usage:
 *   node .claude/tools/validate-test-plan.cjs <path-to-testplan.md>
 *
 * Exits 0 (PASS) or 1 (FAIL) for CI/CD integration.
 */

const fs = require("fs");
const path = require("path");

function main(filePath) {
  // Validate file exists
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`📋 Validating: ${path.basename(filePath)}\n`);

  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const failures = [];
  const fail = (msg) => failures.push(msg);

  // ---- 1. Parse the Traceability Matrix (## 5 section): TC ID -> {module, priority} ----
  const matrix = new Map();
  let currentModule = null;
  let inMatrixSection = false;
  const rowRe = /^\|\s*(TC-[A-Za-z0-9-]+)\s*\|(.*)\|(.*)\|(.*)\|\s*$/;
  const nearMissRowRe = /^\|\s*([A-Za-z][A-Za-z0-9-]*-\d+)\s*\|(.*)\|(.*)\|(.*)\|\s*$/;
  const nearMissIds = new Set();

  for (const l of lines) {
    if (/^##\s*5\b/.test(l.trim())) {
      inMatrixSection = true;
      continue;
    }
    if (/^##\s*6\b/.test(l.trim())) {
      inMatrixSection = false;
    }
    if (!inMatrixSection) continue;

    const mh = l.match(/^###\s+(.*)$/);
    if (mh) {
      currentModule = mh[1].trim();
      continue;
    }

    const rm = l.match(rowRe);
    if (rm) {
      const tcid = rm[1].trim();
      const prioField = rm[3];
      const pm = prioField.match(/(Critical|High|Medium|Low)/);
      const prio = pm ? pm[1] : null;

      if (!prio) {
        fail(`Matrix row for ${tcid} has no recognizable priority (Critical/High/Medium/Low).`);
      }

      matrix.set(tcid, { module: currentModule, priority: prio });
      continue;
    }

    const nm = l.match(nearMissRowRe);
    if (nm && !nm[1].startsWith("TC-")) nearMissIds.add(nm[1].trim());
  }

  if (matrix.size === 0) {
    if (nearMissIds.size > 0) {
      const sample = [...nearMissIds].slice(0, 5);
      fail(
        `Found ${nearMissIds.size} row(s) with test-case-like format but ID prefix is not 'TC-': ${JSON.stringify(sample)}. ` +
        `Rename every case ID to start with 'TC-' and rerun.`
      );
    } else {
      fail(
        "Found zero TC rows under '## 5' Traceability Matrix section. " +
        "Check section numbering and format: '## 5' heading, '### ModuleName' subheadings, and '| TC-ID | Title | Priority | Type |' rows."
      );
    }
    return printReport(failures, filePath);
  }

  const realTotal = matrix.size;

  // ---- 2. Module -> Requirement Map (## 2 section) claimed counts ----
  const claimedModuleCounts = new Map();
  let inMapSection = false;

  for (const l of lines) {
    if (/^##\s*2\b/.test(l.trim())) {
      inMapSection = true;
      continue;
    }
    if (/^##\s*3\b/.test(l.trim())) {
      inMapSection = false;
    }
    if (!inMapSection) continue;

    const trimmed = l.trim();
    if (!trimmed.startsWith("|")) continue;

    const cells = trimmed
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());

    if (
      cells.length >= 3 &&
      cells[0] &&
      !cells[0].startsWith("-") &&
      !/Module/i.test(cells[0])
    ) {
      const moduleName = cells[0];
      const tcCountField = cells[cells.length - 1];
      const cm = tcCountField.match(/\d+/);
      if (cm) claimedModuleCounts.set(moduleName, parseInt(cm[0], 10));
    }
  }

  const realModuleCounts = new Map();
  for (const { module } of matrix.values()) {
    if (!module) continue;
    realModuleCounts.set(module, (realModuleCounts.get(module) || 0) + 1);
  }

  for (const [mapName, claimedN] of claimedModuleCounts.entries()) {
    let matchedHeading = null;
    for (const heading of realModuleCounts.keys()) {
      const headingTail = heading.split("—").pop().trim().toLowerCase();
      if (
        heading.toLowerCase().includes(mapName.toLowerCase()) ||
        mapName.toLowerCase().includes(headingTail)
      ) {
        matchedHeading = heading;
        break;
      }
    }

    if (matchedHeading === null) {
      fail(
        `Module Map row '${mapName}' (claims ${claimedN} cases) ` +
        `has no matching '### ...' heading in Traceability Matrix. Check spelling.`
      );
      continue;
    }

    const realN = realModuleCounts.get(matchedHeading);
    if (realN !== claimedN) {
      fail(
        `Module '${mapName}': Map claims ${claimedN}, ` +
        `but matrix has ${realN} rows under heading '${matchedHeading}'.`
      );
    }
  }

  // ---- 3. Coverage Summary (## 6): Count vs listed IDs vs real matrix priority ----
  const realPriorityIds = { Critical: [], High: [], Medium: [], Low: [] };
  for (const [tcid, { priority }] of matrix.entries()) {
    if (priority) realPriorityIds[priority].push(tcid);
  }

  const covRe = /\|\s*(?:🔴|🟡|🟢|🔵)?\s*(Critical|High|Medium|Low)\s*\|\s*(\d+)\s*\|(.*)\|/;
  const coveredPriorities = new Set();

  for (const l of lines) {
    const cm = l.trim().match(covRe);
    if (cm) {
      const prio = cm[1];
      const claimedCount = parseInt(cm[2], 10);
      const idsField = cm[3];
      const listedIds = idsField
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.startsWith("TC-"));

      coveredPriorities.add(prio);

      if (claimedCount !== listedIds.length) {
        fail(
          `Coverage Summary '${prio}': Count says ${claimedCount}, ` +
          `but ${listedIds.length} IDs are listed.`
        );
      }

      const realIds = new Set(realPriorityIds[prio] || []);
      const listedSet = new Set(listedIds);
      const missingFromList = [...realIds].filter((x) => !listedSet.has(x));
      const extraInList = [...listedSet].filter((x) => !realIds.has(x));

      if (missingFromList.length)
        fail(
          `Coverage Summary '${prio}': Missing ${JSON.stringify(missingFromList)}`
        );
      if (extraInList.length)
        fail(
          `Coverage Summary '${prio}': Extra ${JSON.stringify(extraInList)}`
        );
    }
  }

  for (const [prio, ids] of Object.entries(realPriorityIds)) {
    if (ids.length && !coveredPriorities.has(prio)) {
      fail(
        `Matrix has ${ids.length} '${prio}' case(s) ` +
        `but Coverage Summary has no '${prio}' row: ${JSON.stringify(ids)}`
      );
    }
  }

  // ---- 4. Vertical Slices (## 7): header count vs list, and full coverage ----
  const sliceRe = /###\s+(Slice\s*\d+[^(]*)\((\d+)\s*cases?\)\s*\n\*\*Cases:\*\*(.*?)(?=\n###|\n##|$)/gs;
  const idToSlices = new Map();
  let sliceFound = false;
  let m;

  while ((m = sliceRe.exec(text)) !== null) {
    sliceFound = true;
    const name = m[1].trim();
    const claimedN = parseInt(m[2], 10);
    const ids = m[3]
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.startsWith("TC-"));

    if (claimedN !== ids.length) {
      fail(
        `${name} header says '(${claimedN} cases)' ` +
        `but lists ${ids.length} case IDs.`
      );
    }

    for (const i of ids) {
      if (!idToSlices.has(i)) idToSlices.set(i, []);
      idToSlices.get(i).push(name);
    }
  }

  if (!sliceFound) {
    fail(
      "No '### Slice N ... (n cases)' blocks with '**Cases:**' line found. " +
      "Check section 7 formatting."
    );
  } else {
    const allIds = [...matrix.keys()];
    const missing = allIds.filter(
      (i) => !idToSlices.has(i) || idToSlices.get(i).length === 0
    );
    const dup = allIds.filter((i) => idToSlices.has(i) && idToSlices.get(i).length >= 2);

    if (missing.length)
      fail(
        `Case(s) in matrix but absent from ALL slices: ${JSON.stringify(missing)}`
      );
    if (dup.length)
      fail(
        `Case(s) duplicated across slices: ${JSON.stringify(
          dup.map((i) => [i, idToSlices.get(i)])
        )}`
      );

    const unknown = [...idToSlices.keys()].filter((i) => !matrix.has(i));
    if (unknown.length)
      fail(
        `Slice(s) reference TC ID(s) not in matrix: ${JSON.stringify(unknown)}`
      );
  }

  // ---- 5. Grand total restated consistently ----
  const totalRe1 = /(\d+)\s*test\s*cases?/gi;
  const totalRe2 = /Total\*?\*?\s*\|\s*\*?\*?(\d+)/gi;
  const wrongMentions = new Set();
  let tm;

  while ((tm = totalRe1.exec(text)) !== null) {
    const v = parseInt(tm[1], 10);
    if (v !== realTotal) wrongMentions.add(v);
  }

  while ((tm = totalRe2.exec(text)) !== null) {
    const v = parseInt(tm[1], 10);
    if (v !== realTotal) wrongMentions.add(v);
  }

  if (wrongMentions.size) {
    fail(
      `Real case count is ${realTotal}, but also restated as ${[...wrongMentions].join(", ")} — ` +
      `every restatement must say ${realTotal}.`
    );
  }

  // Print result
  console.log(`📊 Traceability Matrix: ${realTotal} cases across ${realModuleCounts.size} modules.\n`);
  printReport(failures, filePath);
}

function printReport(failures, filePath) {
  if (failures.length === 0) {
    console.log("✅ ALL CHECKS PASSED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Test plan is ready for delivery to end users!\n");
    console.log(`✓ Module counts reconciled`);
    console.log(`✓ Priority distribution validated`);
    console.log(`✓ Slice coverage complete`);
    console.log(`✓ Total counts consistent\n`);
    process.exit(0);
  } else {
    console.log(`❌ ${failures.length} VALIDATION ERROR(S):\n`);
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f}\n`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  Fix errors and rerun validation before delivery.\n");
    process.exit(1);
  }
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: node .claude/tools/validate-test-plan.cjs <path-to-testplan.md>");
    process.exit(2);
  }
  main(filePath);
}

module.exports = { validateTestPlan: main };
