import { Link } from 'react-router-dom'
import { getExperimentById } from '../../config/explorationLab'
import { knowledgeForExperiment } from '../../config/explorationKnowledge'
import LabKnowledgePanel from '../knowledge/LabKnowledgePanel'

/**
 * Wraps exploration lab games with crawlable knowledge content.
 */
export default function ExplorationLabShell({ experimentId, children }) {
  const experiment = getExperimentById(experimentId)
  const knowledge = knowledgeForExperiment(experiment)

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <Link to="/exploration" className="text-xs text-slate-400 hover:text-cyan-400 transition">
          ← AI Exploration Lab
        </Link>
      </div>
      {children}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <LabKnowledgePanel knowledge={knowledge} experimentTitle={experiment?.title || experimentId} />
        <p className="text-center mt-6">
          <Link to="/guides" className="text-xs text-slate-500 hover:text-cyan-400">
            Browse all knowledge guides →
          </Link>
        </p>
      </div>
    </div>
  )
}
