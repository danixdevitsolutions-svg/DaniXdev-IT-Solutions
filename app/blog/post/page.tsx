import type { Metadata } from 'next'
import { BlogArticle } from '@/components/blog-pages'

export const metadata: Metadata = {
  title: 'Blog Post | DaniXdev IT Solutions',
}

export default function BlogPostPage() {
  return <BlogArticle />
}
