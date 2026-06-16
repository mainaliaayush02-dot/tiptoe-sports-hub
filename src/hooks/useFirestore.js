import { useState, useEffect } from 'react'
import {
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export function useCollection(queryOrRef) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(
      queryOrRef,
      snap => {
        setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { docs, loading, error }
}

export const addDocument = (colRef, data) =>
  addDoc(colRef, { ...data, createdAt: serverTimestamp() })

export const updateDocument = (collectionPath, id, data) =>
  updateDoc(doc(db, collectionPath, id), data)

export const deleteDocument = (collectionPath, id) =>
  deleteDoc(doc(db, collectionPath, id))
