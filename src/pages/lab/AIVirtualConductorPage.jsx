import AIVirtualConductor from '../../components/lab/AIVirtualConductor'
import ExplorationLabShell from '../../components/lab/ExplorationLabShell'

export default function AIVirtualConductorPage() {
  return (
    <ExplorationLabShell experimentId="statue-conductor">
      <AIVirtualConductor />
    </ExplorationLabShell>
  )
}
