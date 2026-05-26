import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Board from './components/Board/Board'
import Timeline from './components/Timeline/Timeline'
import StatsPanel from './components/StatsPanel/StatsPanel'
import './App.css'

const queryClient = new QueryClient()

type ViewMode = 'board' | 'timeline'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('board')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="app-header">
          <h1>AI 研发看板</h1>
          <div className="view-toggle">
            <button
              className={viewMode === 'board' ? 'active' : ''}
              onClick={() => setViewMode('board')}
            >
              看板
            </button>
            <button
              className={viewMode === 'timeline' ? 'active' : ''}
              onClick={() => setViewMode('timeline')}
            >
              时间线
            </button>
          </div>
        </header>

        {viewMode === 'board' ? (
          <Board />
        ) : (
          <div className="timeline-view">
            <StatsPanel />
            <Timeline />
          </div>
        )}
      </div>
    </QueryClientProvider>
  )
}

export default App
