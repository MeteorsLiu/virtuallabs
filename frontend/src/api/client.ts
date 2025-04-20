import { EduAPIClient } from './sdk/api-client';

export const apiClient = new EduAPIClient({
  baseURL: 'http://localhost:8888',
  timeout: 10000
});
