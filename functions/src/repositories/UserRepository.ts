import * as admin from "firebase-admin";
import {DbResult} from "../types/DbResult";

export class UserRepository {
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    createToTeam(id: string, username: string, teamId: string): DbResult {
        const document = this.getCollection().doc(id);
        const promise = document.set({
            username: username,
            teamId: teamId
        });

        return new DbResult(document, promise);
    }

    find(id: string): Promise<FirebaseFirestore.DocumentSnapshot> {
        return this.getCollection().doc(id).get();
    }

    findByTeamId(id: string): Promise<FirebaseFirestore.QuerySnapshot> {
        return this.getCollection().where('teamId', '==', id).get();
    }

    private getCollection(): FirebaseFirestore.CollectionReference {
        return this.db.collection('users');
    }
}