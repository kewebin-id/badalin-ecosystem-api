export enum EPrefix {
  V1 = '/api/v1',
}

export enum EActorPrefix {
  ADMIN = `${EPrefix.V1}/admin`,
  PILGRIM = `${EPrefix.V1}/visa`,
  PROVIDER = `${EPrefix.V1}/:slug`,
}

export enum EVisaRoutes {
  // Admin Features
  ADMIN_AUTH = `${EActorPrefix.ADMIN}/auth`,
  ADMIN_INVITATION = `${EActorPrefix.ADMIN}/invitation`,
  
  // Provider Features
  PROVIDER_AUTH = `${EActorPrefix.PROVIDER}/auth`,
  PROVIDER_AGENCY = `${EActorPrefix.PROVIDER}/agency`,
  PROVIDER_DASHBOARD = `${EActorPrefix.PROVIDER}/dashboard`,
  PROVIDER_VERIFICATION = `${EActorPrefix.PROVIDER}/submissions`,
  PROVIDER_MANIFEST = `${EActorPrefix.PROVIDER}/submissions`,
  PROVIDER_REFUND = `${EActorPrefix.PROVIDER}/refund`,
  
  // Pilgrim Features
  PILGRIM_AUTH = `${EActorPrefix.PILGRIM}/auth`,
  PILGRIM_SUBMISSION = `${EActorPrefix.PILGRIM}`,
  PILGRIM_DASHBOARD = `${EActorPrefix.PILGRIM}/dashboard`,
  PILGRIM_DOCUMENT = `${EActorPrefix.PILGRIM}/document`,
  PILGRIM_PROFILE = `${EActorPrefix.PILGRIM}/profile`,
  PILGRIM_MANAGEMENT = `${EActorPrefix.PILGRIM}/pilgrims`,
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
  LIST = '/transactions',
  DETAIL = '/transactions/:id',
  SUBMIT = '/submit',
  PREVIEW = '/submissions/preview',
  VERIFY_PAYMENT = '/transactions/:id/verify-payment',
  UPLOAD_PROOF = '/transactions/:id/upload-proof',
  REVIEW = '/transactions/:id/review',
}

export enum EManifestRoutes {
  FLIGHT = '/:id/manifest/flight',
  HOTEL = '/:id/manifest/hotel',
  TRANSPORT = '/:id/manifest/transport',
}

export enum EDocumentRoutes {
  DOWNLOAD_VISA = '/visa/:transactionId',
}
