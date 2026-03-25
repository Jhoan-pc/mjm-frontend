import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, updateDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useContentStore = create(
  persist(
    (set, get) => ({
      landing: {
        hero: {
          title: "Expertos en Aseguramiento Metrológico",
          subtitle: "Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad"
        },
        services: [] // Próximamente
      },
      loading: false,

      fetchLandingContent: async () => {
        set({ loading: true });
        try {
          // Intentamos obtener desde Firestore
          const docRef = doc(db, 'content', 'landing');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
             set({ landing: docSnap.data(), loading: false });
          } else {
             console.warn("Usando contenido de respaldo para Landing.");
             set({ loading: false });
          }
        } catch (error) {
          console.error("Error fetching landing content:", error);
          set({ loading: false });
        }
      },

      // Listener en tiempo real (opcional)
      subscribeToLanding: () => {
        const docRef = doc(db, 'content', 'landing');
        return onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            set({ landing: doc.data() });
          }
        });
      },

      updateLandingContent: async (newContent) => {
        set({ landing: { ...get().landing, ...newContent } });
        try {
          const docRef = doc(db, 'content', 'landing');
          await updateDoc(docRef, newContent);
        } catch (error) {
           console.error("Error syncing content to Firestore:", error);
        }
      },

      submitChatbotForm: async (formData) => {
        try {
          // Guardar en una colección de 'solicitudes' o 'chatbot_submissions'
          const submissionsRef = collection(db, 'chatbot_submissions');
          await addDoc(submissionsRef, {
            ...formData,
            timestamp: serverTimestamp(),
            status: 'pendiente'
          });
          return true;
        } catch (error) {
          console.error("Error saving chatbot submission:", error);
          return false;
        }
      }
    }),
    {
      name: 'mjm-content-storage',
    }
  )
);
