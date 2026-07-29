import PromptWizard from '../../components/lab/PromptWizard'
import ExplorationLabShell from '../../components/lab/ExplorationLabShell'

export default function PromptWizardPage() {
  return (
    <ExplorationLabShell experimentId="prompt-wizard">
      <PromptWizard />
    </ExplorationLabShell>
  )
}
