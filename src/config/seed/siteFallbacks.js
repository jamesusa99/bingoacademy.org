/** Static fallbacks from page components — used for Supabase seeding */

export const HOME_TRUST_STATS = [
  { icon: '🎓', value: '3', label: 'Product Lines' },
  { icon: '🏆', value: 'IOAI', label: 'Whitelist Training' },
  { icon: '🏫', value: 'K12', label: 'School Edition' },
  { icon: '📜', value: 'Certified', label: 'Ability Credentials' },
  { icon: '🧪', value: 'Cloud', label: 'Online Labs' },
  { icon: '📦', value: 'Mall', label: 'Books & Kits' },
]

export const HOME_TESTIMONIALS = [
  { quote: 'The IOAI video course and training camp helped our child go from zero to competition-ready in one term.', name: 'Parent · Shanghai', role: 'IOAI Training', stars: 5 },
  { quote: 'K12 classroom edition fits our school schedule — books, courseware, and lab kits in one package.', name: 'Teacher · Shenzhen', role: 'K12 School Edition', stars: 5 },
  { quote: 'Self-study general AI courses are clear and hands-on. The materials pack made home experiments easy.', name: 'Student · Grade 7', role: 'Foundations of AI Program', stars: 5 },
]

export const HOME_BANNER_SLIDES = [
  { id: 'brand', gradient: 'from-primary/30 via-cyan-50 to-sky-100', icon: '🎓', eyebrow: 'Bingo AI Academy', title: 'AI Courses + Authoritative Competitions', subtitle: 'Literacy, IOAI whitelist training, and K12 classroom solutions — learn, compete, and earn certified outcomes.', ctaLabel: 'Explore Courses', href: '/courses', secondaryLabel: 'View Achievements', secondaryHref: '/showcase' },
  { id: 'ioai', gradient: 'from-amber-500/20 via-orange-50 to-amber-50', icon: '🏆', eyebrow: 'Authoritative Competitions', title: 'IOAI Whitelist Competition Training', subtitle: 'Video lessons, training camps, and sprint coaching for whitelist-format AI innovation competitions.', ctaLabel: 'IOAI Training', href: '/courses?line=ioai', secondaryLabel: 'Certification', secondaryHref: '/cert' },
]

export const EVENT_LIST = [
  { name: 'IOAI (International Olympiad in AI)', type: 'ai', stage: 'Registration Open', students: 'Secondary school', award: 'Global recognition · scientific inquiry', enrolled: 0, whitelist: true, aiCourse: true, desc: "The world's highest-level secondary school AI competition. Focus on scientific exploration and solving real-world problems." },
  { name: 'Kaggle Competitions (Junior/Student)', type: 'ai', stage: 'Ongoing', students: 'All ages', award: 'Data science credentials · portfolio', enrolled: 0, whitelist: true, aiCourse: true, desc: "The world's leading machine learning platform. Student-friendly entry-level data science competitions." },
  { name: 'AI for Good Innovation Factory (ITU)', type: 'ai', stage: 'Annual', students: 'Youth', award: 'UN recognition · SDG impact', enrolled: 0, whitelist: true, aiCourse: true, desc: 'UN-hosted competition encouraging students to use AI to address UN Sustainable Development Goals.' },
  { name: 'FIRST Robotics (FRC / FTC)', type: 'robotics', stage: 'Seasonal', students: 'K–12', award: 'Global recognition · college admissions', enrolled: 0, whitelist: true, aiCourse: true, desc: 'US-origin, globally recognised. FRC is often called the "Olympics of Robotics." Highly valued for elite college applications.' },
  { name: 'VEX Robotics Competition', type: 'robotics', stage: 'Seasonal', students: 'Elementary – University', award: 'World-class robotics credentials', enrolled: 0, whitelist: true, aiCourse: true, desc: "One of the world's largest robotics competitions. VEX IQ (elementary), VRC (middle/high), VEX U (university)." },
  { name: 'RoboCup & RoboCupJunior', type: 'robotics', stage: 'Annual', students: 'Elementary – University', award: 'Academic prestige · research showcase', enrolled: 0, whitelist: true, aiCourse: true, desc: 'Robot soccer, rescue, and dance. Acclaimed platform for robotics research and innovation.' },
  { name: 'USA Computing Olympiad (USACO)', type: 'us', stage: 'Ongoing', students: 'Secondary', award: 'Gold/Platinum = top AI labs · elite universities', enrolled: 0, whitelist: true, aiCourse: true, desc: 'US Computer Olympiad. Though algorithm-focused, high levels (Gold, Platinum) open doors to top AI labs and elite universities.' },
  { name: 'Regeneron ISEF', type: 'us', stage: 'Annual', students: 'Grades 9–12', award: 'Global science recognition · research pathway', enrolled: 0, whitelist: true, aiCourse: true, desc: 'The world\'s largest pre-college science fair. "Systems Software" and "Intelligent Machines" categories for AI/robotics.' },
  { name: 'National Robotics Challenge (NRC)', type: 'us', stage: 'Annual', students: 'K–12', award: 'Engineering innovation · open platform', enrolled: 0, whitelist: true, aiCourse: true, desc: 'Open platform — no brand restrictions. Ideal for showcasing pure engineering innovation.' },
  { name: 'Bingo Cup AI Design Challenge', type: 'bingo', stage: 'Active', students: '8–16 yrs', award: 'Prize money + Bingo scholarship', enrolled: 2100, whitelist: false, aiCourse: true, desc: "Bingo Academy's own flagship competition. AIGC, AI art, and data science tracks." },
]

export const MALL_COURSES = [
  { name: 'AI Foundations Bootcamp (Ages 8–12)', type: 'course', cat: 'qizhi', tag: '🔥 Bestseller', price: 299, bPrice: '$199/seat (bulk)', sold: 3420, rating: 4.9, desc: 'Core AI literacy, visual programming, and introductory projects. Suitable for complete beginners.', badge: 'Enlightenment', aiLab: false },
  { name: 'Competition Sprint: National AI Challenge', type: 'course', cat: 'competition', tag: '⭐ Top-rated', price: 890, bPrice: '$690/seat (bulk)', sold: 1240, rating: 4.8, desc: 'Competition-specific prep: project selection, development, defence. 86% pass-through rate.', badge: 'Competition', aiLab: true },
  { name: 'Python + AI Projects (Middle School)', type: 'course', cat: 'jichu', tag: '📈 Popular', price: 680, bPrice: '$480/seat (bulk)', sold: 2100, rating: 4.7, desc: 'Python basics to machine learning projects. Produces verifiable competition-ready work.', badge: 'Foundations', aiLab: false },
  { name: 'AIGC Creative Design Course', type: 'course', cat: 'aigc', tag: '🆕 New', price: 490, bPrice: '$360/seat (bulk)', sold: 870, rating: 4.8, desc: 'AI art, prompt engineering, creative concept development. Portfolio-ready in 3 weeks.', badge: 'AIGC', aiLab: false },
  { name: 'Parent: Understanding AI Education', type: 'course', cat: 'parent', tag: '💰 $9.9', price: 9.9, bPrice: null, sold: 8900, rating: 4.9, desc: 'Best-selling parent guide. 30-minute video course explaining AI education and how to choose the right path.', badge: 'Parent Essentials', aiLab: false },
]

export const MALL_PRODUCTS = [
  { name: 'National AI Challenge — Full Entry Package', type: 'event', tag: '✦ Prestigious', price: 380, bPrice: 'Group pricing available', desc: 'Registration + materials + mock defence session. Prestigious competition.', deadline: 'Rolling' },
  { name: 'Competition Bootcamp — 6-Week Sprint', type: 'event', tag: '🏆 Award-focused', price: 890, bPrice: '$690/student (group)', desc: 'Full competition prep camp. Historically 86% award rate for completing students.', deadline: 'Mar 2026' },
  { name: 'Bingo Cup AI Design — Entry + Coaching', type: 'event', tag: '🎨 AIGC Track', price: 490, bPrice: 'Group from $380', desc: "Bingo's own flagship competition. Entry fee + 4 coaching sessions + judging prep.", deadline: 'Apr 2026' },
  { name: 'AI Foundations Certificate (Qizhi)', type: 'cert', tag: '🌱 Entry level', price: 198, bPrice: 'Bulk: $149/student', desc: 'Nationally verifiable. Dual-endorsed by institution + issuing centre. Suitable for Grades 3–6.' },
  { name: 'AI Application Certificate (Jichu)', type: 'cert', tag: '📘 Intermediate', price: 298, bPrice: 'Bulk: $229/student', desc: 'AI project proficiency. Referenced in STEM admissions applications.' },
  { name: 'AI Innovation Certificate (Zhichuang)', type: 'cert', tag: '🏆 Top tier', price: 498, bPrice: 'Bulk: $380/student', desc: 'Highest tier. Accepted for comprehensive evaluation and strong-foundation programme supplementary evidence.' },
  { name: 'Teacher Advanced Certification', type: 'cert', tag: '👩‍🏫 Teacher', price: 680, bPrice: 'Institution package pricing', desc: 'For institutions: certify your teaching staff. Required for Jinyan/Zhichuang tier status.' },
  { name: 'AI Literacy Textbook Series (Grades 3–9)', type: 'material', tag: '📚 Digital', price: 128, bPrice: 'Bulk: $89/set', desc: 'Full 7-volume series. Digital + print options. Updated annually. Aligned to Bingo 9-star curriculum.' },
  { name: 'AI Hardware Kit — Starter (Ages 8–12)', type: 'material', tag: '🔧 Physical', price: 398, bPrice: 'Bulk: $298/kit', desc: 'Components + instructions + companion digital guide. Compatible with Foundations Bootcamp.' },
  { name: 'Robotics & Sensors Kit (Ages 12+)', type: 'material', tag: '🤖 Advanced', price: 698, bPrice: 'Bulk: $520/kit', desc: 'For Competition Sprint or Robotics competition prep. Includes sensor pack + codebase.' },
  { name: 'AI Course + Starter Kit Bundle', type: 'material', tag: '💰 Bundle deal', price: 599, bPrice: 'Bulk: $440/bundle', desc: 'Foundations Bootcamp course + physical starter kit. Save $98 vs. buying separately.' },
  { name: 'AI Digital Lab — Personal Edition', type: 'lab', tag: '🏠 For families', price: 299, bPrice: null, desc: 'Cloud-based virtual AI lab. Sim experiments, AI guidance, 3-month access. Beginner-friendly.' },
  { name: 'AI Digital Lab — Family Starter', type: 'lab', tag: '👨‍👩‍👧 1-year access', price: 899, bPrice: null, desc: 'Full-year access + parent dashboard + 2 online coaching sessions. Best value home plan.' },
  { name: 'AI Competition Training Station', type: 'training', tag: '🏆 Personal', price: 2980, bPrice: null, desc: 'Compact personal training station. Ideal for high-school students preparing for AI science competitions.' },
]

export const RESEARCH_CAMPS = [
  { title: 'AI Literacy AI Camp', age: '8–12 yrs', icon: '🤖', direction: 'Starter Interest', core: 'AI literacy · unplugged experiments · robotics hands-on', highlight: 'Hands-on experiments + hardware practice. Zero-background AI entry — fun and knowledge-rich.', outcome: 'Complete 1 simple robot project + AI literacy handbook', ratio: '1:10 small class · STEM instructor + teaching assistant', competition: 'Youth AI Innovation Challenge — Foundation Entry', price: 'From $590', weeks: '2 weeks' },
  { title: 'Data Science Research Camp', age: '12–16 yrs', icon: '📊', direction: 'Competition Sprint', core: 'Data collection · visualisation · analysis · report writing', highlight: 'Real datasets, professional tools, full-process research training.', outcome: 'Data analysis report + project portfolio', ratio: '1:8 small class · data science instructor + TA', competition: 'Data Science categories of AI competitions', price: 'From $790', weeks: '3 weeks' },
  { title: 'Machine Learning Intro Camp', age: '14–18 yrs', icon: '🧠', direction: 'College Admissions', core: 'ML fundamentals · model training · project practice · outcome defence', highlight: 'University-lab collaboration, professor-guided projects, generate college admissions materials.', outcome: 'Small ML project report + research certificate + professor reference letter', ratio: '1:6 small class · university professor + research mentor', competition: 'STEM specialty & college admissions pathway', price: 'From $1,290', weeks: '4 weeks' },
  { title: 'AIGC Creative Design Camp', age: '10–16 yrs', icon: '🎨', direction: 'Starter Interest', core: 'AI art generation · AIGC tools · creative project creation', highlight: 'Creativity meets AI. No coding required — express ideas through AI-powered art.', outcome: 'Original AI artworks portfolio + AIGC tools mastery certificate', ratio: '1:10 · creative STEM instructor + design mentor', competition: 'AI creative competitions & design showcases', price: 'From $490', weeks: '1 week' },
  { title: 'Aerospace Innovation Camp', age: '10–16 yrs', icon: '🚀', direction: 'Starter Interest', core: 'Rocket principles · aerospace science · hands-on model building', highlight: 'Build and launch model rockets. Understand flight, physics, and engineering in action.', outcome: 'Water rocket project + aerospace science report', ratio: '1:10 · aerospace STEM instructor + safety officer', competition: 'Aerospace model competitions', price: 'From $690', weeks: '2 weeks' },
  { title: 'Robotics Competition Camp', age: '12–18 yrs', icon: '⚙️', direction: 'Competition Sprint', core: 'Robot building · programming · competition strategy · team collaboration', highlight: 'Competition-ready training. Build, code, and compete with a team.', outcome: 'Competition-ready robot + competition coaching certificate', ratio: '1:6 · competition coach + technical mentor', competition: 'National Youth AI Robotics Competition', price: 'From $990', weeks: '3 weeks' },
  { title: 'Unplugged Science Experience Camp', age: '6–10 yrs', icon: '🔬', direction: 'Starter Interest', core: 'Water rockets · rainbow experiments · simple inventions · no screens', highlight: '100% screen-free. Safe, fun, hands-on discovery for young learners.', outcome: 'Science experiment portfolio + exploration journal', ratio: '1:8 · starter science instructor + safety aide', competition: 'Foundation for all future STEM programmes', price: 'From $390', weeks: '1 week' },
]

export const RESEARCH_FACULTY = [
  { name: 'Director Chen', team: 'Research Faculty', area: 'AI Literacy & Youth STEM Education', exp: '8 yrs youth STEM · led 20+ curriculum designs · 500+ students guided', philosophy: 'Start with curiosity, end with capability.', type: 'research' },
  { name: 'Prof. Li', team: 'University Partner Faculty', area: 'Machine Learning & Computer Vision', exp: 'Associate Professor · 30+ published papers · 10 yrs university teaching', philosophy: 'Research projects should solve real problems.', type: 'university' },
  { name: 'Coach Wang', team: 'Competition Coaches', area: 'Youth AI Competition Strategy', exp: '50+ award-winning teams coached · National competition gold coach', philosophy: 'Prepare early, compete with confidence.', type: 'competition' },
  { name: 'Dr. Zhang', team: 'University Partner Faculty', area: 'Data Science & Statistical Modelling', exp: 'PhD from Top-10 university · Led 3 national research grants', philosophy: 'Data tells stories — teach students to listen.', type: 'university' },
  { name: 'Instructor Liu', team: 'Research Faculty', area: 'Robotics & Maker Education', exp: '6 yrs maker education · robot competition judge · 200+ student projects', philosophy: 'Build things. Break things. Learn everything.', type: 'research' },
  { name: 'Coach Zhao', team: 'Competition Coaches', area: 'STEM Specialty Admissions Planning', exp: '300+ students guided through STEM specialty admissions', philosophy: 'Right strategy + right effort = right school.', type: 'competition' },
]

export const CAREER_JOBS = [
  { title: 'AI Trainer (Junior)', company: 'Alibaba Cloud', level: 'Junior', salary: '$8k–12k', location: 'Remote / Hangzhou', skill: 'AI Basics · Python', courseLinked: true },
  { title: 'Data Analyst', company: 'ByteDance Data Lab', level: 'Junior', salary: '$10k–15k', location: 'Beijing / Remote', skill: 'SQL · Data Vis', courseLinked: true },
  { title: 'Short Video Operations', company: 'New Media Agency', level: 'Entry', salary: '$5k–8k', location: 'Multiple cities', skill: 'AIGC · Content Ops', courseLinked: false },
  { title: 'Smart Mfg Ops Engineer', company: 'SAIC Partner', level: 'Mid', salary: '$12k–18k', location: 'Shanghai', skill: 'PLC · MES Systems', courseLinked: true },
  { title: 'Business Data Analyst', company: 'Retail Group', level: 'Junior', salary: '$9k–13k', location: 'Guangzhou', skill: 'SQL · Excel · BI', courseLinked: true },
]

export const CERT_TIERS = [
  { id: 'qizhi', stars: '1–3★', name: 'AI Enlightenment', chinese: 'AI Enlightenment', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200/60', inst: 'Newly established tutoring centres', teacher: 'Basic Teacher Certification', learner: 'AI Foundations Certificate', weeks: '4–6 weeks', courses: ['AI Basics & Logic Thinking', 'Scratch & Block Coding', 'Data Literacy Introduction', 'Visual AI Applications'], criteria: 'Pass rate ≥ 70% · satisfaction ≥ 4.0 · 2+ qualified teachers', benefits: ['Official AI Enlightenment partner badge', 'Bingo branded enrollment materials', 'Basic marketing resource pack'] },
  { id: 'jichu', stars: '4–6★', name: 'AI Skill Acquisition', chinese: 'AI Skill Acquisition', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200/60', inst: 'Growing centres with 50+ active students', teacher: 'Intermediate Teacher Certification', learner: 'AI Application Certificate', weeks: '5–7 weeks', courses: ['Python Programming Foundations', 'Machine Learning Concepts', 'AI in Society', 'Project-Based AI Design'], criteria: 'Pass rate ≥ 75% · satisfaction ≥ 4.2 · 4+ qualified teachers', benefits: ['AI Skill Acquisition badge + verified partner page', 'Priority referrals from Bingo platform', 'Curriculum co-branding rights'] },
  { id: 'jinyan', stars: '7–8★', name: 'Technical Mastery & Ethics', chinese: 'Technical Mastery & Ethics', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200/60', inst: 'Established centres with proven outcomes', teacher: 'Advanced Teacher Certification', learner: 'AI Proficiency Certificate', weeks: '6–8 weeks', courses: ['Deep Learning & Neural Nets', 'Computer Vision Projects', 'NLP & Text AI', 'AI Research Methodology'], criteria: 'Pass rate ≥ 80% · satisfaction ≥ 4.4 · 6+ qualified teachers', benefits: ['Technical Mastery & Ethics badge + featured partner spotlight', 'Access to regional competition coaching support', 'Joint marketing campaign eligibility'] },
  { id: 'zhichuang', stars: '9★', name: 'Synthesis & Innovation', chinese: 'Synthesis & Innovation', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', inst: 'Premium centres seeking flagship status', teacher: 'Master Trainer Certification', learner: 'AI Innovation Certificate', weeks: '7–10 weeks', courses: ['AI Image Recognition (5-step framework)', 'Face Recognition Systems', 'Full AI Project Lifecycle', 'Competition Entry & Presentation'], criteria: 'Pass rate ≥ 85% · satisfaction ≥ 4.5 · 8+ qualified teachers incl. 2 master trainers', benefits: ['Exclusive Synthesis & Innovation flagship badge', 'National ranking on Bingo partner map', 'Direct referral from all Bingo competition entrants', 'Revenue sharing on joint events', 'Dedicated account manager'] },
]

export const COMMUNITY_MENTORS = [
  { name: 'James Chen', title: 'Professor · UESTC', photo: '/mentors/jianwen-chen.jpg', tag: 'AI Research', intro: 'Over 20 years of research in video processing and AI algorithms; multimodal feature fusion for affective computing. Professor & doctoral supervisor at UESTC; Director of Visual Intelligence Research Center.', awards: '200+ papers · National research grants', type: 'faculty' },
  { name: 'Wenyi Wang', title: 'Ph.D · Associate Professor', photo: '/mentors/wenyi-wang.jpg', tag: 'Data Mining & AI', intro: 'AI expert at UESTC. Research spans data mining, AI, and algorithm optimisation. M.Sc. and Ph.D. from University of Ottawa, Canada.', awards: 'Best-paper awards · Industry AI advisory', type: 'faculty' },
  { name: 'Michell Xu', title: 'Ph.D · AI Scientist', photo: '/mentors/feng-xu.jpg', tag: 'Computer Vision', intro: 'Researcher at Beijing Academy of AI; Beijing High-Level Overseas Talent. Former researcher at Samsung Research America and Thomson. Postdoctoral fellow at UPenn; Ph.D. from Tsinghua University.', awards: '50+ international patents · Samsung innovation awards', type: 'faculty' },
  { name: 'Shuang Wang', title: 'Ph.D · AI Scientist', photo: '/mentors/shuang-wang.jpg', tag: 'LLM & Deep Learning', intro: 'Co-founder of Lava Education and ScholarOne LLC (USA). US AI sensor network patent holder. Specialises in LLMs, multimodal intelligence, deep learning. Ph.D. from University of Missouri.', awards: 'US patent holder · International competition mentor', type: 'faculty' },
]

export const FORUM_THREADS = [
  { title: 'Best age to start AI education?', content: 'Hi everyone! I have a 7-year-old and wondering when is the ideal time to introduce AI concepts. Would love to hear from parents who started early.', author: 'Parent_Mia', avatar: '👩', category: 'Discussion', replies: [
    { content: 'We started at 8 with visual programming. Found it perfect — not too early, kid was ready for logical thinking.', author: 'Dad_Leo', avatar: '👨' },
    { content: "Agree! Also check Bingo's AI Foundations course — my daughter loved the project-based approach.", author: 'Mom_Sarah', avatar: '👩' },
  ]},
  { title: 'Our competition journey: from zero to provincial award', content: 'Sharing our 10-month path. Started with Python basics, joined AI Innovation Camp, then competition sprint. Key: consistent practice + mentor guidance. Happy to answer questions!', author: 'Parent_David', avatar: '👨', category: 'Parent Experience', replies: [
    { content: 'Congratulations! How many hours per week did your child dedicate?', author: 'Curious_Parent', avatar: '🙋' },
    { content: 'About 5–7 hrs including weekend project time. Quality over quantity mattered most.', author: 'Parent_David', avatar: '👨' },
  ]},
  { title: 'Competition registration tips 2024', content: 'Compiled a quick guide from our experience: 1) Check prestigious competition deadlines early 2) Prepare project documentation 3) Mock defence practice helps. Add your tips below!', author: 'Coach_Lin_Fan', avatar: '🏆', category: 'Competition', replies: [] },
]

export const CHARITY_REPORTS = [
  { type: 'Trending', text: 'Ministry pushes K-12 AI education, literacy and ethics', report_date: '2025-02' },
  { type: 'Industry', text: 'Youth AI prestigious competitions expand, STEM literacy boosts admissions', report_date: '2025-02' },
  { type: 'Honor', text: 'Bingo AI Academy named "Annual AI Education Innovation Institution"', report_date: '2025-01' },
  { type: 'Trending', text: 'Multiple regions add AI literacy to comprehensive evaluation', report_date: '2025-01' },
  { type: 'Honor', text: 'Bingo students win first prize in National Youth AI Challenge', report_date: '2025-01' },
  { type: 'Industry', text: 'Industry-education policy support, enterprise-institution AI training partnerships', report_date: '2024-12' },
]

export const CHARITY_PROJECTS = [
  { title: 'Charity Education', desc: 'Donate materials/tools, free charity courses for youth/underserved groups' },
  { title: 'Charity Events', desc: 'AI charity events to raise brand impact' },
  { title: 'Charity Challenges', desc: 'User participation, platform donates to charity fund' },
  { title: 'Charity Showcase', desc: 'Build trust, drive C-end engagement' },
]
