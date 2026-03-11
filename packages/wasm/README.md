# @manga/wasm — WASM Descramble Module

## Overview

This package provides the image descrambling module used by the manga reader.
Pages are tile-scrambled server-side and must be reassembled client-side before display.

The TypeScript stub in `src/descramble.ts` acts as a shim — the frontend compiles
without the real WASM, but images will display scrambled until the WASM is built.

## Building the WASM module (Rust)

### Prerequisites
```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

### Project structure (to create)
```
packages/wasm/
  rust/
    Cargo.toml
    src/
      lib.rs          # Tile descramble algorithm
```

### lib.rs skeleton
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn descramble(
    pixels: &[u8],
    width: u32,
    height: u32,
    tile_w: u32,
    tile_h: u32,
    seed: u32,
) -> Vec<u8> {
    // Implement tile reordering based on seed
    todo!()
}
```

### Build
```sh
cd packages/wasm/rust
wasm-pack build --target web --out-dir ../pkg
```

This outputs `../pkg/descramble_bg.wasm` and JS bindings.

Update `src/descramble.ts` to load from `./pkg/descramble_bg.wasm`.

## Algorithm (Tile Scramble v1)

1. Divide image into `tileWidth × tileHeight` tiles
2. Generate permutation using `seed` as LCG seed
3. Reorder tiles according to permutation (scramble = forward, descramble = inverse)
4. Watermark is embedded in the alpha channel of tile[0]
