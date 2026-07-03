import { useExitIntent } from '../../hooks/useExitIntent'
import ExitIntentModal from './ExitIntentModal'

/** Global exit-intent overlay — mounted once inside LazyAuthProvider */
export default function FunnelOverlays() {
  const { open, close } = useExitIntent()

  return <ExitIntentModal open={open} onClose={close} />
}
