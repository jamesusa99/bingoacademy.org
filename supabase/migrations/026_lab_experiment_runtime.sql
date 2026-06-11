-- L3 experiment runtime / hosting config (iframe, HTML, programming, packages)

ALTER TABLE lab_experiments
  ADD COLUMN IF NOT EXISTS runtime_config JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN lab_experiments.runtime_config IS
  'Experiment hosting: { type, url, internalPath, labId, downloadLabel, embedHeight, openInNewTab }';
