import dataProvider from '../providers/dataProvider';

export const authService = {
  getCurrentUser: () => {
    return dataProvider.getCurrentUser();
  },

  login: (email, password) => {
    return dataProvider.login(email, password);
  },

  register: (name, email, phone, password, address) => {
    return dataProvider.register(name, email, phone, password, address);
  },

  verifyEmailToken: (tokenOrEmail) => {
    if (dataProvider.verifyEmailToken) {
      return dataProvider.verifyEmailToken(tokenOrEmail);
    }
    return dataProvider.verifyEmailCode ? dataProvider.verifyEmailCode(tokenOrEmail, '123456') : { success: true };
  },

  resendVerificationEmail: (email) => {
    if (dataProvider.resendVerificationEmail) {
      return dataProvider.resendVerificationEmail(email);
    }
    return { success: true, message: 'Verification link resent.' };
  },

  verifyEmailCode: (email, code) => {
    return dataProvider.verifyEmailCode ? dataProvider.verifyEmailCode(email, code) : { success: true };
  },

  updateProfile: (userIdOrFields, updatedData) => {
    return dataProvider.updateProfile(userIdOrFields, updatedData);
  },

  requestPasswordReset: (email) => {
    return dataProvider.requestPasswordReset(email);
  },

  verifyPasswordResetCode: (email, code) => {
    if (dataProvider.verifyPasswordResetCode) {
      return dataProvider.verifyPasswordResetCode(email, code);
    }
    return { success: true };
  },

  resetPassword: (email, tokenOrCode, newPassword) => {
    return dataProvider.resetPassword(email, tokenOrCode, newPassword);
  },

  changePassword: (userIdOrEmail, oldPassword, newPassword) => {
    if (dataProvider.changePassword) {
      return dataProvider.changePassword(userIdOrEmail, oldPassword, newPassword);
    }
    return dataProvider.resetPassword(userIdOrEmail, null, newPassword);
  },

  logout: () => {
    return dataProvider.logout();
  }
};

export default authService;
