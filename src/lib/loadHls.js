let hlsModulePromise = null

/** Load hls.js on demand — keeps it out of the marketing entry chunk */
export function loadHls() {
  if (!hlsModulePromise) {
    hlsModulePromise = import('hls.js')
  }
  return hlsModulePromise
}
