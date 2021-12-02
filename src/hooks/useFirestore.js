import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';

const useFirestore = (collection, condition) => {
    const [documents, setDocuments] = useState([]);
    const [showToastNotify, setShowToastNotify] = useState(false);

    useEffect(() => {
        let collectionRef = db.collection(collection).orderBy('createdDate', 'desc');
        if (condition) {
            if (!condition.compareValue || !condition.compareValue.length) {
                // reset documents data
                setDocuments([]);
                return;
            }

            collectionRef = collectionRef.where(
                condition.fieldName,
                condition.operator,
                condition.compareValue
            );
        }

        const unsubscribe = collectionRef.onSnapshot((snapshot) => {
            const documents = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            setDocuments(documents);
        });

    }, [collection, condition]);

    return documents;
};

export default useFirestore;