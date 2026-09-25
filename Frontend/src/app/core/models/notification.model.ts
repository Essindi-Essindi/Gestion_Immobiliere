export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  ref_type?: string;
  ref_id?: string;
  created_at: string;
}
