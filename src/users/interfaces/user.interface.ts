export interface User {
  user_id: number;
  username: string;
  email: string;
  phoneNum: string;
  role_id: number;
  Status_id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  imgUrl: string;
  introduction: string;
  Health_information: string;
  illness: string;
}

export interface UserResponse {
  status: string;
  data: User;
  message?: string;
} 