export function isAnswerComplete(question, value) {
  if (!question || !value) return false
  if (question.questionType === 'single_choice' || question.questionType === 'true_false') {
    return Boolean(value.optionId)
  }
  if (question.questionType === 'multiple_choice') {
    const needed = question.selectCount || question.correctAnswer?.optionIds?.length || 0
    return (value.optionIds || []).length === needed
  }
  if (question.questionType === 'matching') {
    const left = question.matchingItems?.left || []
    const pairs = value.pairs || {}
    return left.length > 0 && left.every((item) => Boolean(pairs[item.id]))
  }
  return false
}
