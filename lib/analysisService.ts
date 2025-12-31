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
  createdAt: Date | Timestamp;
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
    const analyses = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        analysisData: data.analysisData,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as AnalysisHistory;
    });
    
    // Sort by createdAt in descending order (newest first) in JavaScript
    analyses.sort((a, b) => {
      // createdAt is already converted to Date in the map above, but TypeScript needs help
      const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate ? (a.createdAt as any).toDate() : new Date();
      const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date();
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

