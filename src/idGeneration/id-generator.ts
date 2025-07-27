import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

export function generateUUId(version: IdType = IdType.V4): string {
    if (version == null || version === IdType.V1) {
        return uuidv1();
    }
    return uuidv4();
}

export enum IdType {
    V1,
    V4,
}
