#!/usr/bin/env sh
# Prints a hash of every committed file the WASM bundle is built from (the crates it links,
# `config/`, and the lockfile). `src/lib/wasm/INPUTS.sha256` stores it when the bundle is built;
# CI recomputes it and fails if they differ, i.e. if the Rust changed but the bundle was not
# rebuilt. We hash inputs instead of comparing .wasm bytes because the binary is not guaranteed
# to be byte-identical across operating systems (paths end up in it).
#
# Rebuild: `sh crates/cw-wasm/build.sh` (commit the Rust changes first: the hash reads the git index).
set -eu
cd "$(dirname "$0")/../.."
git ls-files -s -- crates/cw-domain crates/cw-classify crates/cw-lexicon crates/cw-match \
    crates/cw-cv crates/cw-wasm config Cargo.toml Cargo.lock \
  | grep -v '/tests/' | grep -v 'inputs-hash.sh' | grep -v 'build.sh' \
  | sha256sum | cut -d' ' -f1
