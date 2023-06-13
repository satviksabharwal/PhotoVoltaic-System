// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, writeBatch, query, getDocs } from 'firebase/firestore';

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  //   measurementId: process.env.REACT_APP_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
// *************** creating user document inside of firestore database >>>>>>>>>>>

export const db = getFirestore();

export const createUserDocumentFromAuth = async (userAuth, additionalInformation = {}) => {
  if (!userAuth) return;
  const userDocRef = doc(db, 'users', userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);
  // console.log('userSnapshot',userSnapshot)
  // console.log('userSnapshot',userSnapshot.exists())

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await setDoc(userDocRef, { displayName, email, createdAt, ...additionalInformation });
    } catch (error) {
      console.log('error while creating a user', error.message);
    }
  }
  // eslint-disable-next-line consistent-return
  return userDocRef;
};

// *************** firebase auth methods implementations are as follows >>>>>>>>>>>

// signUp with email and password
export const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;
  // eslint-disable-next-line consistent-return, no-return-await
  return await createUserWithEmailAndPassword(auth, email, password);
};

// signIn with email and password
export const signInAuthWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;
  // eslint-disable-next-line consistent-return, no-return-await
  return await signInWithEmailAndPassword(auth, email, password);
};

// sign in with google
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});
export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);

// sign out user
// eslint-disable-next-line no-return-await
export const signOutUser = async () => await signOut(auth);

// Observer pattern
export const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, callback);
};

// write - upload data from app to firestore

export const addCollectionAndDocuments = async (collectionKey, objectsToAdd) => {
  const collectionRef = collection(db, collectionKey);
  const batch = writeBatch(db);

  objectsToAdd.array.forEach((object) => {
    const docRef = doc(collectionRef, object);
    batch.set(docRef, object);
  });
  await batch.commit();
  console.log('data upload successful');
};

// fetch all documents from a collection  from firestore

export const getDocuments = async (collectionKey) => {
  // here inside of firestore e.g, users is called collectionKey
  // const collectionRef=collection(db,'replace with name of collectionKey')
  const collectionRef = collection(db, collectionKey);
  const q = query(collectionRef);
  const querysnapshot = await getDocs(q);
  // do any operation on the querysnapshot whatever you want and return result according to the requirement
  return querysnapshot;
};

// fetch single document
// eslint-disable-next-line consistent-return
export const getSingleDocument = async (collectionKey, id) => {
  const singleDocRef = doc(db, collectionKey, id);
  const singleDocSnap = await getDoc(singleDocRef);

  if (singleDocSnap.exists()) {
    const responseDoc = singleDocSnap.data();
    return responseDoc;
  }
  // doc.data() will be undefined in this case
  console.log('No such document!');
};

// forgot password

export const forgotPassword = (email) =>
  sendPasswordResetEmail(auth, email, {
    url: 'http://localhost:3000/login',
  });

// const analytics = getAnalytics(app);
