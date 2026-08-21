import { IOAI_ASSESSMENT_COPY } from '../../../config/ioaiAssessment'

function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="mb-6">
      <legend className="text-sm font-semibold text-bingo-dark mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`cursor-pointer rounded-full border px-3 py-2 text-sm min-h-[40px] inline-flex items-center ${
              value === option.id
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-slate-200 text-slate-600 hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function IoaiAssessmentProfile({ profile, onChange, onContinue }) {
  const copy = IOAI_ASSESSMENT_COPY.profile

  return (
    <section className="max-w-2xl mx-auto card p-6 sm:p-8">
      <h2 className="text-xl font-bold text-bingo-dark mb-1">{copy.title}</h2>
      <p className="text-sm text-slate-600 mb-6">{copy.subtitle}</p>

      <ChoiceGroup
        legend={copy.ageLabel}
        name="age"
        options={copy.ageOptions}
        value={profile.age}
        onChange={(age) => onChange({ ...profile, age })}
      />
      <ChoiceGroup
        legend={copy.pythonLabel}
        name="python"
        options={copy.pythonOptions}
        value={profile.python}
        onChange={(python) => onChange({ ...profile, python })}
      />
      <ChoiceGroup
        legend={copy.competitionLabel}
        name="competition"
        options={copy.competitionOptions}
        value={profile.competition}
        onChange={(competition) => onChange({ ...profile, competition })}
      />

      <button type="button" onClick={onContinue} className="btn-primary w-full py-3 text-sm font-bold rounded-xl">
        {copy.continueCta}
      </button>
    </section>
  )
}
