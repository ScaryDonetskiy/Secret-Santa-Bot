import * as admin from "firebase-admin";
import {DbResult} from "../types/DbResult";

export class TeamRepository {
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    create(adminId: string): DbResult {
        const document = this.getCollection().doc();
        const promise = document.set({
            adminId: adminId
        });

        return new DbResult(document, promise);
    }

    find(id: string): Promise<FirebaseFirestore.DocumentSnapshot> {
        return this.findDoc(id).get();
    }

    findDoc(id: string): FirebaseFirestore.DocumentReference {
        return this.getCollection().doc(id);
    }

    private getCollection(): FirebaseFirestore.CollectionReference {
        return this.db.collection('teams');
    }
}