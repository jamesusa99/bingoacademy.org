/** Move array item from one index to another (immutable) */
export function arrayMove(list, fromIndex, toIndex) {
  const next = [...list]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}
