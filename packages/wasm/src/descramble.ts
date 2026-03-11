/**
 * WASM Descramble Interface — TypeScript stub
 *
 * This module provides a TypeScript stub for the WASM descramble module.
 * The actual WASM module is compiled from Rust/C. Until the WASM build is ready,
 * this stub allows the frontend to compile and provides a fallback identity transform.
 *
 * See README.md for compilation instructions.
 */

import type { ScrambleMetadata } from '@manga/shared';

export interface DescrambleModule {
  /**
   * Descramble an ImageBitmap using the provided metadata.
   * Returns a new ImageBitmap with tiles reordered to their original positions.
   */
  descramble(
    scrambled: ImageBitmap,
    metadata: ScrambleMetadata,
  ): Promise<ImageBitmap>;

  /**
   * Unload the WASM module to free memory.
   */
  destroy(): void;
}

let _module: DescrambleModule | null = null;

/**
 * Load the WASM descramble module.
 * Falls back to a no-op stub if the WASM file is not present.
 */
export async function loadDescrambleModule(): Promise<DescrambleModule> {
  if (_module) return _module;

  // TODO: Replace this stub with actual WASM module loading:
  // const wasmModule = await import('./descramble_bg.wasm');
  // _module = await init(wasmModule);

  // --- Stub implementation (identity transform) ---
  console.warn(
    '[WASM] descramble.wasm not compiled yet. Using identity stub — images will appear scrambled in production.',
  );

  _module = {
    async descramble(scrambled: ImageBitmap, _metadata: ScrambleMetadata): Promise<ImageBitmap> {
      // Identity: return the image unchanged
      // In production, this reorders tiles according to metadata.seed and metadata.version
      const canvas = new OffscreenCanvas(scrambled.width, scrambled.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      ctx.drawImage(scrambled, 0, 0);
      return canvas.transferToImageBitmap();
    },

    destroy() {
      _module = null;
    },
  };

  return _module;
}
