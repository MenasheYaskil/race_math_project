import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE } from '../config/Constants';
import { COOKIE_TEACHER_TOKEN, COOKIE_STUDENT_TOKEN } from '../config/cookieNames';

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const fetchTeacherDashboardSnapshot = async (raceId) => {
  const token = Cookies.get(COOKIE_TEACHER_TOKEN);
  return apiClient.get('/get-dashboard-snapshot', { params: { token, raceId } });
};

export const fetchStudentRaceState = async (raceId) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  return apiClient.get('/get-student-race-state', { params: { token, raceId } });
};

export const fetchCurrentQuestion = async (raceId) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  return apiClient.get('/get-current-question', { params: { token, raceId } });
};

export const submitAnswer = async (raceId, questionId, selectedOptionId) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('raceId', raceId);
  formData.append('questionId', questionId);
  formData.append('selectedOptionId', selectedOptionId !== undefined && selectedOptionId !== '' ? selectedOptionId : '-1');
  return apiClient.post('/submit-answer', formData);
};

export const choosePath = async (raceId, choice) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('raceId', raceId);
  formData.append('choice', choice);
  return apiClient.post('/choose-path', formData);
};

export const useHelp = async (raceId, helpType) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('raceId', raceId);
  formData.append('helpType', helpType);
  return apiClient.post('/use-help', formData);
};

export const joinRace = async (raceCode, studentName) => {
  const formData = new URLSearchParams();
  formData.append('raceCode', raceCode);
  formData.append('displayName', studentName);
  return apiClient.post('/join-race', formData);
};

export const finishRace = async (raceId) => {
  const token = Cookies.get(COOKIE_TEACHER_TOKEN);
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('raceId', raceId);
  return apiClient.post('/finish-race', formData);
};

export default apiClient;
