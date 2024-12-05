export interface StarPackage {
    stars: number;
    inf: number;
    discount: number;
}

export interface User {
    user_id: number;
    username: string;
    inf_balance: number;
    referral_code: string;
    referred_by?: number;
    has_paid: boolean;
    last_click_time?: Date;
    created_at: Date;
}

export interface Transaction {
    id: number;
    user_id: number;
    stars_amount: number;
    inf_amount: number;
    transaction_id: string;
    created_at: Date;
}

export interface ClickResponse {
    newBalance: number;
    timeLeft: number;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        id: number;
                    };
                };
            };
        };
    }
}