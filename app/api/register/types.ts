export interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export interface RegisterResponseBody {
  success: boolean;
  message: string;
}