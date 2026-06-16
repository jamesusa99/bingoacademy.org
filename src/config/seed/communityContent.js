/** Seed / fallback data for Community CMS (Scholars, Check-In, Partners) */

export const COMMUNITY_SCHOLAR_TIERS = [
  { slug: 'pioneer', label: 'Pioneer Scholar', age: 'Ages 6–9', description: 'Elementary starters', focus: 'Attendance + daily check-in consistency', pts: 100, color: 'bg-green-100 text-green-700 border-green-200', icon: '🌱', is_highest: false, sort_order: 0 },
  { slug: 'rising', label: 'Rising Scholar', age: 'Ages 10–14', description: 'Intermediate track', focus: 'Course mastery + practical skills + check-in quality', pts: 300, color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📈', is_highest: false, sort_order: 1 },
  { slug: 'elite', label: 'Elite Scholar', age: 'Ages 14–18', description: 'Competition track', focus: 'Course outcomes + competition participation + research projects', pts: 600, color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🏆', is_highest: false, sort_order: 2 },
  { slug: 'super', label: 'Bingo Super Scholar', age: 'All ages', description: 'Highest honour', focus: 'Comprehensive ability + core achievements + role model impact', pts: 1000, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⭐', is_highest: true, sort_order: 3 },
]

export const COMMUNITY_SCHOLARS = [
  { name: 'Alex W.', grade: 'Grade 11', tier_slug: 'super', achievement: 'National AI Innovation Competition · First Place', path: 'Foundations → Competition Bootcamp → Science Camp → Super Scholar', avatar: '⭐', pts: 1240, sort_order: 0 },
  { name: 'Mia C.', grade: 'Grade 10', tier_slug: 'elite', achievement: 'STEM Specialty Admissions · Top Provincial School', path: 'Level 1 → Level 2 → STEM Admissions Track', avatar: '🏆', pts: 820, sort_order: 1 },
  { name: 'Kevin L.', grade: 'University Yr 1', tier_slug: 'super', achievement: 'AI startup incubated · $30K seed funding', path: 'Level 3 Applied → Level 4 → Super Scholar', avatar: '⭐', pts: 1580, sort_order: 2 },
  { name: 'Emma T.', grade: 'Grade 7', tier_slug: 'rising', achievement: 'Regional AI Creativity Award', path: 'Foundations → Intermediate Track', avatar: '📈', pts: 410, sort_order: 3 },
  { name: 'Jason H.', grade: 'Grade 9', tier_slug: 'elite', achievement: '2nd place · City-level AI Robot Competition', path: 'Intermediate → Competition Bootcamp', avatar: '🏆', pts: 690, sort_order: 4 },
  { name: 'Lily Z.', grade: 'Grade 4', tier_slug: 'pioneer', achievement: 'School AI Art Exhibition – Best Work', path: 'AI Foundations Course', avatar: '🌱', pts: 175, sort_order: 5 },
]

export const COMMUNITY_CHECKIN_TASKS = [
  { slug: 'daily-study', task_type: 'study', icon: '📖', title: 'Daily Study Check-In', description: 'Complete a lesson and mark attendance', pts: 5, scholar_pts: 1, exclusive: false, sort_order: 0 },
  { slug: 'practice-upload', task_type: 'practice', icon: '🛠️', title: 'Practice Project Upload', description: 'Submit your AI practice work screenshot', pts: 20, scholar_pts: 3, exclusive: false, sort_order: 1 },
  { slug: 'community-share', task_type: 'share', icon: '📢', title: 'Community Share Check-In', description: "Share today's learning insight in the group", pts: 10, scholar_pts: 2, exclusive: false, sort_order: 2 },
  { slug: 'scholar-bonus', task_type: 'scholar', icon: '⭐', title: 'Scholar Bonus Task', description: "Complete the week's project challenge", pts: 50, scholar_pts: 10, exclusive: true, sort_order: 3 },
]

export const COMMUNITY_CHECKIN_REWARDS = [
  { icon: '🎫', title: 'Course Voucher', pts: 200, description: 'Up to $50 off any course', stock: 'Available', scholar_only: false, sort_order: 0 },
  { icon: '📦', title: 'AI Maker Kit', pts: 500, description: 'Hardware kit for AI projects', stock: '12 left', scholar_only: false, sort_order: 1 },
  { icon: '👨‍🏫', title: '1-on-1 Mentor Session', pts: 800, description: '30-min elite mentor consultation', stock: 'Available', scholar_only: false, sort_order: 2 },
  { icon: '🏅', title: 'Competition Entry Fee', pts: 1000, description: 'Free entry to partner competition', stock: '5 left', scholar_only: false, sort_order: 3 },
  { icon: '📜', title: 'Scholar Certificate Frame', pts: 300, description: 'Premium frame for your certificate', stock: 'Scholar only', scholar_only: true, sort_order: 4 },
  { icon: '🎖️', title: 'Scholar Digital Badge', pts: 150, description: 'Exclusive digital profile badge', stock: 'Scholar only', scholar_only: true, sort_order: 5 },
]

/** "How to Earn More Points" rules on /community/checkin */
export const COMMUNITY_CHECKIN_POINTS_GUIDE = [
  { title: 'Daily Check-In', pts: '+5 pts', scholar_pts: '+1 scholar pt', streak_only: false, sort_order: 0 },
  { title: 'Weekly 7-day Streak', pts: '', scholar_pts: '+50 pts bonus', streak_only: true, sort_order: 1 },
  { title: 'Complete a Lesson', pts: '+20 pts', scholar_pts: '+3 scholar pts', streak_only: false, sort_order: 2 },
  { title: 'Submit a Project', pts: '+100 pts', scholar_pts: '+15 scholar pts', streak_only: false, sort_order: 3 },
  { title: 'Mentor Q&A Interaction', pts: '+30 pts', scholar_pts: '+5 scholar pts', streak_only: false, sort_order: 4 },
  { title: 'Refer a Friend', pts: '+200 pts', scholar_pts: '+20 scholar pts', streak_only: false, sort_order: 5 },
  { title: 'Community Post Approved', pts: '+50 pts', scholar_pts: '+8 scholar pts', streak_only: false, sort_order: 6 },
  { title: 'Competition Participation', pts: '+150 pts', scholar_pts: '+25 scholar pts', streak_only: false, sort_order: 7 },
]

export const COMMUNITY_HOME_DEFAULT = {
  pillarsTitle: 'Three Systems That Make Learning Stick',
  pillars: [
    { icon: '🏆', color: 'border-primary/20', btnColor: 'btn-primary', tabTarget: 'mentors', title: 'Elite Mentor Hub', pain: 'No direction · no one to ask', value: 'AI competition gold coaches, STEM admissions advisors, and university professors. 1-on-1 Q&A, personalised learning plans, assignment reviews. Help your student avoid 2 years of wasted effort.', stat: '15+ certified elite mentors' },
    { icon: '⭐', color: 'border-amber-200/60 bg-amber-50/20', btnColor: 'bg-amber-500 text-white hover:bg-amber-600', tabTarget: 'scholars', title: 'AI Star Scholar System', pain: 'No role models · no visible progress', value: 'A four-tier honours programme: Pioneer → Rising → Elite → Super Scholar. Real student cases with documented paths. Every success story is replicable.', stat: '89% of scholars won provincial+ awards' },
    { icon: '📅', color: 'border-green-200/60 bg-green-50/20', btnColor: 'bg-green-600 text-white hover:bg-green-700', tabTarget: 'checkin', title: 'Check-In & Points', pain: "Can't stay consistent · no motivation", value: 'Gamified daily check-ins earn points redeemable for course vouchers, hardware kits, mentor sessions, and competition entries. Scholar points run a parallel track.', stat: '78% daily check-in rate · 1M+ pts distributed' },
  ],
  stats: [
    { value: '10,000+', label: 'Students Served' },
    { value: '92%', label: 'Competition Award Rate' },
    { value: '300+', label: 'International Awards' },
    { value: '500+', label: 'Partner Institutions' },
  ],
}

export const COMMUNITY_CERT_COURSES_DEFAULT = [
  { name: 'AI Literacy Certification', age: 'Ages 6–10', cert: 'Foundation Certificate', scholarPts: '+50 Scholar pts', partnerCert: true },
  { name: 'AI & Robotics Certification', age: 'Ages 10–14', cert: 'Applied Certificate', scholarPts: '+80 Scholar pts', partnerCert: true },
  { name: 'Data Science Certification', age: 'Ages 12–18', cert: 'Advanced Certificate', scholarPts: '+120 Scholar pts', partnerCert: true },
  { name: 'Machine Learning Foundations', age: 'Ages 14–18', cert: 'Expert Certificate', scholarPts: '+150 Scholar pts', partnerCert: true },
]

export const COMMUNITY_PARTNERS = [
  { name: 'Youth STEM Education Center', region: 'Jiangsu · Nanjing', type: 'University Lab', sort_order: 0 },
  { name: 'AI Education Practice Base', region: 'Guangdong · Shenzhen', type: 'Practice Base', sort_order: 1 },
  { name: 'Education Group STEM Academy', region: 'Beijing', type: 'STEM Academy', sort_order: 2 },
  { name: 'Foreign Language School AI Lab', region: 'Shanghai', type: 'School Lab', sort_order: 3 },
  { name: 'STEM Training Academy', region: 'Zhejiang · Hangzhou', type: 'Training Org', sort_order: 4 },
  { name: 'Maker Education Institute', region: 'Sichuan · Chengdu', type: 'Maker Space', sort_order: 5 },
]
