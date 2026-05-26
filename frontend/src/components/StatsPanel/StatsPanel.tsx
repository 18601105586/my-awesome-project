import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import './StatsPanel.css'

interface SkillStats {
  [key: string]: number
}

interface PhaseStats {
  requirement: number
  design: number
  implementation: number
  testing: number
  deployment: number
}

export default function StatsPanel() {
  const [skillStats, setSkillStats] = useState<SkillStats>({})
  const [phaseStats, setPhaseStats] = useState<PhaseStats>({
    requirement: 0,
    design: 0,
    implementation: 0,
    testing: 0,
    deployment: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch skill stats
      const skillsResponse = await api.get('/api/skill-calls/stats')
      setSkillStats(skillsResponse.data.data)

      // Fetch phase stats by getting all sessions
      const sessionsResponse = await api.get('/api/sessions')
      const sessions = sessionsResponse.data.data
      const phases: PhaseStats = {
        requirement: 0,
        design: 0,
        implementation: 0,
        testing: 0,
        deployment: 0
      }
      sessions.forEach((session: { phase: string }) => {
        if (phases[session.phase as keyof PhaseStats] !== undefined) {
          phases[session.phase as keyof PhaseStats]++
        }
      })
      setPhaseStats(phases)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="stats-panel loading">加载中...</div>
  }

  const totalSessions = Object.values(phaseStats).reduce((a, b) => a + b, 0)
  const totalSkillCalls = Object.values(skillStats).reduce((a, b) => a + b, 0)

  const phases = [
    { key: 'requirement', label: '📋 需求', color: '#9c27b0' },
    { key: 'design', label: '🎨 设计', color: '#2196f3' },
    { key: 'implementation', label: '💻 开发', color: '#4caf50' },
    { key: 'testing', label: '✅ 测试', color: '#ff9800' },
    { key: 'deployment', label: '🚀 部署', color: '#f44336' }
  ] as const

  const skills = Object.entries(skillStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="stats-panel">
      <h2>研发统计</h2>

      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{totalSessions}</span>
          <span className="stat-label">AI 会话</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalSkillCalls}</span>
          <span className="stat-label">Skill 调用</span>
        </div>
      </div>

      <div className="stats-section">
        <h3>阶段分布</h3>
        <div className="phase-bars">
          {phases.map(({ key, label, color }) => {
            const count = phaseStats[key as keyof PhaseStats]
            const percentage = totalSessions > 0 ? (count / totalSessions) * 100 : 0
            return (
              <div key={key} className="phase-bar-item">
                <span className="phase-label">{label}</span>
                <div className="phase-bar">
                  <div
                    className="phase-bar-fill"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
                <span className="phase-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {skills.length > 0 && (
        <div className="stats-section">
          <h3>Skill 使用</h3>
          <div className="skill-list">
            {skills.map(([skill, count]) => (
              <div key={skill} className="skill-item">
                <span className="skill-name">{skill}</span>
                <span className="skill-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
