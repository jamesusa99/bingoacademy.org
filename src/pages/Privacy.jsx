import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { LEGAL_COMPLIANCE } from '../config/legalCompliance'

const SECTIONS = [
  {
    title: 'Overview',
    body:
      'Bingo Academy provides AI education for students, families, and schools. We collect only the data needed to deliver courses, process payments, and support learners — and we design our products with children’s privacy in mind.',
  },
  {
    title: 'COPPA — Children’s Online Privacy (U.S.)',
    body:
      'Our platform serves K-12 learners. We do not knowingly collect personal information from children under 13 without appropriate parental or school consent. Account creation for minors should be managed by a parent, guardian, or authorized educator. We limit marketing to children, do not sell student data, and use age-appropriate defaults in our free exploration labs (no account required to play). Schools evaluating Bingo for classroom use may request a Data Processing Agreement (DPA) covering student accounts.',
  },
  {
    title: 'GDPR — EU & UK Data Protection',
    body:
      'If you are in the European Economic Area or United Kingdom, you have rights to access, rectify, erase, restrict, or port your personal data, and to object to certain processing. Lawful bases include contract performance (delivering purchased courses), legitimate interests (security and product improvement), and consent where required. Payment processing is handled by Stripe; we do not store full card numbers on our servers.',
  },
  {
    title: 'What we collect',
    bullets: [
      'Account: name, email, and profile details you provide at sign-up',
      'Learning: course progress, lab submissions, and exercise results',
      'Payments: transaction records via Stripe (we receive confirmation, not card details)',
      'Technical: standard logs and cookies needed for authentication and security',
    ],
  },
  {
    title: 'What we do not do',
    bullets: [
      'Sell or rent student or parent personal information to third parties',
      'Require a phone number at Stripe checkout',
      'Use exploration-lab gameplay data for advertising profiles',
    ],
  },
  {
    title: 'Social sign-in (Google & Facebook)',
    body:
      'If you choose “Continue with Google” or “Continue with Facebook,” we receive basic profile information from that provider through our authentication partner Supabase. We use it only to create and secure your account, save course progress, and provide support. We do not post to your social accounts on your behalf.',
    bullets: [
      'Google Sign-In: name, email, and Google account identifier',
      'Facebook Login: name, email (if you grant permission), and Facebook user identifier',
      'Authentication data is processed by Supabase; payment data is processed by Stripe',
    ],
  },
  {
    title: 'Contact',
    body: `Questions about privacy, COPPA, GDPR, or school procurement compliance:`,
  },
]

export default function Privacy() {
  return (
    <div className="w-full">
      <PageMeta
        title="Privacy Policy · COPPA & GDPR"
        description="How Bingo Academy protects student privacy — COPPA-aware practices, GDPR-ready data handling, and how to request account or Facebook login data deletion."
      />

      <PageContent className="py-10 sm:py-14 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Legal</p>
        <h1 className="text-3xl font-black text-bingo-dark mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          <Link to="#data-deletion" className="text-primary hover:underline">
            Data deletion
          </Link>
          {' · '}
          <Link to="/safety-and-privacy" className="text-primary hover:underline">
            Child safety & operational data use
          </Link>
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          {LEGAL_COMPLIANCE.badges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              <span aria-hidden>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>

        <div className="prose prose-slate prose-sm max-w-none space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-bingo-dark mb-2">{section.title}</h2>
              {section.body ? <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p> : null}
              {section.bullets ? (
                <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section id="data-deletion" className="scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Data deletion &amp; account removal</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              You can request deletion of your Bingo Academy account and personal data we hold — including information
              received when you sign in with Facebook or Google.
            </p>
            <h3 className="text-sm font-bold text-bingo-dark mb-2">How to request deletion</h3>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-5 mb-4">
              <li>
                Email{' '}
                <a href={`mailto:${LEGAL_COMPLIANCE.contactEmail}`} className="text-primary hover:underline">
                  {LEGAL_COMPLIANCE.contactEmail}
                </a>{' '}
                from the address on your account (or ask a parent/guardian to email on behalf of a student under 18).
              </li>
              <li>
                Use the subject line <strong className="font-semibold text-bingo-dark">Account deletion request</strong>{' '}
                and include the email or name on your account.
              </li>
              <li>
                We will confirm by email and delete your account and associated personal data within{' '}
                <strong className="font-semibold text-bingo-dark">30 days</strong>, unless law requires a longer
                retention period (for example, completed payment records).
              </li>
            </ol>
            <h3 className="text-sm font-bold text-bingo-dark mb-2">What we delete</h3>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5 mb-4">
              <li>Account profile (name, email, login identifiers from Facebook, Google, or email sign-up)</li>
              <li>Course progress, lab submissions, and forum content tied to your account</li>
              <li>Authentication records stored in our systems via Supabase</li>
            </ul>
            <h3 className="text-sm font-bold text-bingo-dark mb-2">Facebook Login</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              If you connected with Facebook, you can also remove the app under Facebook Settings → Apps and Websites.
              That revokes future access but does not by itself delete data already stored at Bingo Academy — email{' '}
              <a href={`mailto:${LEGAL_COMPLIANCE.contactEmail}`} className="text-primary hover:underline">
                {LEGAL_COMPLIANCE.contactEmail}
              </a>{' '}
              to request deletion of data we received from Meta.
            </p>
            <p className="text-xs text-slate-500">
              Anonymized aggregate statistics (for example, course completion rates without names) may be retained for
              outcomes reporting.
            </p>
          </section>

          <section id="terms-of-use">
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Terms of use</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Digital course purchases grant access to the modules described at checkout. Content is for personal
              educational use by the purchasing student or household. Do not redistribute course videos, notebooks, or
              assessment materials. Refunds follow the policy shown during checkout. Bingo Academy may update course
              content, rubrics, or platform features to improve learning quality — enrolled students retain access to
              purchased modules under the access terms shown at purchase.
            </p>
          </section>

          <p className="text-sm text-slate-600">
            Email{' '}
            <a href={`mailto:${LEGAL_COMPLIANCE.contactEmail}`} className="text-primary hover:underline">
              {LEGAL_COMPLIANCE.contactEmail}
            </a>
            . Return to{' '}
            <Link to="/" className="text-primary hover:underline">
              home
            </Link>
            .
          </p>
        </div>
      </PageContent>
    </div>
  )
}
