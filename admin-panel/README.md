# DaniXdev admin panel setup

The panel is opened from the homepage with `/#admin-panel`. Its implementation lives in this folder and uses Firebase Authentication, Cloud Firestore, and Cloud Storage. Firebase sign-in and the admin UID allowlist protect access; the hash URL itself is not a security boundary.

## 1. Configure Firebase

1. Use the existing Firebase project and Web app configuration from Firebase Project settings.
2. Enable **Email/Password** in Authentication.
3. Create a Cloud Firestore database and a Storage bucket if they are not already enabled.
4. The local `.env.local` file should contain the Web app config values. It is ignored by Git; do not commit it.
5. In Firebase's rules editor, publish the contents of `firestore.rules` and `storage.rules` from this project (or deploy with the Firebase CLI).

## 2. Create the first admin

1. Add your email in Firebase Authentication and create a password.
2. Copy that user's **UID** from the Authentication user list.
3. In Firestore, create a document in the `admins` collection whose document ID is that UID. Add the field `role` with the string value `admin`.
4. Open `https://your-domain/#admin-panel` and sign in.

The rules intentionally prevent the panel from granting itself administrator access. Only users with a matching document in `admins` can write site content, posts, or upload/delete images.

## 3. Host the website on InfinityFree

This Next.js site uses a static export because InfinityFree shared hosting does not run a Next.js server. Run `npm run build` in the project root; Next.js creates the upload-ready `out` directory. Upload the **contents** of `out` to the hosting account's `htdocs` directory, including `.htaccess`.

The blog uses `/blog/post/?slug=...` so posts can load from Firestore on static hosting. Firebase Auth, Firestore, and Storage still run in the browser. Add the InfinityFree domain to Firebase Authentication's authorized domains. Enable Email/Password sign-in, create Firestore and Storage, and publish the included rules in the Firebase Console. The first admin must still be added manually as described above.

The `NEXT_PUBLIC_FIREBASE_*` settings must be present in `.env.local` at build time so they are included in the exported JavaScript. These are Firebase web-app identifiers, not server secrets. Do not upload `.env.local`; upload only the `out` directory contents.

## 4. Deploy to Vercel (optional)

Add the same `NEXT_PUBLIC_FIREBASE_*` values to the Vercel project's Environment Variables, then redeploy. Keep Firebase security rules enabled in production.

The first save creates the `siteContent/main` document with the current website defaults. Public pages use those defaults until Firebase is configured and content is saved.
