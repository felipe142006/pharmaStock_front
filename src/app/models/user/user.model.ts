export interface IUser {
    id: number;
    name: string;
    email: string;
    password?: string;
}

export interface ApiResponse {
    original: {
        success: boolean;
        data: IUser[];
        message: string;
    };
}
