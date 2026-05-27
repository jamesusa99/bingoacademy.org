import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

config({ path: path.join(root, '.env.local') })
config({ path: path.join(root, '.env') })

export const projectRoot = root
