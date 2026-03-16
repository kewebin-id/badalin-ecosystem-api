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
}

export enum ESubmissionRoutes {
  SUBMIT = '/submit',
  UPLOAD_PROOF = '/:id/upload-proof',
}

export enum EDocumentRoutes {
  DOWNLOAD_VISA = '/visa/:transactionId',
}

export enum EAuthRoutes {
  CHECK_USER = '/check-user',
  REGISTER = '/register',
  LOGIN = '/login',
}
