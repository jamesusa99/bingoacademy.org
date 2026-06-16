import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchPlatformSetting } from '../lib/platformSettings'
import {
  defaultScholarTiers,
  defaultScholars,
  defaultCheckinTasks,
  defaultCheckinRewards,
  defaultCheckinPointsGuide,
  defaultPartners,
  defaultCommunityHome,
  defaultCertCourses,
  mapScholarTierRow,
  mapScholarRow,
  mapCheckinTaskRow,
  mapCheckinRewardRow,
  mapCheckinPointsGuideRow,
  mapPartnerRow,
} from '../lib/communityContent'

export function useCommunityContent() {
  const [scholarTiers, setScholarTiers] = useState(defaultScholarTiers())
  const [scholars, setScholars] = useState(defaultScholars())
  const [checkinTasks, setCheckinTasks] = useState(defaultCheckinTasks())
  const [checkinRewards, setCheckinRewards] = useState(defaultCheckinRewards())
  const [checkinPointsGuide, setCheckinPointsGuide] = useState(defaultCheckinPointsGuide())
  const [partners, setPartners] = useState(defaultPartners())
  const [homeContent, setHomeContent] = useState(defaultCommunityHome())
  const [certCourses, setCertCourses] = useState(defaultCertCourses())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [tiersRes, scholarsRes, tasksRes, rewardsRes, partnersRes, homeSetting, coursesSetting, pointsGuideSetting] = await Promise.all([
          supabase.from('community_scholar_tiers').select('*').order('sort_order'),
          supabase.from('community_scholars').select('*').order('sort_order'),
          supabase.from('community_checkin_tasks').select('*').order('sort_order'),
          supabase.from('community_checkin_rewards').select('*').order('sort_order'),
          supabase.from('community_partners').select('*').order('sort_order'),
          fetchPlatformSetting('community_home').catch(() => null),
          fetchPlatformSetting('community_cert_courses').catch(() => null),
          fetchPlatformSetting('community_checkin_points_guide').catch(() => null),
        ])

        if (cancelled) return

        if (tiersRes.data?.length) {
          setScholarTiers(tiersRes.data.map(mapScholarTierRow).filter(Boolean))
        }
        if (scholarsRes.data?.length) {
          setScholars(scholarsRes.data.map(mapScholarRow).filter(Boolean))
        }
        if (tasksRes.data?.length) {
          setCheckinTasks(tasksRes.data.map(mapCheckinTaskRow).filter(Boolean))
        }
        if (rewardsRes.data?.length) {
          setCheckinRewards(rewardsRes.data.map(mapCheckinRewardRow).filter(Boolean))
        }
        if (partnersRes.data?.length) {
          setPartners(partnersRes.data.map(mapPartnerRow).filter(Boolean))
        }
        if (homeSetting && typeof homeSetting === 'object') {
          setHomeContent({
            ...defaultCommunityHome(),
            ...homeSetting,
            pillars: homeSetting.pillars?.length ? homeSetting.pillars : defaultCommunityHome().pillars,
            stats: homeSetting.stats?.length ? homeSetting.stats : defaultCommunityHome().stats,
          })
        }
        if (Array.isArray(coursesSetting) && coursesSetting.length) {
          setCertCourses(coursesSetting)
        }
        if (Array.isArray(pointsGuideSetting) && pointsGuideSetting.length) {
          setCheckinPointsGuide(pointsGuideSetting.map(mapCheckinPointsGuideRow).filter(Boolean))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { scholarTiers, scholars, checkinTasks, checkinRewards, checkinPointsGuide, partners, homeContent, certCourses, loading }
}
