I will implement the registration success notification and redirect to the login page as requested.

**1. Add Translation Keys**
Add a new translation key `sign_up_success` to the `common.sign` section in both English and Chinese translation files.
- `src\config\locale\messages\en\common.json`: `"Registration successful! Please sign in."`
- `src\config\locale\messages\zh\common.json`: `"注册成功！请登录。"`

**2. Update SignUp Component**
Modify `src\shared\blocks\sign\sign-up.tsx` to handle the successful registration:
- In the `handleSignUp` function's `onSuccess` callback:
  - Display a success toast notification using the new translation key: `toast.success(t('sign_up_success'))`.
  - Redirect the user to the login page: `router.push('/sign-in')`.
