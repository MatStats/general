import { ConfirmationResult, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth } from './firebase';

export const requestOtp = async (
  phoneNumber: string,
  recaptchaVerifier: any
): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
};

export const confirmOtp = async (confirmation: ConfirmationResult, code: string) => {
  return confirmation.confirm(code);
};
