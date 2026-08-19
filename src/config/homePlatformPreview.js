/** Homepage platform workspace preview — student-facing UI mock */

export const HOME_PLATFORM_WORKSPACE = {
  theory: {
    label: 'Theory / Instructions',
    title: 'Training vs. inference',
    body: 'Before running code, define what the model should learn and what “good” predictions look like on held-out data.',
    bullets: ['Read the concept brief', 'Note assumptions', 'Plan your experiment'],
  },
  code: {
    label: 'Python / Jupyter',
    snippet: `# Fit a simple classifier
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)
pred = model.predict(X_test)`,
  },
  results: {
    label: 'Charts / Predictions',
    metrics: [
      { label: 'Accuracy', value: '0.87' },
      { label: 'F1 score', value: '0.84' },
    ],
    chartBars: [42, 58, 71, 65, 87, 82],
  },
  reflection: {
    label: 'Feedback / Questions / Reflection',
    prompt: 'Why did validation accuracy drop when k increased from 5 to 15?',
    feedback: 'Checkpoint passed — document your hypothesis before the next cell.',
  },
}
