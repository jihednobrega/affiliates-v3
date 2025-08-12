export interface AuthSigninRequest {
    email: string;
    password: string;
}

export interface AuthSigninResponse {
    data: {
        token: string;
        role: string;
        name: string;
    };
}

export interface AuthHeaderResponse {
    data: {
        avatar: string;
        brand: {
            id: number;
            name: string;
            logo: string;
            vendor: string;
        };
        name: string;
        available_brands: Brand[];
        balance: number;
        code: string;
        role: string;
        app_version: string;
    };
}

export interface Brand {
    id: number;
    name: string;
    logo: string;
    vendor?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    data: {
        message: string;
    };
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordResponse {
    data: {
        message: string;
    };
}