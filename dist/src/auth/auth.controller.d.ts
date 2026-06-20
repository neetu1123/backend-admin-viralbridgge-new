import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string | undefined;
        };
    }>;
    login(body: any, req: {
        headers: Record<string, string | string[] | undefined>;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string | undefined;
        };
    }>;
    getMe(req: any): any;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
