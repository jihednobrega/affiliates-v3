export interface AuthContextProps {
    user: User;
    setUser: (fields: Partial<User>) => void;
    brands: Brand[];
    currentBrand?: Brand;
    setBrand: (brand: Brand) => void;
    removeBrand: (id: number) => void;
    brandVendor: string;
    isLoggedIn: boolean;
    setLoggedIn: (value: boolean) => void;
    signin: (values: AuthSigninRequest, options: SigninOptions) => void;
    signout: () => void;
    isLoading: boolean;
}

export type User = {
    name: string | null;
    role: Role | null;
    email: string | null;
    avatar: string | null;
    token: string | null;
    showedPopUp: boolean | null;
    currentBrandId: number | null;
    code?: string | null;
    balance?: number;
    app_version: string | null;
};

export type Role = "affiliate" | "referral" | "brand" | "agent" | "seller" | "accountant";

export type Brand = {
    id: number;
    name: string;
    logo: string;
    vendor?: string;
};

export type SigninOptions = {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    redirect?: boolean;
};

export type AuthSigninRequest = {
    email: string;
    password: string;
};