import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js";

export const sendVerificationEmail = async (user) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    const email = user.email;
    const displayName = user.displayName || 'User';
    const appName = 'Noobs-inc';

    await sendEmailVerification(user, actionCodeSettings);

    console.log(`Email verification sent to ${email}`);
  } catch (error) {
    console.error('Error sending email verification:', error);
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    const appName = 'Noobs-inc';

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
