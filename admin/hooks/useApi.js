import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(
    async (path, options = {}) => {
      const { method = 'GET', body, headers = {}, rawResponse = false } = options;
      const finalHeaders = { ...headers };
      let payload = body;

      if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
      }

      if (payload instanceof FormData) {
        // Browser will set multipart headers automatically
      } else if (payload !== undefined && payload !== null) {
        finalHeaders['Content-Type'] = 'application/json';
        payload = JSON.stringify(payload);
      }

      const response = await fetch(path, {
        method,
        headers: finalHeaders,
        body: method === 'GET' || method === 'HEAD' ? undefined : payload
      });

      if (response.status === 401) {
        logout();
        throw new Error('Sitzung ist abgelaufen. Bitte erneut anmelden.');
      }

      if (!response.ok) {
        let errorMessage = 'Es ist ein Fehler aufgetreten.';
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (error) {
          // ignore json parse errors
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204 || rawResponse) {
        return rawResponse ? response : null;
      }

      return response.json();
    },
    [token, logout]
  );

  return { request };
}
