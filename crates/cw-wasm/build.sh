#!/usr/bin/env sh
# Rebuilds the browser package in `src/lib/wasm/` and records the hash of its inputs.
# Needs: rustup target add wasm32-unknown-unknown, and wasm-pack.
set -eu
cd "$(dirname "$0")/../.."
wasm-pack build crates/cw-wasm --release --target web --out-dir ../../src/lib/wasm --out-name cw_wasm
# wasm-pack writes a `.gitignore` containing `*` and a package.json we do not need to publish.
rm -f src/lib/wasm/.gitignore
git add -A crates config Cargo.toml Cargo.lock >/dev/null 2>&1 || true
sh crates/cw-wasm/inputs-hash.sh > src/lib/wasm/INPUTS.sha256
echo "bundle: $(wc -c < src/lib/wasm/cw_wasm_bg.wasm) bytes, $(gzip -9 -c src/lib/wasm/cw_wasm_bg.wasm | wc -c) gzipped"
