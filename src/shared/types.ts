import { NoteContent, NoteInfo } from './models'

export type GetNotes = () => Promise<NoteInfo[]>
export type ReadNote = (title: NoteInfo['title']) => Promise<string>
export type WriteNote = (title: NoteInfo['title'], content: NoteContent) => Promise<void>
