import {TeamRepository} from "./TeamRepository";

export class GiftMapRepository {
    private teamRepository: TeamRepository;

    constructor(teamRepository: TeamRepository) {
        this.teamRepository = teamRepository;
    }

    findByTeamIdAndUserId(teamId: string, userId: string): Promise<FirebaseFirestore.QuerySnapshot> {
        return this.getCollection(teamId).where('from', '==', userId).get();
    }

    findByTeamId(teamId: string): Promise<FirebaseFirestore.QuerySnapshot> {
        return this.getCollection(teamId).get();
    }

    setNewPair(teamId: string, from: string, to: string): Promise<FirebaseFirestore.WriteResult> {
        return this.getCollection(teamId).doc().set({
            from: from,
            to: to
        });
    }

    private getCollection(teamId: string): FirebaseFirestore.CollectionReference {
        return this.teamRepository.findDoc(teamId).collection('gift_map');
    }
}