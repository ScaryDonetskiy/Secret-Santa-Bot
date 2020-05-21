import * as admin from "firebase-admin";

export class TeamRepository {
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    /**
     *
     * @param adminId
     */
    create(adminId: string): Promise<FirebaseFirestore.WriteResult> {
        const document = this.db.collection('teams').doc();

        return document.set({
            adminId: adminId
        });
    }
}