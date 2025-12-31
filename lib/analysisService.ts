import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';

export interface AnalysisHistory {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  analysisData: any;
  createdAt: Timestamp | Date;
}

const ANALYSES_COLLECTION = 'analyses';

export async function saveAnalysis(
  userId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  analysisData: any
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, ANALYSES_COLLECTION), {
      userId,
      fileName,
      fileType,
      fileSize,
      analysisData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}

export async function getUserAnalyses(userId: string): Promise<AnalysisHistory[]> {
  try {
    // Query by userId only (no orderBy to avoid index requirement)
    const q = query(
      collection(db, ANALYSES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const analyses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as AnalysisHistory[];
    
    // Sort by createdAt in descending order (newest first) in JavaScript
    analyses.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return analyses;
  } catch (error) {
    console.error('Error fetching user analyses:', error);
    throw error;
  }
}

export async function getAnalysisById(analysisId: string): Promise<AnalysisHistory | null> {
  try {
    const docRef = doc(db, ANALYSES_COLLECTION, analysisId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as AnalysisHistory;
    }
    return null;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
}

