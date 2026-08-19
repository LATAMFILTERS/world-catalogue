// HERMES — minimal git plumbing for durable state on a dedicated branch
// (hermes-state). GitHub Actions runners are ephemeral: anything written
// only to the runner's local filesystem is gone the moment the job ends.
// The only thing that survives between runs is whatever was actually
// pushed to a remote ref.
//
// Every operation here uses an isolated temporary index file and plumbing
// commands (hash-object, update-index, write-tree, commit-tree, push
// <sha>:refs/heads/<branch>) — never `git checkout`, `git add`, or a write
// to the real .git/index or working tree. This module cannot modify
// whatever branch happens to be checked out (main); it only ever creates
// new commits from scratch and moves a single remote ref.
//
// Concurrency safety: commitFilesAndPush always pushes a plain (non-force)
// ref update whose new commit's parent is the caller-supplied parentSha. If
// the remote branch has moved since parentSha was read — another promotion
// or rollback ran concurrently — git itself rejects the push as
// non-fast-forward. There is no separate "check, then push" race: the
// remote is the single source of truth and enforces this atomically.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const COMMITTER_NAME = 'HERMES Automation';
const COMMITTER_EMAIL = 'hermes-automation@elimfilters.local';

function git(args, { cwd, input, env } = {}) {
  return execFileSync('git', args, {
    cwd,
    input,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: input !== undefined ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe']
  });
}

/** Returns the remote branch's commit sha, or null if the branch does not exist on the remote. */
export function resolveRemoteBranchSha({ cwd, remote, branch }) {
  let out;
  try {
    out = git(['ls-remote', '--exit-code', remote, `refs/heads/${branch}`], { cwd });
  } catch (error) {
    if (error.status === 2) return null; // --exit-code: no matching ref on the remote
    throw error;
  }
  const line = out.trim().split('\n')[0] || '';
  return line ? line.split('\t')[0] : null;
}

/**
 * Fetches the branch tip (if it exists) so its objects are available
 * locally for `git show`/`git ls-tree`. Returns the tip sha, or null if the
 * branch does not exist on the remote at all — callers must treat that as
 * "no state yet", never fabricate a default.
 */
export function fetchStateBranch({ cwd, remote, branch }) {
  const sha = resolveRemoteBranchSha({ cwd, remote, branch });
  if (!sha) return null;
  // The local ref name is disposable and private to this module — only the
  // fetched objects (now in .git/objects) matter to readFileAtCommit/
  // listTreeAtCommit below, which address content purely by commit sha.
  git(['fetch', '--quiet', remote, `+${branch}:refs/hermes-state-fetch/${branch}`], { cwd });
  return sha;
}

/** Reads a file's content at a given commit. Returns null if it does not exist in that tree. */
export function readFileAtCommit({ cwd, sha, filePath }) {
  try {
    return git(['show', `${sha}:${filePath}`], { cwd });
  } catch {
    return null;
  }
}

/** Lists file names directly under a directory at a given commit. Empty array if the directory doesn't exist. */
export function listTreeAtCommit({ cwd, sha, dirPath }) {
  const out = git(['ls-tree', '--name-only', sha, `${dirPath}/`], { cwd });
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('/').pop());
}

/**
 * Builds a brand-new commit containing exactly `files` (the full desired
 * state of the branch — nothing implicit carries over from the parent) and
 * pushes it, non-force, to remote:refs/heads/branch.
 *
 * files: [{ path: 'state/source-baseline.json', content: '...' }, ...]
 * parentSha: the commit this new one is based on, or null to create the
 *   branch fresh (orphan commit, no parent).
 *
 * Returns { commitSha, treeSha } on success. Throws on failure; if the
 * failure was a rejected (non-fast-forward) push — someone else moved the
 * branch first — the thrown error has `.conflict = true`.
 */
export function commitFilesAndPush({ cwd, remote, branch, parentSha, files, message }) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-state-index-'));
  const indexFile = path.join(tmpDir, 'index');
  try {
    const indexEnv = { GIT_INDEX_FILE: indexFile };
    for (const file of files) {
      const blobSha = git(['hash-object', '-w', '-t', 'blob', '--stdin'], { cwd, input: file.content }).trim();
      git(['update-index', '--add', '--cacheinfo', `100644,${blobSha},${file.path}`], { cwd, env: indexEnv });
    }
    const treeSha = git(['write-tree'], { cwd, env: indexEnv }).trim();

    const commitArgs = ['commit-tree', treeSha];
    if (parentSha) commitArgs.push('-p', parentSha);
    commitArgs.push('-m', message);
    const commitEnv = {
      GIT_AUTHOR_NAME: COMMITTER_NAME, GIT_AUTHOR_EMAIL: COMMITTER_EMAIL,
      GIT_COMMITTER_NAME: COMMITTER_NAME, GIT_COMMITTER_EMAIL: COMMITTER_EMAIL
    };
    const commitSha = git(commitArgs, { cwd, env: commitEnv }).trim();

    try {
      git(['push', remote, `${commitSha}:refs/heads/${branch}`], { cwd });
    } catch (error) {
      const stderr = String(error.stderr || error.message || '');
      const wrapped = new Error(`git push rejected: ${stderr.trim() || error.message}`);
      wrapped.conflict = /non-fast-forward|fetch first|stale info|already exists|rejected/i.test(stderr);
      wrapped.commitSha = commitSha;
      throw wrapped;
    }
    return { commitSha, treeSha };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
