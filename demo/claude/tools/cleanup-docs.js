#!/usr/bin/env node

/**
 * Automated documentation cleanup script
 * Removes intermediate/redundant .md files from docs folder
 * Keeps only essential documentation
 *
 * Usage: node .claude/tools/cleanup-docs.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(process.cwd(), 'docs', 'planning');

// Files to keep (essential documentation)
const KEEP_FILES = [
  'README.md',
  'POC-FINAL-STATUS.md',
  'recruitment-test-plan.md',
  'stage4-locators.md',
  'IMPLEMENTATION-READY.md',
  'stage4-locators.json', // data file
];

// Patterns of files to remove (intermediate checkpoints)
const REMOVE_PATTERNS = [
  'POC-STATUS.md',
  'STAGE4-COMPLETE.md',
  'STAGES-4-6-COMPLETE.md',
  'implementation-summary.md',
  '*-CHECKPOINT.md',
  '*-TEMP.md',
  'DRAFT-*.md',
];

function cleanup() {
  console.log('\n🧹 Starting documentation cleanup...\n');

  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`❌ Directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  // Get all files in docs/planning
  const allFiles = fs.readdirSync(DOCS_DIR);
  let removedCount = 0;
  let keptCount = 0;

  allFiles.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file);
    const isFile = fs.statSync(filePath).isFile();

    if (!isFile) return; // Skip directories

    // Check if file should be kept
    if (KEEP_FILES.includes(file)) {
      console.log(`✅ KEEP: ${file}`);
      keptCount++;
      return;
    }

    // Check if file matches remove patterns
    const shouldRemove = REMOVE_PATTERNS.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
        return regex.test(file);
      }
      return file === pattern;
    });

    if (shouldRemove) {
      try {
        fs.unlinkSync(filePath);
        console.log(`❌ REMOVED: ${file}`);
        removedCount++;
      } catch (err) {
        console.error(`⚠️  ERROR removing ${file}: ${err.message}`);
      }
    } else {
      console.log(`⏸️  UNKNOWN: ${file} (not in keep/remove lists)`);
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Cleanup Summary:`);
  console.log(`   Kept:    ${keptCount} files`);
  console.log(`   Removed: ${removedCount} files`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (removedCount > 0) {
    console.log('✅ Documentation cleanup complete!\n');
  } else {
    console.log('ℹ️  No intermediate files to remove.\n');
  }
}

// Run cleanup
cleanup();
