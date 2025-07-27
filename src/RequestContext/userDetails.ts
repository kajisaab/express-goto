export class UserDetails {
    readonly userId: string;
    readonly userName: string;
    readonly fullName: string;
    readonly email: string;

    constructor(userId: string, userName: string, fullName: string, email: string) {
        this.userId = userId;
        this.userName = userName;
        this.fullName = fullName;
        this.email = email;
    }
}
