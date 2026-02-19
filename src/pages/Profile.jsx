import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Profile</h1>
      <p className="text-slate-600 mb-8">User info, orders, study, share & promote, commission settlement</p>

      <section className="mb-10">
        <h2 className="section-title">User Info</h2>
        <div className="card p-6 flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold">A</div>
          <div>
            <div className="font-semibold text-bingo-dark">Nickname / Phone</div>
            <div className="text-sm text-slate-500">Role: Student/Parent · Referral QR code / profile</div>
          </div>
          <Link to="/login" className="ml-auto rounded-lg border border-primary text-primary px-4 py-2 text-sm">Edit Profile</Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">My Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/profile#orders" className="card p-4 text-center hover:shadow-md transition">My Orders</Link>
          <Link to="/profile/study" className="card p-4 text-center hover:shadow-md transition">Study Center</Link>
          <Link to="/profile/works" className="card p-4 text-center hover:shadow-md transition">My Works</Link>
          <Link to="/profile#events" className="card p-4 text-center hover:shadow-md transition">My Events</Link>
          <Link to="/profile#cert" className="card p-4 text-center hover:shadow-md transition">My Certificates</Link>
          <Link to="/growth" className="card p-4 text-center hover:shadow-md transition">Capability Profile</Link>
          <Link to="/profile#messages" className="card p-4 text-center hover:shadow-md transition">Notifications</Link>
          <Link to="/profile#settings" className="card p-4 text-center hover:shadow-md transition">Settings</Link>
        </div>
      </section>

      <section id="promo" className="mb-10">
        <h2 className="section-title">Share & Promote</h2>
        <div className="space-y-4">
          <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20">
            <h3 className="font-semibold text-primary mb-3">Promotion Center</h3>
            <ul className="text-sm text-slate-700 space-y-2 mb-4">
              <li>· Personal referral code/posters/links (generate, save, share to WeChat)</li>
              <li>· Daily/monthly earnings (received/pending)</li>
              <li>· High-commission picks (platform-selected courses/products, one-click share)</li>
              <li>· Promo events (double commission, referral rewards, etc.)</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary">Promotion Center</button>
              <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Generate poster/link</button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">Referral Order Details</h3>
            <p className="text-sm text-slate-600 mb-2">Filter: All / Pending / Settled / Void</p>
            <p className="text-sm text-slate-600">List: product/course, time, referred user, order amount, commission rate/amount, status, settlement time</p>
            <Link to="/profile#orders-promo" className="text-primary text-sm mt-2 inline-block">View details →</Link>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">Commission Settlement</h3>
            <ul className="text-sm text-slate-700 space-y-1 mb-4">
              <li>· Withdrawable balance, pending commission, settled commission</li>
              <li>· Withdraw: WeChat balance, min $10, T+1 arrival</li>
              <li>· Withdrawal history: amount, request time, arrival time, status</li>
              <li>· Settlement: 7 days after order completion; refunds deduct commission</li>
            </ul>
            <div className="flex gap-3">
              <button type="button" className="btn-primary">Withdraw</button>
              <span className="text-sm text-slate-500 self-center">Withdrawable: --</span>
            </div>
          </div>

          <div className="card p-6 bg-slate-50">
            <h3 className="font-semibold text-bingo-dark mb-3">Promotion Rules</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>· Commission varies by product/course/role—see product pages</li>
              <li>· Referral binding: 30 days after referred user clicks/scans</li>
              <li>· Refunds/void orders: deduct commission</li>
              <li>· Withdrawal: min $10, T+1, no fee</li>
            </ul>
          </div>

          <div className="card p-6 border-amber-200/60 bg-amber-50/50">
            <h3 className="font-semibold text-bingo-dark mb-3">Team Promotion (Teachers/Institutions only)</h3>
            <p className="text-sm text-slate-600 mb-2">Team list, total earnings, team commission split; stats (new members, conversions, total commission); team promo materials</p>
            <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Team Promotion</button>
          </div>

          <div id="promo-terms" className="card p-6 bg-slate-50/80">
            <h3 className="font-semibold text-bingo-dark mb-4">Key Concepts</h3>
            <dl className="grid gap-3 text-sm">
              <div><dt className="font-medium text-slate-800">Referrer</dt><dd className="text-slate-600 mt-0.5">User with promotion access (Student/Parent/Teacher/Institution, excluding Enterprise)</dd></div>
              <div><dt className="font-medium text-slate-800">Referred User</dt><dd className="text-slate-600 mt-0.5">User who enters via referrer&apos;s QR/poster/link</dd></div>
              <div><dt className="font-medium text-slate-800">Referral Binding</dt><dd className="text-slate-600 mt-0.5">Binding when referred user clicks/scans; valid 30 days</dd></div>
              <div><dt className="font-medium text-slate-800">Valid Order</dt><dd className="text-slate-600 mt-0.5">Paid during binding period, no refund/cancel</dd></div>
              <div><dt className="font-medium text-slate-800">Pending Commission</dt><dd className="text-slate-600 mt-0.5">Commission from valid orders, not yet settled</dd></div>
              <div><dt className="font-medium text-slate-800">Withdrawable Commission</dt><dd className="text-slate-600 mt-0.5">Settled, in referrer balance</dd></div>
              <div><dt className="font-medium text-slate-800">Settlement Period</dt><dd className="text-slate-600 mt-0.5">7 days after order completion (physical: receipt; digital: purchase)</dd></div>
              <div><dt className="font-medium text-slate-800">Min Withdrawal</dt><dd className="text-slate-600 mt-0.5">$10 (no fee, WeChat balance only)</dd></div>
            </dl>
          </div>

          <div className="card p-6 overflow-x-auto">
            <h3 className="font-semibold text-bingo-dark mb-4">Role & Promotion Rights</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">Role</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">Benefits</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">Commission</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">Team</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-3 font-medium text-slate-800">Student/Parent</td>
                  <td className="py-3 px-3">Personal code/poster/link</td>
                  <td className="py-3 px-3">Platform base rate</td>
                  <td className="py-3 px-3">No</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-3 font-medium text-slate-800">Teacher/Institution</td>
                  <td className="py-3 px-3">Custom materials, bonus</td>
                  <td className="py-3 px-3">Base + 5%–10%</td>
                  <td className="py-3 px-3">Yes (team split)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-800">Enterprise</td>
                  <td className="py-3 px-3">No promotion</td>
                  <td className="py-3 px-3">—</td>
                  <td className="py-3 px-3">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-4">Promotion Flow</h3>
            <div className="space-y-4 text-sm">
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.1 Enable Promotion</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-2">
                  <p>Login → Profile → Share & Promote; system auto-enables (non-Enterprise default); first visit shows rules popup.</p>
                  <p>Code/poster/link auto-generated (permanent, re-generate supported).</p>
                </div>
              </details>
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.2 Share Flow</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-3">
                  <p className="font-medium text-slate-700">Share button on product/course/event pages</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Generate poster / Copy link / Share to WeChat</li>
                    <li>Poster: save to album, includes QR, product info, commission tip</li>
                    <li>Link: auto-copy with referrer ID</li>
                  </ul>
                  <p className="font-medium text-slate-700 pt-1">Promotion Center</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>High-commission picks → one-click share</li>
                    <li>Personal code → save/share general poster</li>
                  </ul>
                </div>
              </details>
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.3 Referral Binding</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-2">
                  <p>Referred user enters via link/QR → system parses referrer ID; prompt &quot;Recommended by XXX, exclusive benefits&quot;; auto-bind.</p>
                  <p>If not logged in, guide to login then bind; binding valid 30 days; first click wins within 30 days.</p>
                </div>
              </details>
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.4 Commission & Settlement</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-2">
                  <p><strong>Calculation:</strong> Order amount × rate (excl. shipping/coupons, 2 decimals).</p>
                  <p><strong>Status:</strong> Paid → Pending; after settlement period → Withdrawable; refund/cancel → deduct.</p>
                  <p><strong>Notifications:</strong> Commission updates via app + WeChat.</p>
                </div>
              </details>
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.5 Withdrawal</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-2">
                  <p>Profile → Commission Settlement; Withdraw (min $10) → confirm → verify WeChat ID → auto review (≤10 min) → transfer to WeChat balance.</p>
                </div>
              </details>
              <details className="group border border-slate-200 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                  <span>3.6 Team Promotion (Teachers/Institutions)</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <div className="px-4 py-3 text-slate-600 border-t border-slate-200 space-y-2">
                  <p>Promotion Center → Team → Invite members (team code); members bind via code; team commission split (e.g. team lead 10%); team stats (members, conversions, total).</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="section-title">Notifications</h2>
        <p className="text-sm text-slate-600">Announcements, activity reminders, Q&A replies, commission updates, referral order alerts</p>
      </section>

      <section>
        <h2 className="section-title">B2B Login</h2>
        <p className="text-slate-600 text-sm mb-3">Schools, institutions, franchise partners, event partners: use separate B2B account</p>
        <a href="/#/b" className="btn-primary">B2B Login</a>
      </section>
    </div>
  )
}
