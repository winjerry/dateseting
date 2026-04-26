Based on the user's request, when the session expires (API returns 401), the application should:
1.  Show a "Session expired" toast notification.
2.  Redirect the user to the login page (`/sign-in`).

**Analysis:**
I have analyzed `src/app/[locale]/(organizer)/my-events/page.tsx` and found that the API call logic is in the `fetchData` function.
Currently, it only logs the error and shows a generic toast error message when `res.ok` is false, without checking for specific status codes like 401.

**The Fix:**
I need to update the `fetchData` function to specifically check for `res.status === 401`.

**Plan:**
1.  **Modify `fetchData` in `src/app/[locale]/(organizer)/my-events/page.tsx`**:
    *   After `await fetch(...)`, check `res.status`.
    *   If `res.status === 401`:
        *   Display a specific toast: `toast.error('Session expired. Please sign in again.')`.
        *   Use `router.push('/sign-in')` (or the locale-aware path) to redirect.
    *   Keep the existing error handling for other status codes.

**Locale Handling:**
The path is `[locale]`, so I should probably use the correct locale prefix if possible, or just `/sign-in` if the middleware handles the redirect/locale detection. The `router` is from `next/navigation`. I'll assume `/sign-in` works or use a relative path if needed, but `/sign-in` is safer. Wait, the project structure is `src/app/[locale]/...`. If I redirect to `/sign-in`, middleware usually handles the locale rewrite. Better yet, check if there's a localized path helper. For now, `/sign-in` is the standard expectation.

**Code Change:**
```typescript
      const res = await fetch('/api/events/list?includeStats=true');
      
      if (res.status === 401) {
        toast.error('Session expired. Please sign in again.');
        router.push('/sign-in'); // Or router.push(`/${locale}/sign-in`) if I can get locale
        return;
      }
      
      const data = await res.json();
```
To get the locale, I can use `useParams`.
`import { useParams } from 'next/navigation';`
`const params = useParams();`
`const locale = params.locale;`
`router.push(`/${locale}/sign-in`);`

This ensures the user stays in the same language.

**Refined Plan:**
1.  Import `useParams` from `next/navigation`.
2.  Get `locale` from params.
3.  In `fetchData`, check for 401 status.
4.  On 401, show toast and redirect to `/${locale}/sign-in`.

Let's implement this.
