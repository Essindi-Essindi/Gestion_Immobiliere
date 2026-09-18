export type {
  User,
  UserRole,
  UserPreferences,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest
} from './user.model';

export type {
  Logement,
  LogementType,
  LogementStatus,
  Address,
  Photo,
  Diagnostic,
  DiagnosticType
} from './logement.model';

export type {
  Locataire,
  Paiement,
  PaiementStatus,
  PaiementType,
  PaiementMethod,
  Document,
  DocumentType,
  EmergencyContact,
  Guarantor
} from './locataire.model';

export type {
  Contrat,
  ContratStatus,
  ContratFormData
} from './contrat.model';

export type {
  Intervention,
  InterventionStatus,
  InterventionPriority,
  InterventionCategory,
  InterventionFormData,
  Photo as InterventionPhoto
} from './intervention.model';

export type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationFormData,
  NotificationPreferences
} from './notification.model';

export type {
  Proprietaire,
  BankDetails,
  SubscriptionPlan,
  SubscriptionPlanDetails
} from './proprietaire.model';

export type {
  SuperAdminDashboardStats,
  ProprietaireDashboardStats,
  LocataireDashboardStats,
  Activity,
  Alert
} from './dashboard.model';