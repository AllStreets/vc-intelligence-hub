import { PageRouter, usePageContext } from './components/PageRouter'
import { Sidebar } from './components/Sidebar'
import { Discover } from './pages/Discover'
import { Evaluate } from './pages/Evaluate'
import { Decide } from './pages/Decide'
import { Track } from './pages/Track'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <PageRouter>
      <AppContent />
    </PageRouter>
  )
}

function AppContent() {
  const { activePage } = usePageContext()

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {activePage === 'discover' && <Discover />}
        {activePage === 'evaluate' && <Evaluate />}
        {activePage === 'decide' && <Decide />}
        {activePage === 'track' && <Track />}
        {activePage === 'settings' && <Settings />}
      </main>
    </div>
  )
}
