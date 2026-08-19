import { HOME_HERO } from '../../config/homeHero'
import HomeHeroVideoBackdrop from './HomeHeroVideoBackdrop'
import HomePrimaryCtaPair from './HomePrimaryCtaPair'
import HomePlatformWorkspacePreview from './HomePlatformWorkspacePreview'
import { useHomeHeroVideo } from '../../hooks/useHomeHeroVideo'

export default function HomeHero() {
  const { video } = useHomeHeroVideo()
  const headlineLines = HOME_HERO.headlineLines ?? [HOME_HERO.headline]

  return (
    <section id="get-started" className="relative w-full overflow-hidden border-b border-cyan-500/10 text-white">
      <div className="relative min-h-[min(72vh,720px)] lg:min-h-[min(80vh,760px)] flex items-center">
        <HomeHeroVideoBackdrop videoUrl={video.videoUrl} posterUrl={video.posterUrl} />
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent" />

        <div className="page-content relative z-10 w-full py-14 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-4">{HOME_HERO.eyebrow}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.12] mb-5">
                {headlineLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">{HOME_HERO.subtitle}</p>

              <HomePrimaryCtaPair variant="hero" className="mt-8 sm:mt-10" />
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" aria-hidden />
              <div className="relative scale-[0.98] origin-center shadow-2xl shadow-black/40 rounded-2xl ring-1 ring-white/10">
                <HomePlatformWorkspacePreview />
              </div>
              <p className="sr-only">Product screenshot: study center with theory, code, charts, and feedback panels</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
