// CHECKOUT_401_FIX.md

# Checkout 401 Error - Fix Summary

## Issues Found & Fixed

### 1. **Auth Persistence Middleware Not Added to Store**

**Problem:** The `authPersistenceMiddleware` was created but never registered with the Redux store, so auth tokens weren't being persisted to AsyncStorage when actions were dispatched.

**Fix:** Added the middleware to the store configuration in `store/index.ts`:

```typescript
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({...})
    .concat(authPersistenceMiddleware.middleware)  // ← Added this
    .concat(productsApi.middleware)
    ...
```

### 2. **Wrong Field Names in Auth Middleware**

**Problem:** The middleware was trying to access `action.payload.token` but the actual field from the login/register actions is `action.payload.accessToken`.

**Fix:** Updated `authPersistenceMiddleware.ts` to use correct field names:

```typescript
// Before (WRONG)
await storage.setItem("authToken", action.payload.token);

// After (CORRECT)
const { accessToken, refreshToken, user } = action.payload;
await AsyncStorage.multiSet([
  ["accessToken", accessToken],
  ["refreshToken", refreshToken],
  ["user", JSON.stringify(user)],
]);
```

### 3. **Inconsistent Storage Keys**

**Problem:** Middleware was using key "authToken" while axios interceptor looked for "accessToken", and the service layer used different keys.

**Fix:** Standardized all auth storage to use consistent keys:

- `"accessToken"` - JWT access token
- `"refreshToken"` - Refresh token
- `"user"` - User object

### 4. **Improved Error Handling & Logging**

**Problem:** When token refresh failed or tokens were missing, the error handling wasn't clear.

**Fix:** Added comprehensive logging in:

- `utils/axios.ts` - Better error messages for token issues
- `app/checkout/index.tsx` - Detailed checkout data fetch logging
- `utils/authDebug.ts` - New debug utility for development

## How the Fix Works

### Auth Flow After Fix:

1. **User logs in**
   - Login thunk saves tokens to AsyncStorage directly
   - Auth middleware listeners triggers and ensures consistency

2. **App cold start (after clearing cache)**
   - Redux persist rehydrates auth state from "persist:auth" key
   - Axios can use the same tokens from AsyncStorage

3. **Checkout screen loads**
   - Checks if authenticated (from Redux state)
   - Makes API calls
   - Axios interceptor reads token from AsyncStorage
   - Authorization header is properly set: `Bearer {accessToken}`

4. **On 401 error**
   - Axios interceptor attempts token refresh
   - If successful, retries the original request
   - If failed, user is logged out and redirected to login

## Debugging the 401 Error

If you still see 401 errors, use these debugging methods:

### In Development Console:

```javascript
// Check token storage
await authDebug.checkStoredTokens();

// View all auth-related AsyncStorage
await authDebug.logAuthStorage();

// Clear all auth data for fresh login
await authDebug.clearTokens();
```

### Check Redux State:

1. Install Redux DevTools extension
2. Look for `auth.accessToken` in the Redux store
3. Verify `auth.isAuthenticated === true` when logged in

### Common Issues & Solutions:

| Issue                                         | Cause                        | Solution                                                         |
| --------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| Token exists in Redux but not in AsyncStorage | Middleware not registered    | Verify `authPersistenceMiddleware.middleware` is in store config |
| Tokens cleared on app restart                 | Redux persist not working    | Check "persist:auth" key in AsyncStorage                         |
| "No refresh token" error                      | Missing refresh token        | Login fresh, verify both tokens are saved                        |
| Consistent 401 on protected routes            | Expired token but no refresh | Implement token expiry check                                     |

## Testing the Fix

1. **Clear app cache/data** to start fresh
2. **Login with valid credentials**
3. **Navigate to checkout** - should load addresses and cart
4. **Check browser console** for the logging messages:
   - "Fetching checkout data..."
   - "Checkout data loaded successfully"
5. **If error occurs**, check error message and use debug utilities

## Files Modified

- `store/index.ts` - Added middleware to store
- `store/middleware/authPersistenceMiddleware.ts` - Fixed field names and keys
- `utils/axios.ts` - Enhanced error logging and token refresh
- `app/checkout/index.tsx` - Added better error logging
- `utils/authDebug.ts` - New debug utility (created)
