import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './config/routePaths'
import HomePage from './pages/HomePage'
import TeacherLoginPage from './pages/TeacherLoginPage'
import TeacherCreateRacePage from './pages/TeacherCreateRacePage'
import TeacherLobbyPage from './pages/TeacherLobbyPage'
import TeacherRaceDashboardPage from './pages/TeacherRaceDashboardPage'
import TeacherResultsPage from './pages/TeacherResultsPage'
import StudentJoinPage from './pages/StudentJoinPage'
import StudentLobbyPage from './pages/StudentLobbyPage'
import StudentRacePage from './pages/StudentRacePage'
import StudentResultsPage from './pages/StudentResultsPage'

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.TEACHER_LOGIN} element={<TeacherLoginPage />} />
        <Route path={ROUTES.TEACHER_CREATE_RACE} element={<TeacherCreateRacePage />} />
        <Route path="/teacher/race/:raceCode/lobby" element={<TeacherLobbyPage />} />
        <Route path="/teacher/race/:raceId/live" element={<TeacherRaceDashboardPage />} />
        <Route path="/teacher/race/:raceId/results" element={<TeacherResultsPage />} />
        <Route path={ROUTES.STUDENT_JOIN} element={<StudentJoinPage />} />
        <Route path="/student/race/:raceCode/lobby" element={<StudentLobbyPage />} />
        <Route path="/student/race/:raceId/play" element={<StudentRacePage />} />
        <Route path="/student/race/:raceId/results" element={<StudentResultsPage />} />
      </Routes>
    </div>
  )
}

export default App
