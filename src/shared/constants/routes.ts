export enum EPrefix {
  V1 = '/api/v1',
}

export enum EServiceRoutes {
  VISA = `${EPrefix.V1}/visa`,
}

export enum EVisaRoutes {
  AUTH = `${EServiceRoutes.VISA}/auth`,
  PILGRIMS = `${EServiceRoutes.VISA}/pilgrims`,
  TRANSACTIONS = `${EServiceRoutes.VISA}/transactions`,
  DOCUMENTS = `${EServiceRoutes.VISA}/documents`,
  DASHBOARD = `${EServiceRoutes.VISA}/dashboard`,
  UPLOAD = `${EPrefix.V1}/upload`,
  SUBMISSIONS = `${EServiceRoutes.VISA}/submissions`,
  PILGRIM_AUTH = `${EPrefix.V1}/auth`,
  PROVIDER_AUTH = `${EPrefix.V1}/p/auth`,
  ADMIN = `${EPrefix.V1}/admin`,
}

export enum ESubmissionRoutes {
  SUBMIT = '/submit',
  UPLOAD_PROOF = '/:id/upload-proof',
  PREVIEW = '/preview',
}

export enum EDocumentRoutes {
  DOWNLOAD_VISA = '/visa/:transactionId',
}

export enum EAuthRoutes {
  CHECK_USER = '/check-user',
  REGISTER = '/register',
  LOGIN = '/login',
  FORGOT_PASSWORD = '/forgot-password',
  VERIFY_RESET_TOKEN = '/verify-reset-token',
  RESET_PASSWORD = '/reset-password',
  VERIFY_INVITATION_TOKEN = '/verify-token',
  GENERATE_INVITATION = '/generate-invitation',
}

export enum EDashboardRoutes {
  HISTORY = '/history',
}
