export enum EPrefix {
  V1 = '/api/v1',
}

export enum EActorPrefix {
  ADMIN = `${EPrefix.V1}/admin`,
  PILGRIM = `${EPrefix.V1}`,
  PROVIDER = `${EPrefix.V1}/:slug`,
}

export enum EVisaRoutes {
  // Admin Features
  ADMIN_AUTH = `${EActorPrefix.ADMIN}/auth`,
  ADMIN_INVITATION = `${EActorPrefix.ADMIN}/invitation`,
  
  // Provider Features
  PROVIDER_AUTH = `${EActorPrefix.PROVIDER}/auth`,
  PROVIDER_AGENCY = `${EActorPrefix.PROVIDER}/agency`,
  PROVIDER_VERIFICATION = `${EActorPrefix.PROVIDER}/verification`,
  PROVIDER_MANIFEST = `${EActorPrefix.PROVIDER}/manifest`,
  
  // Pilgrim Features
  PILGRIM_AUTH = `${EActorPrefix.PILGRIM}/auth`,
  PILGRIM_SUBMISSION = `${EActorPrefix.PILGRIM}/submission`,
  PILGRIM_DASHBOARD = `${EActorPrefix.PILGRIM}/dashboard`,
  PILGRIM_DOCUMENT = `${EActorPrefix.PILGRIM}/document`,
  PILGRIM_PROFILE = `${EActorPrefix.PILGRIM}/profile`,
  UPLOAD = `${EPrefix.V1}/upload`,
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

export enum ESubmissionRoutes {
  LIST = '/',
  DETAIL = '/:id',
  SUBMIT = '/submit',
  PREVIEW = '/preview',
  VERIFY_PAYMENT = '/:id/verify-payment',
  REVIEW = '/:id/review',
}

export enum EManifestRoutes {
  FLIGHT = '/:id/flight',
  HOTEL = '/:id/hotel',
  TRANSPORT = '/:id/transport',
}

export enum EDocumentRoutes {
  DOWNLOAD_VISA = '/visa/:transactionId',
}
