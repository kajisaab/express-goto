import { UserDetails } from './userDetails';

export class RequestContext {
    private userDetail: UserDetails;

    constructor(userDetails: UserDetails) {
        this.userDetail = userDetails;
    }

    getUserDetails(): UserDetails {
        return this.userDetail;
    }
}
