import DoodleMonsterClassifier from '../../components/lab/DoodleMonsterClassifier'
import ExplorationLabShell from '../../components/lab/ExplorationLabShell'

export default function DoodleMonsterPage() {
  return (
    <ExplorationLabShell experimentId="doodle-monsters">
      <DoodleMonsterClassifier />
    </ExplorationLabShell>
  )
}
