import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js";
import { firebaseConfig } from "./firebase.js";

export const sendVerificationEmail = async (user) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    const email = user.email;
    const displayName = user.displayName || 'User';
    const appName = 'Noobs-inc';

    const actionCode = await sendEmailVerification(user, actionCodeSettings);

    const verificationLink = `https://chatroom-50dfb.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=${actionCode}&apiKey=${firebaseConfig.apiKey}`;

    const emailTemplate = `From: Noobs-Inc@chatroom-50dfb.firebaseapp.com
Reply to: noreply
Subject: Verify your email for ${appName}
Message:
Hello ${displayName},

Follow this link to verify your email address.

${verificationLink}

If you didn't ask to verify this address, you can ignore this email.

Thanks,

Your ${appName} team`;

    // Send the email verification email using your preferred method (e.g., email service provider)
    console.log(emailTemplate);
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

    const actionCode = await sendPasswordResetEmail(auth, email, actionCodeSettings);

    const resetLink = `https://chatroom-50dfb.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=${actionCode}&apiKey=${firebaseConfig.apiKey}`;

    const emailTemplate = `Sender name: Noobs-Inc
From: Noobs-inc@chatroom-50dfb.firebaseapp.com
Reply to: noreply
Subject: Reset your password for ${appName}
Message:
Hello,

Follow this link to reset your ${appName} password for your ${email} account.

${resetLink}

If you didn't ask to reset your password, you can ignore this email.

Thanks,

Your ${appName} team`;

    // Send the password reset email using your preferred method (e.g., email service provider)
    console.log(emailTemplate);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
