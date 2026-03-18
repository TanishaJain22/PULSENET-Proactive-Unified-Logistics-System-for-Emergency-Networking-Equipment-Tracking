import { useState, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export const useOtp = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [email, setEmail] = useState('');

  const requestOtp = useCallback(async (emailAddress: string) => {
    if (!emailAddress) {
      toast.error('Please enter your email address');
      return false;
    }

    setIsRequesting(true);
    try {
      await authApi.requestOtp(emailAddress);
      setEmail(emailAddress);
      setOtpRequested(true);
      toast.success('OTP sent to your email address');
      return true;
    } catch (error) {
      console.error('OTP request failed:', error);
      toast.error('Failed to send OTP. Please try again.');
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const resetOtp = useCallback(() => {
    setOtpRequested(false);
    setEmail('');
  }, []);

  return {
    isRequesting,
    otpRequested,
    email,
    requestOtp,
    resetOtp
  };
};