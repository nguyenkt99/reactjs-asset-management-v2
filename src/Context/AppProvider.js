import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import useFirestore from '../hooks/useFirestore';
import AuthService from '../services/auth.service';

export const AppContext = React.createContext();

export default function AppProvider({ children }) {
    const [showToastNotify, setShowToastNotify] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [clickedNotify, setClickedNotify] = useState(null)

    const notificationsCondition = React.useMemo(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            return {
                fieldName: 'username',
                operator: '==',
                compareValue: user.role === 'ROLE_ADMIN' ? 'admin' : user.username,
            };
        }
    }, []);

    useEffect(() => {
        let collectionRef = db.collection('notifications').orderBy('createdDate', 'desc');
        if (notificationsCondition) {
            if (!notificationsCondition.compareValue || !notificationsCondition.compareValue.length) {
                // reset documents data
                setNotifications([]);
                return;
            }

            collectionRef = collectionRef.where(
                notificationsCondition.fieldName,
                notificationsCondition.operator,
                notificationsCondition.compareValue
            );
        }

        const unsubscribe = collectionRef.onSnapshot((snapshot) => {
            const documents = snapshot.docs.map((doc) => {
                return {
                    ...doc.data(),
                    id: doc.id,
                }
            });

            setShowToastNotify(true);
            setNotifications(documents);
            setClickedNotify(null)
        });

    }, []);

    return (
        <AppContext.Provider
            value={{
                showToastNotify,
                setShowToastNotify,
                notifications,
                clickedNotify, 
                setClickedNotify
            }}
        >
            {children}
        </AppContext.Provider>
    );
}