-- Rollback IOAI experiment library / lab packs (revert prior 021_ioai_experiments if applied)

DROP TABLE IF EXISTS ioai_bundle_recommended_modules;
DROP TABLE IF EXISTS ioai_bundle_experiments;
DROP TABLE IF EXISTS lesson_materials;
DROP TABLE IF EXISTS lesson_experiment_bindings;
DROP TABLE IF EXISTS ioai_experiment_materials;
DROP TABLE IF EXISTS ioai_experiments;

DELETE FROM ioai_bundles WHERE bundle_type = 'lab_pack';

ALTER TABLE ioai_bundles DROP CONSTRAINT IF EXISTS ioai_bundles_bundle_type_check;
ALTER TABLE ioai_bundles ADD CONSTRAINT ioai_bundles_bundle_type_check
  CHECK (bundle_type IN ('unit', 'full', 'combo'));
