import { NoteContent, NoteInfo } from '@shared/models'
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

const loadNotes = async () => {
  const notes = await window.context.getNotes()
  return notes.sort((a, b) => b.lastEditTime - a.lastEditTime)
}

const notesAtomAsync = atom<NoteInfo[] | Promise<NoteInfo[]>>(loadNotes())

export const notesAtom = unwrap(notesAtomAsync, (prev) => prev)

export const selectedNoteIndexAtom = atom<number | null>(null)

export const selectedNoteAtomAsync = atom(async (get) => {
  const notes = get(notesAtom)
  const index = get(selectedNoteIndexAtom)
  if (index == null || !notes) return null

  const selectedNote = notes[index]
  const noteContent = await window.context.readNote(selectedNote.title)

  return {
    ...selectedNote,
    content: noteContent
  }
})

export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  (prev) =>
    prev ?? {
      title: '',
      lastEditTime: Date.now(),
      content: ''
    }
)

export const saveNoteAtom = atom(null, async (get, set, content: NoteContent) => {
  const notes = get(notesAtom)
  const selectedNote = get(selectedNoteAtom)

  if (!notes || !selectedNote) return

  await window.context.writeNote(selectedNote.title, content)
  set(
    notesAtom,
    notes.map((note) =>
      note.title === selectedNote.title ? { ...note, lastEditTime: Date.now() } : note
    )
  )
})

export const createEmptyNoteAtom = atom(null, (get, set) => {
  const notes = get(notesAtom)
  if (!notes) return

  const title = `Note ${notes.length + 1}`

  const newNote: NoteInfo = {
    title,
    lastEditTime: Date.now()
  }
  set(notesAtom, [newNote, ...notes.filter((note) => note.title !== title)])
  set(selectedNoteIndexAtom, 0)
})

export const deleteNoteAtom = atom(null, (get, set) => {
  const notes = get(notesAtom)
  if (!notes) return

  const selectedNote = get(selectedNoteAtom)

  if (!selectedNote) return

  set(
    notesAtom,
    notes.filter((node) => node.title !== selectedNote.title)
  )
  set(selectedNoteIndexAtom, null)
})
