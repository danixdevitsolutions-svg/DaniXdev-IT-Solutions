'use client'

import Image from 'next/image'
import Link from 'next/link'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { firebaseConfigured, getFirebaseServices } from '@/lib/firebase'
import type { BlogPost } from '@/lib/site-content'
import { useLanguage } from './language-provider'

function usePublishedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseConfigured) return

    try {
      const { db } = getFirebaseServices()
      return onSnapshot(
        query(collection(db, 'posts'), where('published', '==', true)),
        (snapshot) => {
          setPosts(snapshot.docs.map((entry) => entry.data() as BlogPost).sort((a, b) => b.updatedAt - a.updatedAt))
          setError(null)
        },
        (loadError) => {
          console.error('Unable to load published blog posts.', loadError)
          setError('Blog posts could not be loaded.')
        },
      )
    } catch (loadError) {
      console.error('Unable to connect to published blog posts.', loadError)
      setError('Blog posts could not be loaded.')
    }
  }, [])

  return { posts, error }
}

export function BlogListing() {
  const { lang } = useLanguage()
  const { posts, error } = usePublishedPosts()

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col gap-10 px-4 py-16 md:px-6 md:py-24">
      <header className="max-w-3xl">
        <p className="font-semibold uppercase tracking-wide text-primary">{lang === 'ur' ? 'بلاگ' : 'Blog'}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
          {lang === 'ur' ? 'خبریں اور رہنمائی' : 'News & Insights'}
        </h1>
      </header>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!firebaseConfigured && <p className="text-muted-foreground">Blog posts will appear here after Firebase is configured.</p>}
      {firebaseConfigured && !posts.length && !error && <p className="text-muted-foreground">{lang === 'ur' ? 'ابھی کوئی پوسٹ شائع نہیں ہوئی۔' : 'There are no published posts yet.'}</p>}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.id} className="overflow-hidden rounded-3xl border border-border bg-card">
            <Link href={`/blog/post/?slug=${encodeURIComponent(post.slug)}`} className="block h-full transition-shadow hover:shadow-xl">
              {post.image?.url && (
                <div className="relative aspect-[16/10] bg-secondary">
                  <Image src={post.image.url} alt="" fill sizes="(min-width: 1024px) 380px, 90vw" className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-navy">{post.title[lang]}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.summary[lang]}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export function BlogArticle() {
  const [slug, setSlug] = useState('')
  const { lang } = useLanguage()
  const { posts, error } = usePublishedPosts()
  const post = posts.find((entry) => entry.slug === slug)

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('slug') ?? '')
  }, [])

  return (
    <main className="mx-auto min-h-[55vh] max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
        ← {lang === 'ur' ? 'تمام پوسٹس' : 'All posts'}
      </Link>
      {error && <p role="alert" className="mt-8 text-sm text-destructive">{error}</p>}
      {!post && !error && <p className="mt-8 text-muted-foreground">{lang === 'ur' ? 'پوسٹ لوڈ ہو رہی ہے یا دستیاب نہیں۔' : 'Loading post or post is unavailable.'}</p>}
      {post && (
        <article className="mt-8">
          {post.image?.url && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-3xl bg-secondary">
              <Image src={post.image.url} alt="" fill sizes="(min-width: 900px) 800px, 100vw" className="object-cover" />
            </div>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-navy md:text-5xl">{post.title[lang]}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.summary[lang]}</p>
          <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-foreground">{post.body[lang]}</div>
        </article>
      )}
    </main>
  )
}
