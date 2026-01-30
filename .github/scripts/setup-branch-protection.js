#!/usr/bin/env node

/**
 * GitHub Branch Protection Setup Script
 *
 * This script configures branch protection rules for the repository using the GitHub API.
 * It sets up protection for main and develop branches following GitFlow best practices.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node .github/scripts/setup-branch-protection.js [owner] [repo]
 *
 * Or using environment:
 *   GITHUB_TOKEN=<token> GITHUB_REPOSITORY=owner/repo node .github/scripts/setup-branch-protection.js
 *
 * Required token permissions:
 *   - repo (Full control of private repositories)
 *   - admin:repo_hook (for branch protection)
 */

const https = require('https');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

// Parse owner/repo from args or environment
let owner, repo;
if (process.argv[2] && process.argv[3]) {
  owner = process.argv[2];
  repo = process.argv[3];
} else if (GITHUB_REPOSITORY) {
  [owner, repo] = GITHUB_REPOSITORY.split('/');
} else {
  console.error('Usage: GITHUB_TOKEN=<token> node setup-branch-protection.js <owner> <repo>');
  console.error(
    '   Or: GITHUB_TOKEN=<token> GITHUB_REPOSITORY=owner/repo node setup-branch-protection.js'
  );
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.error('Create a token at: https://github.com/settings/tokens');
  console.error('Required scopes: repo, admin:repo_hook');
  process.exit(1);
}

console.log(`\n🔧 Setting up branch protection for ${owner}/${repo}\n`);

/**
 * Make a GitHub API request
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {object} [body] - Request body
 * @returns {Promise<object>} Response data
 */
function githubRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'branch-protection-setup',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          const error = new Error(`GitHub API Error: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.response = data ? JSON.parse(data) : {};
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Branch protection configuration for main branch
 */
const mainBranchProtection = {
  required_status_checks: {
    strict: true,
    contexts: ['Lint', 'Test (Node 18)', 'Test (Node 20)', 'Test (Node 22)', 'Build Check'],
  },
  enforce_admins: false,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 1,
    require_last_push_approval: true,
  },
  restrictions: null,
  required_linear_history: true,
  allow_force_pushes: false,
  allow_deletions: false,
  block_creations: false,
  required_conversation_resolution: true,
  lock_branch: false,
  allow_fork_syncing: true,
};

/**
 * Branch protection configuration for develop branch
 */
const developBranchProtection = {
  required_status_checks: {
    strict: false, // Less strict for develop
    contexts: ['Lint', 'Test (Node 20)'], // Minimal checks for faster iteration
  },
  enforce_admins: false,
  required_pull_request_reviews: {
    dismiss_stale_reviews: false,
    require_code_owner_reviews: false,
    required_approving_review_count: 1,
    require_last_push_approval: false,
  },
  restrictions: null,
  required_linear_history: false, // Allow merge commits
  allow_force_pushes: false,
  allow_deletions: false,
  block_creations: false,
  required_conversation_resolution: false,
  lock_branch: false,
  allow_fork_syncing: true,
};

/**
 * Set up branch protection for a branch
 * @param {string} branch - Branch name
 * @param {object} protection - Protection configuration
 */
async function setupBranchProtection(branch, protection) {
  const path = `/repos/${owner}/${repo}/branches/${branch}/protection`;

  try {
    // First, check if the branch exists
    await githubRequest('GET', `/repos/${owner}/${repo}/branches/${branch}`);
    console.log(`✓ Branch '${branch}' exists`);

    // Apply protection rules
    await githubRequest('PUT', path, protection);
    console.log(`✓ Branch protection applied to '${branch}'`);

    // Get and display current protection
    const current = await githubRequest('GET', path);
    console.log(
      `  - Required reviews: ${current.required_pull_request_reviews?.required_approving_review_count || 0}`
    );
    console.log(
      `  - Required status checks: ${current.required_status_checks?.contexts?.length || 0}`
    );
    console.log(`  - Enforce admins: ${current.enforce_admins?.enabled || false}`);
    console.log(`  - Linear history: ${current.required_linear_history?.enabled || false}`);
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠ Branch '${branch}' does not exist yet - skipping`);
      console.log(`  Create it first, then re-run this script`);
    } else if (error.statusCode === 403) {
      console.error(`✗ Permission denied for '${branch}'`);
      console.error(`  Ensure your token has 'repo' and 'admin:repo_hook' permissions`);
    } else {
      console.error(`✗ Failed to protect '${branch}': ${error.message}`);
      if (error.response?.message) {
        console.error(`  GitHub says: ${error.response.message}`);
      }
    }
  }
}

/**
 * Create rulesets for feature/release/hotfix branches
 */
async function setupBranchRulesets() {
  const rulesets = [
    {
      name: 'Feature Branch Rules',
      target: 'branch',
      enforcement: 'active',
      conditions: {
        ref_name: {
          include: ['refs/heads/feature/**'],
          exclude: [],
        },
      },
      rules: [
        { type: 'deletion' }, // Prevent deletion
        {
          type: 'required_status_checks',
          parameters: {
            strict_required_status_checks_policy: false,
            required_status_checks: [{ context: 'Lint' }, { context: 'Test (Node 20)' }],
          },
        },
      ],
    },
    {
      name: 'Release Branch Rules',
      target: 'branch',
      enforcement: 'active',
      conditions: {
        ref_name: {
          include: ['refs/heads/release/**'],
          exclude: [],
        },
      },
      rules: [
        { type: 'deletion' },
        { type: 'non_fast_forward' }, // Prevent force push
        {
          type: 'required_status_checks',
          parameters: {
            strict_required_status_checks_policy: true,
            required_status_checks: [
              { context: 'Lint' },
              { context: 'Test (Node 18)' },
              { context: 'Test (Node 20)' },
              { context: 'Test (Node 22)' },
              { context: 'Build Check' },
            ],
          },
        },
      ],
    },
    {
      name: 'Hotfix Branch Rules',
      target: 'branch',
      enforcement: 'active',
      conditions: {
        ref_name: {
          include: ['refs/heads/hotfix/**'],
          exclude: [],
        },
      },
      rules: [
        { type: 'deletion' },
        {
          type: 'required_status_checks',
          parameters: {
            strict_required_status_checks_policy: true,
            required_status_checks: [
              { context: 'Lint' },
              { context: 'Test (Node 20)' },
              { context: 'Build Check' },
            ],
          },
        },
      ],
    },
  ];

  console.log('\n📋 Setting up branch rulesets...\n');

  for (const ruleset of rulesets) {
    try {
      // Check if ruleset already exists
      const existing = await githubRequest('GET', `/repos/${owner}/${repo}/rulesets`);
      const existingRuleset = existing.find((r) => r.name === ruleset.name);

      if (existingRuleset) {
        // Update existing ruleset
        await githubRequest(
          'PUT',
          `/repos/${owner}/${repo}/rulesets/${existingRuleset.id}`,
          ruleset
        );
        console.log(`✓ Updated ruleset: ${ruleset.name}`);
      } else {
        // Create new ruleset
        await githubRequest('POST', `/repos/${owner}/${repo}/rulesets`, ruleset);
        console.log(`✓ Created ruleset: ${ruleset.name}`);
      }
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 403) {
        console.log(`⚠ Rulesets not available (requires GitHub Pro/Team/Enterprise)`);
        console.log(`  Branch rulesets will be skipped`);
        break;
      } else {
        console.error(`✗ Failed to create ruleset '${ruleset.name}': ${error.message}`);
      }
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📌 Setting up main branch protection...\n');
  await setupBranchProtection('main', mainBranchProtection);

  console.log('\n📌 Setting up develop branch protection...\n');
  await setupBranchProtection('develop', developBranchProtection);

  await setupBranchRulesets();

  console.log('\n✅ Branch protection setup complete!\n');
  console.log('📖 Documentation: See docs/RELEASING.md for release workflow details');
  console.log(
    '🔗 View settings: https://github.com/' + owner + '/' + repo + '/settings/branches\n'
  );
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
