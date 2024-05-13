import { sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase.js";

export const sendVerificationEmail = async (user) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);

    console.log(`Email verification sent to ${user.email}`);
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

    await auth.sendPasswordResetEmail(email, actionCodeSettings);

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
