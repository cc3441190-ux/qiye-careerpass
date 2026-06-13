import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import EnterpriseLayout from './components/EnterpriseLayout'
import Dashboard from './pages/Dashboard'
import TalentSearch from './pages/TalentSearch'
import ChallengeManage from './pages/ChallengeManage'
import CareerPassVerify from './pages/CareerPassVerify'
import Messages from './pages/Messages'
import CreateChallenge from './pages/CreateChallenge'
import TalentDetail from './pages/TalentDetail'
import ChallengeReview from './pages/ChallengeReview'
import EnterpriseSettings from './pages/EnterpriseSettings'
import EnterpriseVerify from './pages/EnterpriseVerify'
import InterviewManage from './pages/InterviewManage'
import InterviewerFeedback from './pages/InterviewerFeedback'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<EnterpriseLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="talent" element={<TalentSearch />} />
            <Route path="talent/:id" element={<TalentDetail />} />
            <Route path="challenge" element={<ChallengeManage />} />
            <Route path="challenge/create" element={<CreateChallenge />} />
            <Route path="challenge/review" element={<ChallengeReview />} />
            <Route path="verify" element={<CareerPassVerify />} />
            <Route path="enterprise-verify" element={<EnterpriseVerify />} />
            <Route path="messages" element={<Messages />} />
            <Route path="interview" element={<InterviewManage />} />
            <Route path="interview/:id/feedback" element={<InterviewerFeedback />} />
            <Route path="settings" element={<EnterpriseSettings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
