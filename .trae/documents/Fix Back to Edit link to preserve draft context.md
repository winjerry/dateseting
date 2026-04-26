Based on the user's feedback, the "Back to Edit" button in the confirmation page (`src/app/[locale]/(organizer)/my-events/create/confirm/page.tsx`) currently redirects to `/my-events/create`, which is the general "Create Event" page.

However, when a user is editing an *existing* draft (i.e., `draft.draftId` exists), clicking "Back to Edit" should redirect them back to the *edit* mode of that draft, specifically `/my-events/create?draftId=...`.

**The Fix:**

1. **Analyze** **`draft`** **object**: In the confirmation page, the `draft` object (loaded from `sessionStorage`) contains the `draftId` (added in the previous task).
2. **Dynamic Redirect**: I need to update the `href` of the "Back to Edit" link.

   * If `draft.draftId` exists: `href={`/my-events/create?draftId=${draft.draftId}`}`

   * Else: `href="/my-events/create"`

**Plan:**

1. **Modify** **`src/app/[locale]/(organizer)/my-events/create/confirm/page.tsx`**:

   * Find the `<Link href="/my-events/create">` component (lines 158-160).

   * Change the `href` prop to be conditional based on `draft?.draftId`.

   * Also apply this to the "No draft found" fallback section (lines 87-89), although there `draft` is null, so it defaults to `/my-events/create`.

**Code Change:**

```tsx
const backLink = draft?.draftId 
  ? `/my-events/create?draftId=${draft.draftId}` 
  : '/my-events/create';

// ...

<Link href={backLink}>
  <Button variant="outline" ...>Back to Edit</Button>
</Link>
```

