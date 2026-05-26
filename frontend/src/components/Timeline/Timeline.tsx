import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import SessionCard from '../SessionCard/SessionCard'
import './Timeline.css'

interface Session {
  id: number
  title: string
  phase: string
  summary: string | null
  completed: boolean
  createdAt: string
  skillCalls: { id: number; skill: string; createdAt: string }[]
  artifacts: { id: number; name: string; type: string }[]
}

export default function Timeline() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPhase, setFilterPhase] = useState<string>('')

  useEffect(() => {
    fetchSessions()
  }, [filterPhase])

  const fetchSessions = async () => {
    try {
      const url = filterPhase ? `/api/sessions?phase=${filterPhase}` : '/api/sessions'
      const response = await api.get(url)
      setSessions(response.data.data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const phases = [
    { value: '', label: 'All' },
    { value: 'requirement', label: '📋 需求' },
    { value: 'design', label: '🎨 设计' },
    { value: 'implementation', label: '💻 开发' },
    { value: 'testing', label: '✅ 测试' },
    { value: 'deployment', label: '🚀 部署' }
  ]

  if (loading) {
    return <div className="timeline loading">加载中...</div>
  }

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h2>研发时间线</h2>
        <div className="timeline-filters">
          {phases.map(phase => (
            <button
              key={phase.value}
              className={filterPhase === phase.value ? 'active' : ''}
              onClick={() => setFilterPhase(phase.value)}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="timeline-empty">
          <p>暂无研发记录</p>
          <p className="hint">通过 API 创建 AI 会话来开始记录研发过程</p>
        </div>
      ) : (
        <div className="timeline-list">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
