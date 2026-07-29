import AIMarsLander from '../../components/lab/AIMarsLander'
import ExplorationLabShell from '../../components/lab/ExplorationLabShell'

export default function AIMarsLanderPage() {
  return (
    <ExplorationLabShell experimentId="mars-lander">
      <AIMarsLander />
    </ExplorationLabShell>
  )
}
