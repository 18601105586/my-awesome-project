import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Board from './components/Board/Board'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="app-header">
          <h1>Kanban Board</h1>
        </header>
        <Board />
      </div>
    </QueryClientProvider>
  )
}

export default App
