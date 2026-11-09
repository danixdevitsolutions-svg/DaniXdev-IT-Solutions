'use client'

import {
  BarChart3,
  FileText,
  Globe,
  Image as ImageIcon,
  LogOut,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { useLanguage } from '@/components/language-provider'
import { firebaseConfigured, getFirebaseServices } from '@/lib/firebase'
import {
  createDefaultSiteContent,
  mergeSiteContent,
  type BlogPost,
  type EditableDictionary,
  type HomeService,
  type ImageAsset,
  type Lang,
  type SiteContent,
  type TeamMember,
} from '@/lib/site-content'

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50'
const inputClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/15'
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'content', label: 'Page content', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'services', label: 'Services', icon: ImageIcon },
  { id: 'posts', label: 'Posts', icon: Globe },
  { id: 'settings', label: 'Site settings', icon: Settings },
] as const
type Tab = (typeof tabs)[number]['id']
type PathPart = string | number
type DictionarySection = keyof EditableDictionary

function updateAtPath<T extends object>(value: T, path: PathPart[], nextValue: unknown): T {
  const updated = structuredClone(value) as Record<string, unknown>
  let cursor: Record<string | number, unknown> | unknown[] = updated

  for (const part of path.slice(0, -1)) {
    const child = (cursor as Record<string | number, unknown>)[part]
    if (!child || typeof child !== 'object') {
      throw new Error(`Cannot update missing content field: ${String(part)}`)
    }
    cursor = child as Record<string | number, unknown> | unknown[]
  }

  const last = path[path.length - 1]
  if (last === undefined) throw new Error('A content field path is required.')
  ;(cursor as Record<string | number, unknown>)[last] = nextValue
  return updated as T
}

function labelFor(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getLoginErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : ''

  if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
    return 'Firebase Authentication is not enabled for this project. In Firebase Console, open Authentication → Get started → Sign-in method, then enable Email/Password.'
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This website domain is not authorized for Firebase Authentication. Add it under Authentication → Settings → Authorized domains.'
  }
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Email or password is incorrect, or this account has not been created in Firebase Authentication.'
  }

  return error instanceof Error ? error.message : 'Unable to sign in.'
}

function getAdminVerificationErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : ''

  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'Could not connect to Cloud Firestore. Check that the internet connection is working, create a Firestore database in the same Firebase project, and make sure this domain or network is not blocking Firebase. Then refresh the page.'
  }
  if (code === 'not-found') {
    return 'The Cloud Firestore database was not found. Create the database in the Firebase Console for the same project ID used by this website.'
  }
  if (code === 'permission-denied') {
    return 'Firestore denied access to the admin record. Check that the Firestore rules are published and that admins/{your Firebase Auth UID} exists with role set to admin.'
  }

  return error instanceof Error ? error.message : 'Unable to verify admin access.'
}

function templateForArray(path: PathPart[]): unknown {
  const finalPart = String(path[path.length - 1] ?? '')
  if (finalPart === 'stats') return { value: '', label: '' }
  if (finalPart === 'items') return { title: '', text: '' }
  if (finalPart === 'plans') return { name: '', price: '', desc: '', features: [] }
  return ''
}

function emptyLike(value: unknown): unknown {
  if (typeof value === 'string') return ''
  if (typeof value === 'number') return 0
  if (typeof value === 'boolean') return false
  if (Array.isArray(value)) return []
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, emptyLike(child)]),
    )
  }
  return ''
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-navy">
      {label}
      {multiline ? (
        <textarea id={id} rows={4} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  )
}

function ImageControl({
  label,
  asset,
  onUpload,
  onRemove,
}: {
  label: string
  asset: ImageAsset | null
  onUpload: (file: File) => Promise<void>
  onRemove: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file?: File) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (uploadError) {
      console.error(`Unable to update ${label.toLowerCase()}.`, uploadError)
      setError(uploadError instanceof Error ? uploadError.message : 'The image could not be uploaded.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      await onRemove()
    } catch (removeError) {
      console.error(`Unable to remove ${label.toLowerCase()}.`, removeError)
      setError(removeError instanceof Error ? removeError.message : 'The image could not be removed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-navy">{label}</span>
      {asset?.url && (
        <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-secondary">
          <img src={asset.url} alt={label} className="h-full w-full object-contain" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className={`${secondaryButtonClass} cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          <Upload className="size-4" aria-hidden="true" />
          {busy ? 'Working…' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              void upload(event.currentTarget.files?.[0])
              event.currentTarget.value = ''
            }}
          />
        </label>
        {asset?.url && (
          <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => void remove()}>
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Image files only, maximum 9 MB.</p>
    </div>
  )
}

function ContentTree({
  value,
  path,
  onChange,
}: {
  value: unknown
  path: PathPart[]
  onChange: (path: PathPart[], value: unknown) => void
}) {
  const name = String(path[path.length - 1] ?? 'Content')

  if (typeof value === 'string') {
    return (
      <Field
        label={labelFor(name)}
        value={value}
        multiline={value.length > 90 || value.includes('\n')}
        onChange={(next) => onChange(path, next)}
      />
    )
  }

  if (typeof value === 'number') {
    return (
      <Field
        label={labelFor(name)}
        value={String(value)}
        onChange={(next) => onChange(path, Number.isFinite(Number(next)) ? Number(next) : 0)}
      />
    )
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-navy">
        <input type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} />
        {labelFor(name)}
      </label>
    )
  }

  if (Array.isArray(value)) {
    const items = value
    const objectItems = items.some((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
    function addItem() {
      const item = items.length ? emptyLike(items[0]) : templateForArray(path)
      if (String(path[path.length - 1]) === 'plans' && item && typeof item === 'object') {
        ;(item as Record<string, unknown>).id = `plan-${crypto.randomUUID()}`
      }
      onChange(path, [...items, item])
    }

    return (
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-navy">{labelFor(name)}</h4>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={addItem}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <div key={`${name}-${index}`} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {objectItems ? `${labelFor(name)} ${index + 1}` : `${labelFor(name)} item ${index + 1}`}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${labelFor(name)} item ${index + 1}`}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                  onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              <ContentTree value={item} path={[...path, index]} onChange={onChange} />
            </div>
          ))}
          {!value.length && <p className="text-sm text-muted-foreground">No items yet.</p>}
        </div>
      </div>
    )
  }

  if (value && typeof value === 'object') {
    const fields = Object.entries(value).filter(([key]) => key !== 'id' && !(path.at(-1) === 'team' && key === 'members'))
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([key, child]) => (
          <ContentTree key={key} value={child} path={[...path, key]} onChange={onChange} />
        ))}
      </div>
    )
  }

  return null
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-card" open>
      <summary className="cursor-pointer list-none px-5 py-4 font-bold text-navy marker:hidden">
        {title}
        <span className="float-end text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
      </summary>
      <div className="border-t border-border p-5">{children}</div>
    </details>
  )
}

function makeMember(): TeamMember {
  const id = `member-${crypto.randomUUID()}`
  return {
    id,
    name: { en: '', ur: '' },
    role: { en: '', ur: '' },
    sub: { en: '', ur: '' },
    image: null,
  }
}

function makeHomeService(): HomeService {
  return {
    id: `service-${crypto.randomUUID()}`,
    title: { en: '', ur: '' },
    text: { en: '', ur: '' },
    enabled: true,
    image: null,
  }
}

function makePost(): BlogPost {
  return {
    id: crypto.randomUUID(),
    slug: '',
    title: { en: '', ur: '' },
    summary: { en: '', ur: '' },
    body: { en: '', ur: '' },
    image: null,
    published: false,
    updatedAt: Date.now(),
  }
}

export function AdminDashboard() {
  const { content, setContent, contentError } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [language, setLanguage] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postDraft, setPostDraft] = useState<BlogPost | null>(null)
  const [pendingImageDeletes, setPendingImageDeletes] = useState<ImageAsset[]>([])

  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthReady(true)
      return
    }

    try {
      const { auth, db } = getFirebaseServices()
      return onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser)
        if (!nextUser) {
          setAuthorized(false)
          setAuthReady(true)
          return
        }

        setAuthReady(false)
        void getDoc(doc(db, 'admins', nextUser.uid))
          .then(async (adminDocument) => {
            if (!adminDocument.exists() || adminDocument.data().role !== 'admin') {
              setAuthorized(false)
              setError('This account is not authorized to manage the website.')
              await signOut(auth)
              return
            }

            setAuthorized(true)
            setError(null)
            const contentDocument = await getDoc(doc(db, 'siteContent', 'main'))
            if (contentDocument.exists()) {
              setContent(mergeSiteContent(contentDocument.data()))
            } else {
              setContent(createDefaultSiteContent())
              setNotice('Your Firebase site content is not initialized yet. Save changes to publish the current website content.')
            }
          })
          .catch((authError: unknown) => {
            console.error('Unable to verify the Firebase admin account.', authError)
            setError(getAdminVerificationErrorMessage(authError))
          })
          .finally(() => setAuthReady(true))
      })
    } catch (firebaseError) {
      console.error('Unable to initialize the Firebase admin panel.', firebaseError)
      setError(firebaseError instanceof Error ? firebaseError.message : 'Unable to initialize Firebase.')
      setAuthReady(true)
    }
  }, [setContent])

  useEffect(() => {
    if (!authorized || !firebaseConfigured) return

    try {
      const { db } = getFirebaseServices()
      return onSnapshot(
        collection(db, 'posts'),
        (snapshot) => {
          const records = snapshot.docs.map((entry) => entry.data() as BlogPost)
          setPosts(records)
        },
        (postsError) => {
          console.error('Unable to load posts from Firebase.', postsError)
          setError('Posts could not be loaded. Check the Firestore rules.')
        },
      )
    } catch (postsError) {
      console.error('Unable to subscribe to Firebase posts.', postsError)
      setError(postsError instanceof Error ? postsError.message : 'Unable to load posts.')
    }
  }, [authorized])

  const updateContent = useCallback((path: PathPart[], value: unknown) => {
    setContent((current) => updateAtPath(current, path, value))
    setNotice(null)
  }, [setContent])

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      const { auth } = getFirebaseServices()
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setPassword('')
    } catch (loginError) {
      console.error('Firebase admin sign-in failed.', loginError)
      setError(getLoginErrorMessage(loginError))
    }
  }

  async function saveContent() {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const { db } = getFirebaseServices()
      await setDoc(doc(db, 'siteContent', 'main'), { ...content, posts: [] })
      const { storage } = getFirebaseServices()
      const assetsToDelete = pendingImageDeletes.filter(
        (asset): asset is ImageAsset & { storagePath: string } => Boolean(asset.storagePath),
      )
      const deleteResults = await Promise.allSettled(assetsToDelete.map((asset) => deleteObject(ref(storage, asset.storagePath))))
      const failedDeletes = deleteResults.filter((result) => result.status === 'rejected')
      setPendingImageDeletes(assetsToDelete.filter((_, index) => deleteResults[index]?.status === 'rejected'))
      if (failedDeletes.length) {
        setError(`Website changes were published, but ${failedDeletes.length} removed image file(s) could not be deleted from Storage.`)
        return
      }
      setNotice('Website content saved and published.')
    } catch (saveError) {
      console.error('Unable to save website content.', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Website content could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadImage(file: File, folder: string, id: string): Promise<ImageAsset> {
    if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
    if (file.size > 9 * 1024 * 1024) throw new Error('The image must be smaller than 9 MB.')
    const { storage } = getFirebaseServices()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const storagePath = `site-content/${folder}/${id}/${Date.now()}-${safeName}`
    const imageRef = ref(storage, storagePath)
    await uploadBytes(imageRef, file, { contentType: file.type })
    return { url: await getDownloadURL(imageRef), storagePath }
  }

  async function replaceImage(file: File, folder: string, id: string, previous: ImageAsset | null) {
    const image = await uploadImage(file, folder, id)
    if (previous?.storagePath && previous.storagePath !== image.storagePath) await removeImage(previous)
    return image
  }

  async function removeImage(asset: ImageAsset | null) {
    if (asset?.storagePath) {
      setPendingImageDeletes((current) => current.some((item) => item.storagePath === asset.storagePath) ? current : [...current, asset])
    }
  }

  async function savePost(post: BlogPost) {
    const slug = post.slug.trim().toLowerCase()
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError('Post URL must use lowercase letters, numbers, and hyphens.')
      return
    }
    if (posts.some((existing) => existing.slug === slug && existing.id !== post.id)) {
      setError('Another post already uses this URL slug.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { db } = getFirebaseServices()
      await setDoc(doc(db, 'posts', post.id), { ...post, slug, updatedAt: Date.now() })
      const previousImage = posts.find((existing) => existing.id === post.id)?.image
      const previousStoragePath = previousImage?.storagePath
      if (previousImage && previousStoragePath && previousStoragePath !== post.image?.storagePath) {
        const oldImage = previousImage
        setPendingImageDeletes((current) => current.some((asset) => asset.storagePath === oldImage.storagePath) ? current : [...current, oldImage])
        await deleteObject(ref(getFirebaseServices().storage, previousStoragePath))
        setPendingImageDeletes((current) => current.filter((asset) => asset.storagePath !== previousStoragePath))
      }
      setPostDraft(null)
      setNotice('Post saved.')
    } catch (saveError) {
      console.error('Unable to save post.', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Post could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete “${post.title.en || post.slug}”? This cannot be undone.`)) return
    setError(null)
    try {
      const { db } = getFirebaseServices()
      await deleteDoc(doc(db, 'posts', post.id))
      const imageToDelete = post.image
      if (imageToDelete?.storagePath) {
        try {
          await deleteObject(ref(getFirebaseServices().storage, imageToDelete.storagePath))
        } catch (imageError) {
          setPendingImageDeletes((current) => current.some((asset) => asset.storagePath === imageToDelete.storagePath) ? current : [...current, imageToDelete])
          throw imageError
        }
      }
      setPendingImageDeletes((current) => current.filter((asset) => asset.storagePath !== imageToDelete?.storagePath))
      setNotice('Post deleted.')
    } catch (deleteError) {
      console.error('Unable to delete post.', deleteError)
      setError(deleteError instanceof Error ? deleteError.message : 'Post could not be deleted.')
    }
  }

  async function cancelPostDraft() {
    if (!postDraft) return
    const savedImage = posts.find((post) => post.id === postDraft.id)?.image
    if (postDraft.image?.storagePath && postDraft.image.storagePath !== savedImage?.storagePath) {
      try {
        await deleteObject(ref(getFirebaseServices().storage, postDraft.image.storagePath))
      } catch (imageError) {
        console.error('Unable to remove the unsaved post image.', imageError)
        setError(imageError instanceof Error ? imageError.message : 'The unsaved post image could not be removed.')
        return
      }
    }
    setPostDraft(null)
  }

  const publishedPosts = useMemo(() => posts.filter((post) => post.published).length, [posts])

  if (!firebaseConfigured) {
    return (
      <main className="min-h-dvh bg-secondary/60 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-navy">Connect Firebase to open the admin panel</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Add your Firebase Web app configuration to <code>.env.local</code>, then restart the development server.
            Setup instructions are in <code>admin-panel/README.md</code>.
          </p>
          <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Enable Email/Password authentication.</li>
            <li>Create Firestore and Storage.</li>
            <li>Publish the included security rules and create your admin account.</li>
          </ul>
        </div>
      </main>
    )
  }

  if (!authReady) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Checking Firebase admin access…</main>
  }

  if (!user || !authorized) {
    return (
      <main className="grid min-h-dvh place-items-center bg-secondary/60 px-4 py-10">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">DaniXdev CMS</p>
          <h1 className="mt-2 text-3xl font-bold text-navy">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in using the admin account configured in Firebase.</p>
          <div className="mt-7 flex flex-col gap-4">
            <Field label="Email" value={email} onChange={setEmail} />
            <label htmlFor="admin-password" className="flex flex-col gap-1.5 text-sm font-medium text-navy">
              Password
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <button type="submit" className={buttonClass}>Sign in</button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-secondary/50 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">DaniXdev</p>
            <h1 className="text-xl font-bold text-navy">Website Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <button type="button" className={secondaryButtonClass} onClick={() => void signOut(getFirebaseServices().auth)}>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setError(null) }}
              aria-current={tab === id ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                tab === id ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-card hover:text-navy'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {(error || contentError || notice) && (
            <div className={`mb-5 rounded-xl p-4 text-sm ${error || contentError ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-900'}`} role={error || contentError ? 'alert' : 'status'}>
              {error || contentError || notice}
            </div>
          )}

          {tab === 'overview' && (
            <section className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-navy">Welcome to your website manager</h2>
                <p className="mt-1 text-muted-foreground">Manage page copy, photos, your team, service posters, and blog posts.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Team members', content.teamMembers.length],
                  ['Service posters', content.servicePosters.length],
                  ['Published posts', publishedPosts],
                ].map(([label, count]) => (
                  <article key={label} className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-navy">{count}</p>
                  </article>
                ))}
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-navy">
                Changes are published to the public site when you save them. Keep your Firebase rules and admin account secure.
              </div>
              <button type="button" className={`${buttonClass} self-start`} disabled={saving} onClick={() => void saveContent()}>
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Publish website changes'}
              </button>
            </section>
          )}

          {tab === 'content' && (
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Page content</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Edit text and add, remove, or update home page cards.</p>
                </div>
                <label className="flex flex-col gap-1 text-sm font-medium text-navy">
                  Language
                  <select className={inputClass} value={language} onChange={(event) => setLanguage(event.target.value as Lang)}>
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                  </select>
                </label>
              </div>
              {(['nav', 'hero', 'stats', 'about', 'pricing', 'contact', 'footer'] as const).map((section) => (
                <SectionCard key={section} title={labelFor(section)}>
                  <ContentTree
                    value={content.translations[language][section]}
                    path={['translations', language, section]}
                    onChange={updateContent}
                  />
                </SectionCard>
              ))}
              <SectionCard title="Homepage services section">
                <div className="mb-5 grid gap-4 md:grid-cols-2">
                  {(['en', 'ur'] as const).map((locale) => (
                    <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                      <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                      {(['eyebrow', 'title', 'subtitle'] as const).map((field) => (
                        <Field
                          key={field}
                          label={labelFor(field)}
                          value={content.translations[locale].services[field]}
                          multiline={field === 'subtitle'}
                          onChange={(value) => updateContent(['translations', locale, 'services', field], value)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex justify-end">
                  <button type="button" className={secondaryButtonClass} onClick={() => setContent((current) => ({ ...current, homeServices: [...current.homeServices, makeHomeService()] }))}>
                    <Plus className="size-4" aria-hidden="true" />
                    Add service card
                  </button>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {content.homeServices.map((service, index) => (
                    <article key={service.id} className="flex flex-col gap-4 rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-navy">{service.title.en || `Service ${index + 1}`}</p>
                        <button
                          type="button"
                          aria-label={`Delete ${service.title.en || 'service'} card`}
                          className="inline-flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (!window.confirm(`Delete ${service.title.en || 'this service card'}?`)) return
                            await removeImage(service.image)
                            setContent((current) => ({ ...current, homeServices: current.homeServices.filter((item) => item.id !== service.id) }))
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      {(['en', 'ur'] as const).map((locale) => (
                        <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-3">
                          <h4 className="text-sm font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h4>
                          <Field label="Title" value={service.title[locale]} onChange={(value) => updateContent(['homeServices', index, 'title', locale], value)} />
                          <Field label="Description" value={service.text[locale]} multiline onChange={(value) => updateContent(['homeServices', index, 'text', locale], value)} />
                        </div>
                      ))}
                      <label className="flex items-center gap-2 text-sm font-medium text-navy">
                        <input type="checkbox" checked={service.enabled} onChange={(event) => updateContent(['homeServices', index, 'enabled'], event.target.checked)} />
                        Show on homepage
                      </label>
                      <ImageControl
                        label="Service card image"
                        asset={service.image}
                        onUpload={async (file) => {
                          const image = await replaceImage(file, 'home-services', service.id, service.image)
                          updateContent(['homeServices', index, 'image'], image)
                        }}
                        onRemove={async () => {
                          await removeImage(service.image)
                          updateContent(['homeServices', index, 'image'], null)
                        }}
                      />
                    </article>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="About page cards">
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    className={secondaryButtonClass + ' self-start'}
                    onClick={() => setContent((current) => ({
                      ...current,
                      aboutCards: [...current.aboutCards, {
                        id: `about-${crypto.randomUUID()}`,
                        icon: 'sparkles',
                        title: { en: '', ur: '' },
                        text: { en: '', ur: '' },
                        image: null,
                      }],
                    }))}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add about card
                  </button>
                  {content.aboutCards.map((card, index) => (
                    <article key={card.id} className="flex flex-col gap-4 rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <label className="flex min-w-48 flex-col gap-1.5 text-sm font-medium text-navy">
                          Card icon
                          <select
                            className={inputClass}
                            value={card.icon}
                            onChange={(event) => updateContent(['aboutCards', index, 'icon'], event.target.value)}
                          >
                            <option value="eye">Vision</option>
                            <option value="target">Mission</option>
                            <option value="sparkles">Sparkles</option>
                          </select>
                        </label>
                        <button
                          type="button"
                          className={`${secondaryButtonClass} text-destructive`}
                          onClick={() => setContent((current) => ({ ...current, aboutCards: current.aboutCards.filter((entry) => entry.id !== card.id) }))}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete card
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {(['en', 'ur'] as const).map((locale) => (
                          <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                            <h4 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h4>
                            <Field label="Card title" value={card.title[locale]} onChange={(value) => updateContent(['aboutCards', index, 'title', locale], value)} />
                            <Field label="Card text" value={card.text[locale]} multiline onChange={(value) => updateContent(['aboutCards', index, 'text', locale], value)} />
                          </div>
                        ))}
                      </div>
                      <ImageControl
                        label="About card image"
                        asset={card.image}
                        onUpload={async (file) => {
                          const image = await replaceImage(file, 'about', card.id, card.image)
                          updateContent(['aboutCards', index, 'image'], image)
                        }}
                        onRemove={async () => {
                          await removeImage(card.image)
                          updateContent(['aboutCards', index, 'image'], null)
                        }}
                      />
                    </article>
                  ))}
                </div>
              </SectionCard>
              <button type="button" className={`${buttonClass} self-start`} disabled={saving} onClick={() => void saveContent()}>
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save and publish'}
              </button>
            </section>
          )}

          {tab === 'team' && (
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Team and founder</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Edit names, roles, profile photos, and the founder message in both languages.</p>
                </div>
                <button type="button" className={secondaryButtonClass} onClick={() => setContent((current) => ({ ...current, teamMembers: [...current.teamMembers, makeMember()] }))}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add member
                </button>
              </div>
              {content.teamMembers.map((member, index) => (
                <article key={member.id} className="grid gap-5 rounded-2xl border border-border bg-card p-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(['en', 'ur'] as const).map((locale) => (
                      <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                        <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                        {(['name', 'role', 'sub'] as const).map((field) => (
                          <Field
                            key={field}
                            label={labelFor(field)}
                            value={member[field][locale]}
                            onChange={(value) => updateContent(['teamMembers', index, field, locale], value)}
                          />
                        ))}
                      </div>
                    ))}
                    <label className="flex items-center gap-2 text-sm font-medium text-navy sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={member.id === 'founder'}
                        disabled
                        aria-label="Founder profile"
                      />
                      Founder profile (managed in Site settings)
                    </label>
                  </div>
                  <div className="flex flex-col gap-4">
                    <ImageControl
                      label={`${member.name.en || 'Team member'} photo`}
                      asset={member.image}
                      onUpload={async (file) => {
                        const image = await replaceImage(file, 'team', member.id, member.image)
                        updateContent(['teamMembers', index, 'image'], image)
                        if (member.id === 'founder') updateContent(['founderMessage', 'image'], image)
                      }}
                      onRemove={async () => {
                        await removeImage(member.image)
                        updateContent(['teamMembers', index, 'image'], null)
                        if (member.id === 'founder') updateContent(['founderMessage', 'image'], null)
                      }}
                    />
                    {member.id !== 'founder' && (
                      <button
                        type="button"
                        className={`${secondaryButtonClass} self-start text-destructive`}
                        onClick={async () => {
                          if (!window.confirm(`Remove ${member.name.en || 'this team member'}?`)) return
                          await removeImage(member.image)
                          setContent((current) => ({ ...current, teamMembers: current.teamMembers.filter((entry) => entry.id !== member.id) }))
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Delete member
                      </button>
                    )}
                  </div>
                </article>
              ))}
              <SectionCard title="Founder message">
                <div className="grid gap-5">
                  <label className="flex items-center gap-2 text-sm font-medium text-navy">
                    <input
                      type="checkbox"
                      checked={content.founderMessage.enabled}
                      onChange={(event) => updateContent(['founderMessage', 'enabled'], event.target.checked)}
                    />
                    Show founder message on the Team page
                  </label>
                  {(['en', 'ur'] as const).map((locale) => (
                    <div key={locale} className="grid gap-4 rounded-xl bg-secondary/50 p-4">
                      <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                      <Field
                        label="Message heading"
                        value={content.founderMessage.heading[locale]}
                        onChange={(value) => updateContent(['founderMessage', 'heading', locale], value)}
                      />
                      <ContentTree
                        value={content.founderMessage.paragraphs[locale]}
                        path={['founderMessage', 'paragraphs', locale]}
                        onChange={updateContent}
                      />
                    </div>
                  ))}
                  <ImageControl
                    label="Founder photo"
                    asset={content.founderMessage.image}
                    onUpload={async (file) => {
                    const image = await replaceImage(file, 'founder', 'portrait', content.founderMessage.image)
                      updateContent(['founderMessage', 'image'], image)
                      const founderIndex = content.teamMembers.findIndex((member) => member.id === 'founder')
                      if (founderIndex >= 0) updateContent(['teamMembers', founderIndex, 'image'], image)
                    }}
                    onRemove={async () => {
                      await removeImage(content.founderMessage.image)
                      updateContent(['founderMessage', 'image'], null)
                      const founderIndex = content.teamMembers.findIndex((member) => member.id === 'founder')
                      if (founderIndex >= 0) updateContent(['teamMembers', founderIndex, 'image'], null)
                    }}
                  />
                </div>
              </SectionCard>
              <button type="button" className={`${buttonClass} self-start`} disabled={saving} onClick={() => void saveContent()}>
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save team changes'}
              </button>
            </section>
          )}

          {tab === 'services' && (
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Service posters</h2>
                  <p className="mt-1 text-sm text-muted-foreground">These cards appear on the Services page; visitors can open each image and message you on WhatsApp.</p>
                </div>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => setContent((current) => ({
                    ...current,
                      servicePosters: [...current.servicePosters, {
                        id: `service-${crypto.randomUUID()}`,
                        title: { en: '', ur: '' },
                        image: null,
                        enabled: true,
                      }],
                  }))}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add service
                </button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {content.servicePosters.map((service, index) => (
                  <article key={service.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                    {(['en', 'ur'] as const).map((locale) => (
                      <Field
                        key={locale}
                        label={`Service name (${locale === 'en' ? 'English' : 'Urdu'})`}
                        value={service.title[locale]}
                        onChange={(value) => updateContent(['servicePosters', index, 'title', locale], value)}
                      />
                    ))}
                    <ImageControl
                      label="Service poster"
                      asset={service.image}
                      onUpload={async (file) => updateContent(['servicePosters', index, 'image'], await replaceImage(file, 'services', service.id, service.image))}
                      onRemove={async () => {
                        await removeImage(service.image)
                        updateContent(['servicePosters', index, 'image'], null)
                      }}
                    />
                    <label className="flex items-center gap-2 text-sm font-medium text-navy">
                      <input type="checkbox" checked={service.enabled} onChange={(event) => updateContent(['servicePosters', index, 'enabled'], event.target.checked)} />
                      Visible on the Services page
                    </label>
                    <button
                      type="button"
                      className={`${secondaryButtonClass} self-start text-destructive`}
                      onClick={async () => {
                        if (!window.confirm(`Delete ${service.title.en || service.title.ur || 'this service'}?`)) return
                        await removeImage(service.image)
                        setContent((current) => ({ ...current, servicePosters: current.servicePosters.filter((entry) => entry.id !== service.id) }))
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete service
                    </button>
                  </article>
                ))}
              </div>
              <button type="button" className={`${buttonClass} self-start`} disabled={saving} onClick={() => void saveContent()}>
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save services'}
              </button>
            </section>
          )}

          {tab === 'posts' && (
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Posts</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Create bilingual posts and publish or unpublish them.</p>
                </div>
                <button type="button" className={buttonClass} onClick={() => setPostDraft(makePost())}>
                  <Plus className="size-4" aria-hidden="true" />
                  New post
                </button>
              </div>
              {postDraft && (
                <article className="flex flex-col gap-5 rounded-2xl border border-primary/30 bg-card p-5">
                  <h3 className="text-lg font-bold text-navy">{posts.some((post) => post.id === postDraft.id) ? 'Edit post' : 'New post'}</h3>
                  <Field label="URL slug (example: our-new-service)" value={postDraft.slug} onChange={(slug) => setPostDraft({ ...postDraft, slug: slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} />
                  {(['en', 'ur'] as const).map((locale) => (
                    <div key={locale} className="grid gap-4 rounded-xl bg-secondary/50 p-4">
                      <h4 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h4>
                      {(['title', 'summary', 'body'] as const).map((field) => (
                        <Field
                          key={field}
                          label={labelFor(field)}
                          value={postDraft[field][locale]}
                          multiline={field !== 'title'}
                          onChange={(value) => setPostDraft((current) => current ? { ...current, [field]: { ...current[field], [locale]: value } } : current)}
                        />
                      ))}
                    </div>
                  ))}
                  <ImageControl
                    label="Post cover image"
                    asset={postDraft.image}
                    onUpload={async (file) => {
                      const image = await uploadImage(file, 'posts', postDraft.id)
                      const savedImage = posts.find((post) => post.id === postDraft.id)?.image
                      const previousImage = postDraft.image
                      setPostDraft((current) => current ? { ...current, image } : current)
                      if (previousImage?.storagePath && previousImage.storagePath !== savedImage?.storagePath) {
                        try {
                          await deleteObject(ref(getFirebaseServices().storage, previousImage.storagePath))
                        } catch (imageError) {
                          console.error('Unable to remove a replaced unsaved post image.', imageError)
                          setError(imageError instanceof Error ? imageError.message : 'The replaced post image could not be removed.')
                        }
                      }
                    }}
                    onRemove={async () => {
                      const savedImage = posts.find((post) => post.id === postDraft.id)?.image
                      if (postDraft.image?.storagePath && postDraft.image.storagePath !== savedImage?.storagePath) {
                        await deleteObject(ref(getFirebaseServices().storage, postDraft.image.storagePath))
                      }
                      setPostDraft((current) => current ? { ...current, image: null } : current)
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-navy">
                    <input type="checkbox" checked={postDraft.published} onChange={(event) => setPostDraft({ ...postDraft, published: event.target.checked })} />
                    Published on the public blog
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className={buttonClass} disabled={saving} onClick={() => void savePost(postDraft)}>
                      <Save className="size-4" aria-hidden="true" />
                      {saving ? 'Saving…' : 'Save post'}
                    </button>
                    <button type="button" className={secondaryButtonClass} onClick={() => void cancelPostDraft()}>Cancel</button>
                  </div>
                </article>
              )}
              {posts.map((post) => (
                <article key={post.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <h3 className="font-bold text-navy">{post.title.en || 'Untitled post'}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">/blog/{post.slug} · {post.published ? 'Published' : 'Draft'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={secondaryButtonClass} onClick={() => setPostDraft(post)}>Edit</button>
                    <button type="button" className={`${secondaryButtonClass} text-destructive`} onClick={() => void deletePost(post)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {!posts.length && !postDraft && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No posts yet. Create your first post to get started.</p>}
            </section>
          )}

          {tab === 'settings' && (
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-bold text-navy">Site settings and page introductions</h2>
                <p className="mt-1 text-sm text-muted-foreground">Update contact details, brand images, and the introduction on each page.</p>
              </div>
              <SectionCard title="Brand and contact">
                <div className="grid gap-4 md:grid-cols-2">
                  {(['name', 'descriptor', 'phoneDisplay', 'phoneIntl', 'email'] as const).map((field) => (
                    <Field
                      key={field}
                      label={labelFor(field)}
                      value={content.brand[field]}
                      onChange={(value) => updateContent(['brand', field], value)}
                    />
                  ))}
                  {(['en', 'ur'] as const).map((locale) => (
                    <Field
                      key={locale}
                      label={`Service area (${locale === 'en' ? 'English' : 'Urdu'})`}
                      value={content.brand.serviceArea[locale]}
                      onChange={(value) => updateContent(['brand', 'serviceArea', locale], value)}
                    />
                  ))}
                  <div className="md:col-span-2">
                    <ImageControl
                      label="Website logo"
                      asset={content.brand.logo}
                      onUpload={async (file) => updateContent(['brand', 'logo'], await replaceImage(file, 'brand', 'logo', content.brand.logo))}
                      onRemove={async () => {
                        await removeImage(content.brand.logo)
                        updateContent(['brand', 'logo'], null)
                      }}
                    />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Homepage hero image">
                <ImageControl
                  label="Hero image"
                  asset={content.heroImage}
                  onUpload={async (file) => updateContent(['heroImage'], await replaceImage(file, 'brand', 'hero', content.heroImage))}
                  onRemove={async () => {
                    await removeImage(content.heroImage)
                    updateContent(['heroImage'], null)
                  }}
                />
              </SectionCard>
              <SectionCard title="Pricing plan images">
                <div className="grid gap-5 md:grid-cols-3">
                  {content.translations.en.pricing.plans.map((plan) => (
                    <ImageControl
                      key={plan.id}
                      label={`${plan.name} plan image`}
                      asset={content.pricingPlanImages[plan.id] ?? null}
                      onUpload={async (file) => updateContent(['pricingPlanImages', plan.id], await replaceImage(file, 'pricing', plan.id, content.pricingPlanImages[plan.id] ?? null))}
                      onRemove={async () => {
                        await removeImage(content.pricingPlanImages[plan.id] ?? null)
                        updateContent(['pricingPlanImages', plan.id], null)
                      }}
                    />
                  ))}
                </div>
              </SectionCard>
              {Object.entries(content.pageIntros).map(([page, intro]) => (
                <SectionCard key={page} title={`${labelFor(page)} page`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(['en', 'ur'] as const).map((locale) => (
                      <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                        <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                        <Field label="Title" value={intro.title[locale]} onChange={(value) => updateContent(['pageIntros', page, 'title', locale], value)} />
                        <Field label="Description" value={intro.description[locale]} multiline onChange={(value) => updateContent(['pageIntros', page, 'description', locale], value)} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
              <SectionCard title="Shared call to action">
                <div className="grid gap-4 md:grid-cols-2">
                  {(['en', 'ur'] as const).map((locale) => (
                    <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                      <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                      {(['title', 'description', 'contactLabel', 'pricingLabel'] as const).map((field) => (
                        <Field
                          key={field}
                          label={labelFor(field)}
                          value={content.pageCta[field][locale]}
                          multiline={field === 'description'}
                          onChange={(value) => updateContent(['pageCta', field, locale], value)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Services page heading">
                <div className="grid gap-4 md:grid-cols-2">
                  {(['en', 'ur'] as const).map((locale) => (
                    <div key={locale} className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                      <h3 className="font-bold text-navy">{locale === 'en' ? 'English' : 'Urdu'}</h3>
                      {(['eyebrow', 'title', 'subtitle'] as const).map((field) => (
                        <Field
                          key={field}
                          label={labelFor(field)}
                          value={content.servicePageHeading[field][locale]}
                          multiline={field === 'subtitle'}
                          onChange={(value) => updateContent(['servicePageHeading', field, locale], value)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </SectionCard>
              <button type="button" className={`${buttonClass} self-start`} disabled={saving} onClick={() => void saveContent()}>
                <Save className="size-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save site settings'}
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
