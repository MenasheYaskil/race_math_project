export const ROUTES = {
  HOME: '/',
  TEACHER_LOGIN: '/teacher/login',
  TEACHER_CREATE_RACE: '/teacher/create-race',
  TEACHER_LOBBY: (code) => `/teacher/race/${code}/lobby`,
  TEACHER_DASHBOARD: (id) => `/teacher/race/${id}/live`,
  TEACHER_RESULTS: (id) => `/teacher/race/${id}/results`,
  STUDENT_JOIN: '/student/join',
  STUDENT_LOBBY: (code) => `/student/race/${code}/lobby`,
  STUDENT_RACE: (id) => `/student/race/${id}/play`,
  STUDENT_RESULTS: (id) => `/student/race/${id}/results`
}
