import {
  COLS,
  ROWS,
  SCORE_TABLE,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  TETROMINO_TYPES,
} from '../../config/fingerTetris'

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function cloneMatrix(m) {
  return m.map((row) => row.slice())
}

export function rotateMatrixCW(matrix) {
  const n = matrix.length
  const next = Array.from({ length: n }, () => Array(n).fill(0))
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      next[x][n - 1 - y] = matrix[y][x]
    }
  }
  return next
}

export function randomTetrominoType(bagRef) {
  if (!bagRef.current || bagRef.current.length === 0) {
    bagRef.current = [...TETROMINO_TYPES]
    for (let i = bagRef.current.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bagRef.current[i], bagRef.current[j]] = [bagRef.current[j], bagRef.current[i]]
    }
  }
  return bagRef.current.pop()
}

export function createPiece(type) {
  const shape = cloneMatrix(TETROMINO_SHAPES[type])
  const w = shape[0].length
  return {
    type,
    shape,
    color: TETROMINO_COLORS[type],
    x: Math.floor((COLS - w) / 2),
    y: 0,
  }
}

export function collides(board, piece, ox = 0, oy = 0, shape = piece.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue
      const nx = piece.x + x + ox
      const ny = piece.y + y + oy
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true
      if (ny >= 0 && board[ny][nx]) return true
    }
  }
  return false
}

export function mergePiece(board, piece) {
  const next = board.map((row) => row.slice())
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (!piece.shape[y][x]) continue
      const ny = piece.y + y
      const nx = piece.x + x
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
        next[ny][nx] = piece.color
      }
    }
  }
  return next
}

export function clearLines(board) {
  const kept = board.filter((row) => row.some((cell) => !cell))
  const cleared = ROWS - kept.length
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null))
  return { board: kept, lines: cleared }
}

export function ghostY(board, piece) {
  let dy = 0
  while (!collides(board, piece, 0, dy + 1)) dy++
  return piece.y + dy
}

export function tryMove(state, dx, dy) {
  if (!state.piece || state.gameOver) return false
  if (collides(state.board, state.piece, dx, dy)) return false
  state.piece.x += dx
  state.piece.y += dy
  return true
}

export function tryRotate(state) {
  if (!state.piece || state.gameOver) return false
  const rotated = rotateMatrixCW(state.piece.shape)
  const kicks = [0, -1, 1, -2, 2]
  for (const kick of kicks) {
    if (!collides(state.board, state.piece, kick, 0, rotated)) {
      state.piece.shape = rotated
      state.piece.x += kick
      return true
    }
  }
  return false
}

export function hardDrop(state) {
  if (!state.piece || state.gameOver) return 0
  let dropped = 0
  while (tryMove(state, 0, 1)) dropped++
  lockPiece(state)
  return dropped
}

export function lockPiece(state) {
  if (!state.piece) return
  state.board = mergePiece(state.board, state.piece)
  const { board, lines } = clearLines(state.board)
  state.board = board
  if (lines > 0) {
    state.lines += lines
    state.score += SCORE_TABLE[lines] || lines * 100
    state.level = Math.floor(state.lines / 10) + 1
  }
  spawnPiece(state)
}

export function spawnPiece(state) {
  const type = randomTetrominoType(state.bag)
  const piece = createPiece(type)
  state.piece = piece
  state.dropAccum = 0
  if (collides(state.board, piece)) {
    state.gameOver = true
    state.piece = null
  }
}

export function createGameState(bagRef) {
  return {
    board: createEmptyBoard(),
    piece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    dropAccum: 0,
    bag: bagRef,
  }
}

export function resetGame(state) {
  state.board = createEmptyBoard()
  state.score = 0
  state.lines = 0
  state.level = 1
  state.gameOver = false
  state.dropAccum = 0
  state.bag.current = []
  spawnPiece(state)
}

/** Gravity tick; returns whether a lock happened */
export function stepGravity(state, dtMs, dropIntervalMs) {
  if (!state.piece || state.gameOver) return false
  state.dropAccum += dtMs
  let locked = false
  while (state.dropAccum >= dropIntervalMs) {
    state.dropAccum -= dropIntervalMs
    if (!tryMove(state, 0, 1)) {
      lockPiece(state)
      locked = true
      break
    }
  }
  return locked
}

/** Instant column target from normalized mirrored X (0..1) */
export function columnFromNormalizedX(nx) {
  const col = Math.floor(Math.min(0.999, Math.max(0, nx)) * COLS)
  return col
}

export function movePieceToColumn(state, targetCol) {
  if (!state.piece || state.gameOver) return
  const w = state.piece.shape[0].length
  let bestX = state.piece.x
  let bestDist = Infinity
  for (let x = -2; x <= COLS; x++) {
    const center = x + w / 2
    const dist = Math.abs(center - (targetCol + 0.5))
    if (dist < bestDist && !collides(state.board, state.piece, x - state.piece.x, 0)) {
      bestDist = dist
      bestX = x
    }
  }
  state.piece.x = bestX
}
