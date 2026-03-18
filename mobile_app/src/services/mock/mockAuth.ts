import { User, UserRole } from '../../types';

export const mockLogin = async (username: string, password: string): Promise<{user: User, token: string}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let role: UserRole = 'PATIENT';
      
      if (username.toLowerCase().includes('driver')) {
        role = 'DRIVER';
      } else if (username.toLowerCase().includes('paramedic')) {
        role = 'PARAMEDIC';
      }

      resolve({
        user: {
          id: `usr_${Math.floor(Math.random() * 10000)}`,
          name: username || 'Mock User',
          role: role,
        },
        token: 'mock_jwt_token_12345'
      });
    }, 1000);
  });
};
