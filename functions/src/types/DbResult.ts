export class DbResult {
    document: FirebaseFirestore.DocumentReference;
    resultPromise: Promise<FirebaseFirestore.WriteResult>;

    constructor(document: FirebaseFirestore.DocumentReference, resultPromise: Promise<FirebaseFirestore.WriteResult>) {
        this.document = document;
        this.resultPromise = resultPromise;
    }
}