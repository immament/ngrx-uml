import { Member } from './member.model';

export interface State {
    name: string;
    properties: Member[] | undefined;
}
