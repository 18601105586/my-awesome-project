import './SessionCard.css'

interface SessionCardProps {
  session: {
    id: number
    title: string
    phase: string
    summary: string | null
    completed: boolean
    createdAt: string
    skillCalls: { id: number; skill: string; createdAt: string }[]
    artifacts: { id: number; name: string; type: string }[]
  }
}

const phaseIcons: Record<string, string> = {
  requirement: '📋',
  design: '🎨',
  implementation: '💻',
  testing: '✅',
  deployment: '🚀'
}

const phaseColors: Record<string, string> = {
  requirement: '#9c27b0',
  design: '#2196f3',
  implementation: '#4caf50',
  testing: '#ff9800',
  deployment: '#f44336'
}

export default function SessionCard({ session }: SessionCardProps) {
  const icon = phaseIcons[session.phase] || '📝'
  const color = phaseColors[session.phase] || '#666'

  return (
    <div className="session-card">
      <div className="session-card-header">
        <div className="session-card-phase" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="session-card-title">
          <h3>{session.title}</h3>
          <span className="session-card-time">
            {new Date(session.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
        {session.completed && <span className="session-card-badge">完成</span>}
      </div>

      {session.summary && (
        <p className="session-card-summary">{session.summary}</p>
      )}

      <div className="session-card-stats">
        {session.skillCalls.length > 0 && (
          <div className="session-card-section">
            <span className="section-label">Skill 调用:</span>
            <div className="skill-tags">
              {session.skillCalls.slice(0, 5).map(call => (
                <span key={call.id} className="skill-tag">
                  {call.skill}
                </span>
              ))}
              {session.skillCalls.length > 5 && (
                <span className="skill-tag more">+{session.skillCalls.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {session.artifacts.length > 0 && (
          <div className="session-card-section">
            <span className="section-label">生成工件:</span>
            <div className="artifact-tags">
              {session.artifacts.slice(0, 5).map(artifact => (
                <span key={artifact.id} className="artifact-tag">
                  {artifact.type === 'code' ? '📄' : '📝'} {artifact.name}
                </span>
              ))}
              {session.artifacts.length > 5 && (
                <span className="artifact-tag more">+{session.artifacts.length - 5}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
