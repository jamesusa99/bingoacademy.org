/**
 * Child safety & data use — operational detail beyond compliance badges
 */

export const SAFETY_PRIVACY = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  title: 'Child safety & data privacy',
  excerpt:
    'What data Bingo Academy collects from children, which devices and third parties are involved, retention and deletion, and whether student content trains AI models.',
  legalHref: '/privacy',
  contact: 'privacy@bingoacademy.org',
  sections: [
    {
      id: 'scope',
      title: 'Who this covers',
      body:
        'K–12 learners using Bingo Academy courses, free exploration labs, school deployments, and parent-managed accounts. This page explains operational data flows; the Privacy Policy covers legal rights and jurisdictions.',
    },
    {
      id: 'collected',
      title: 'Data we collect from children',
      items: [
        { label: 'Account (with consent)', detail: 'Name, email, grade band, parent/guardian link for under-13 US accounts' },
        { label: 'Learning progress', detail: 'Lesson completion, quiz scores, lab checkpoint outputs, certificate status' },
        { label: 'User-generated content', detail: 'Notebook uploads, forum posts (moderated), portfolio work submitted for showcase' },
        { label: 'Technical logs', detail: 'IP, browser type, session auth tokens — for security and abuse prevention' },
        { label: 'Payment metadata', detail: 'Stripe confirmation IDs only — we never store full card numbers' },
      ],
    },
    {
      id: 'not-collected',
      title: 'What we do not collect by default',
      items: [
        'Continuous webcam or microphone recording in paid courses (unless a specific live session is announced)',
        'Precise geolocation',
        'Social graph or advertising profiles from exploration gameplay',
        'Phone numbers at Stripe checkout',
      ],
    },
    {
      id: 'camera-mic',
      title: 'Camera & microphone use',
      body:
        'Several free exploration labs (e.g., AI Cyber Tennis, Hide & Seek) request camera access in the browser for on-device pose or vision demos.',
      items: [
        { label: 'Processing', detail: 'Inference runs locally in the browser (TensorFlow.js / MediaPipe). Frames are not uploaded to Bingo servers in the free tier.' },
        { label: 'Account not required', detail: 'Exploration games work without sign-in; no gameplay video is stored server-side.' },
        { label: 'School mode', detail: 'Districts may disable camera labs via network policy; offline alternatives are documented in /guides/k12/device-requirements' },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third parties that may receive data',
      items: [
        { label: 'Stripe', detail: 'Payment processing — billing email, transaction metadata', href: 'https://stripe.com/privacy', external: true },
        { label: 'Supabase', detail: 'Authentication, course progress, forum — US/EU hosting per project config', href: 'https://supabase.com/privacy', external: true },
        { label: 'Cloudflare Stream', detail: 'Video lesson delivery — viewing analytics, no student chat content', href: 'https://www.cloudflare.com/privacypolicy/', external: true },
        { label: 'Vercel / Railway', detail: 'Application hosting and edge logs — no student notebook contents in access logs by design' },
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep data',
      items: [
        { label: 'Active accounts', detail: 'Progress and portfolios retained while the account is active plus 12 months' },
        { label: 'Deleted accounts', detail: 'Personal identifiers purged within 30 days; anonymized aggregates may remain for outcomes reporting' },
        { label: 'School contracts', detail: 'Retention follows signed DPA — typically end of academic year + 90 days unless law requires longer' },
        { label: 'Exploration labs', detail: 'No server-side video; optional local badges in browser localStorage only' },
      ],
    },
    {
      id: 'deletion',
      title: 'How parents & schools delete data',
      items: [
        { label: 'Parent request', detail: 'Email privacy@bingoacademy.org from the guardian address on file — we verify identity before erasure' },
        { label: 'In-app', detail: 'Profile → request account deletion (rolls out per region; email fallback always available)' },
        { label: 'School bulk', detail: 'District admin submits student roster deletion via schools@bingoacademy.org under active DPA' },
        { label: 'Timeline', detail: 'Confirmation within 5 business days; erasure within 30 days' },
      ],
    },
    {
      id: 'ai-training',
      title: 'Do we train AI models on student content?',
      body: 'No — by default student notebooks, chats, and camera frames are not used to train Bingo-owned or third-party foundation models.',
      items: [
        { label: 'Course LLM features', detail: 'Sandboxed APIs with safety filters; school accounts may disable generative features entirely' },
        { label: 'Aggregates only', detail: 'Anonymized completion statistics may inform curriculum pacing — never raw student text for model training' },
        { label: 'Vendor policies', detail: 'We select vendors that contractually prohibit using our student data for their model training' },
      ],
    },
    {
      id: 'school-dpa',
      title: 'School data processing agreements',
      body:
        'Schools receive a DPA covering subprocessors, breach notification, student data deletion, and FERPA-aligned practices where applicable.',
      items: [
        { label: 'Request DPA', detail: 'schools@bingoacademy.org — include district name, student count, and deployment model' },
        { label: 'Related guide', detail: 'Procurement & parent consent workflow', href: '/guides/k12/procurement-privacy' },
      ],
    },
  ],
}
