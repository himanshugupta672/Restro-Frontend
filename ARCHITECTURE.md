# Frontend Architecture

## Delivery roadmap

1. Project setup
2. Folder structure
3. Routing and route guards
4. Axios API layer and token refresh
5. Redux store, async state, and global feedback
6. Authentication and authorization
7. Dashboard
8. Menu management
9. Order management
10. Customer management
11. Reporting
12. Production optimization and testing

## Current structure

```text
src/
  app/
    bootstrap/       Runtime wiring between infrastructure and application state
    providers/       Application-wide provider composition
    theme/           Material UI theme and design tokens
  components/
    feedback/        Loading, empty-state, progress, and toast presentation
  config/            Validated runtime configuration
  constants/         Stable shared constants such as route paths
  features/
    auth/             Session contracts, Redux state, and auth pages
    customers/        Customer-owned pages and future business logic
    dashboard/        Dashboard-owned pages and future business logic
    menu/             Menu-owned pages and future business logic
    orders/           Order-owned pages and future business logic
    reports/          Reporting-owned pages and future business logic
  hooks/             Cross-feature React and Redux hooks
  layouts/           Route shells that own navigation and page composition
  pages/
    errors/           Cross-feature HTTP-style error pages
  routes/
    guards/           Authentication and role authorization boundaries
    AppRouter.tsx     Lazy-loaded route composition
    navigation.ts    Navigation labels, paths, and icons
    routeAccess.ts   Single source of truth for route permissions
  services/
    api/             Axios clients, endpoint constants, errors, and parsing
  store/
    appStatus/       Global request and notification state
    async/           Shared async status and serializable error contracts
    index.ts         Root store composition
  types/             Truly global TypeScript contracts
  utils/             Pure, business-agnostic helpers
```

Folders that do not yet contain implementation are introduced when their first
real use case is built. Empty placeholder files create noise and obscure module
ownership.

## Dependency direction

- `app` composes the application.
- `routes` imports feature pages and layouts.
- `features` own business UI, schemas, API functions, slices, selectors, and
  feature-specific types.
- `components`, `hooks`, `services`, `types`, and `utils` contain only code
  proven to be shared.
- Shared code never imports from a feature. This prevents circular dependencies
  and keeps features removable.

The root store and route composition are application composition roots. They may
import feature public APIs to assemble the application, while features must not
import the root router or other feature internals.

## Feature template

```text
features/menu/
  api/
  components/
  hooks/
  pages/
  schemas/
  store/
  types/
  utils/
  index.ts
```

Not every feature needs every folder. Add a subfolder only when the feature has
that responsibility. Public imports should go through the feature's `index.ts`;
internal files remain private implementation details.

## Decisions

- Redux Toolkit manages client-owned global state and async workflows requested
  by this project. Local form and display state stays in components.
- Axios is isolated behind a shared client so authentication, errors, headers,
  retries, and cancellation are consistent.
- Access tokens will be kept in memory. The backend refresh token remains in its
  HTTP-only cookie; refresh requests also send the backend CSRF cookie value.
- Zod validates forms, environment variables, and API boundaries where runtime
  data enters the application.
- Route-level `lazy` imports produce separate bundles. Heavy feature widgets can
  be split further only when bundle analysis shows value.
- Material UI theme values are the design system source of truth; feature code
  should avoid scattered color and spacing literals.

## Steps 2 and 3: modules and routing

Routing is divided into three access levels:

- Public routes can be visited without a session.
- Public-only routes, such as login, redirect authenticated users to the
  dashboard.
- Protected routes require an authenticated Redux session.
- Role routes apply an additional allow-list after authentication succeeds.

`ProtectedRoute`, `PublicOnlyRoute`, and `RoleRoute` render an `Outlet`. This
keeps authorization outside page components and allows one guard to protect an
entire route branch.

`routeAccess.ts` is the only place where role allow-lists are declared.
`AppRouter.tsx` uses these policies for enforcement and `navigation.ts` uses the
same policies for visibility. Hiding navigation is only a usability measure;
the route guard remains the security boundary in the frontend. The API must
still enforce authorization because client-side checks can be bypassed.

`AuthLayout` owns the visual shell for anonymous account pages.
`DashboardLayout` owns authenticated navigation, identity display, sign-out,
and the content outlet. Feature pages only render their business content.

Every route page is loaded with `React.lazy`. Visiting the login page does not
download menu, order, customer, or reporting page modules.

The authentication slice defines the session contract required by routing and
the API client. Step 6 connects the login form, session restoration, and logout
workflow to this infrastructure.

### Route policy

| Route           | Access                     |
| --------------- | -------------------------- |
| `/`             | Public                     |
| `/login`        | Unauthenticated users only |
| `/dashboard`    | Admin, Chef, Customer      |
| `/orders`       | Admin, Chef, Customer      |
| `/menu`         | Admin                      |
| `/customers`    | Admin                      |
| `/reports`      | Admin                      |
| `/unauthorized` | Authenticated users        |

### Adding a feature

1. Create `features/<feature>/pages/<Feature>Page.tsx`.
2. Export the page from `features/<feature>/index.ts`. If that feature's main
   barrel is already loaded during startup, use a dedicated `pages/index.ts`
   entry point so the page remains lazy-loaded.
3. Add the path to `constants/routes.ts`.
4. Add its role policy to `routes/routeAccess.ts`.
5. Add navigation metadata only if the page belongs in primary navigation.
6. Lazy-load the public feature export in `AppRouter.tsx`.

Feature-specific API functions, schemas, hooks, components, Redux state, and
types stay inside that feature. Move code into a shared folder only after at
least two features require the same business-agnostic behavior.

## Step 4: API infrastructure

### Client responsibilities

`services/api` exposes two Axios clients:

- `publicApiClient` is for anonymous endpoints and refresh requests. It does not
  attach a bearer token or attempt token refresh.
- `apiClient` is for authenticated feature requests. It attaches the current
  in-memory access token and attempts one refresh after a `401`.

Both clients:

- use the validated `VITE_API_BASE_URL`;
- use a 30-second timeout;
- send cookies with `withCredentials`;
- send the `csrfToken` cookie as `X-CSRF-TOKEN`;
- normalize failed requests into `ApiError`.

Feature code must import clients from `@/services/api`. It must not create new
Axios instances because doing so bypasses authentication, CSRF, timeout, and
error behavior.

### Refresh lifecycle

1. An authenticated request receives `401`.
2. The response interceptor calls `/Auth/refresh-token`.
3. Axios sends the HTTP-only refresh cookie and readable CSRF cookie.
4. The new access token is stored in Redux memory.
5. The original request is retried once with the new bearer token.

Concurrent `401` responses share one refresh promise. This prevents refresh
token rotation races where several requests try to consume the same token.
Requests marked as already retried cannot enter an infinite refresh loop.

A refresh `401` or `403` clears the Redux session. Network failures do not clear
the session because temporary connectivity loss does not prove that credentials
are invalid.

`app/bootstrap/configureApi.ts` connects the infrastructure client to Redux by
providing callbacks. The shared API service does not import the store or auth
feature, preserving dependency direction.

### Errors

Every rejected request produces `ApiError` with:

- a user-safe `message`;
- optional HTTP `status`;
- optional Axios/network `code`;
- ASP.NET validation fields, trace ID, and original payload in `details`;
- `isCanceled` for intentionally aborted requests.

Unexpected successful response bodies should be validated with
`parseApiResponse` and a Zod schema. This catches backend contract drift at the
boundary instead of allowing invalid data deeper into UI code.

```ts
const response = await apiClient.get<unknown>(API_ENDPOINTS.menu, {
  signal,
});

return parseApiResponse(menuItemsSchema, response.data);
```

Axios supports cancellation through the standard `AbortController`:

```ts
const controller = new AbortController();

apiClient.get(API_ENDPOINTS.orders, {
  signal: controller.signal,
});

controller.abort();
```

### Backend integration

The ASP.NET API allows credentialed CORS only for origins configured in
`Frontend:AllowedOrigins`. Wildcard origins cannot be combined with cookies.
Vite uses strict port `5173` so its development origin matches that policy.

The frontend calls the HTTPS API at `https://localhost:7197/api`. The local
ASP.NET development certificate must be trusted by the browser for secure
refresh cookies to work:

```bash
dotnet dev-certs https --trust
```

Production configuration must replace both `VITE_API_BASE_URL` and
`Frontend:AllowedOrigins` with the deployed HTTPS origins.

## Step 5: async Redux and global feedback

### Typed thunks

Features create async workflows with `createAppAsyncThunk`, not the untyped
Redux Toolkit factory. The wrapper provides the root state, dispatch, rejected
error, and pending metadata types once for the entire application.

```ts
export const loadOrders = createAppAsyncThunk(
  "orders/load",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.orders, {
        signal,
      });

      return parseApiResponse(ordersSchema, response.data);
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().orders.list.status !== "pending",
  }
);
```

`condition` prevents duplicate requests before they start. Components should
also abort obsolete requests when their owning screen unmounts:

```ts
const request = dispatch(loadOrders());

return () => request.abort();
```

Canceled and condition-skipped thunks do not show error notifications.

### Feature state

Feature slices use `AsyncState<T>` and `AsyncStatus` for business-owned request
state:

```ts
interface OrdersState {
  list: AsyncState<Order[]>;
}
```

Feature state answers local questions such as whether an order table should
show a skeleton, data, an empty state, or an inline retry message. The global
status slice does not replace local feature state.

Errors passed to `rejectWithValue` must use `toAppAsyncError`. It strips Axios
objects and arbitrary response payloads before Redux receives them, retaining
only serializable fields:

- message;
- HTTP status and network code;
- ASP.NET validation field errors;
- trace ID;
- whether a global notification should appear.

Form submissions can keep expected validation failures inline:

```ts
rejectWithValue(toAppAsyncError(error, { notify: false }));
```

### Request tracking

`appStatusSlice` observes all async-thunk lifecycle actions with Redux Toolkit
matchers. Active work is stored by `requestId`, which handles concurrent
requests correctly and cannot become a mismatched increment/decrement counter.

The fixed Material UI progress bar appears while any tracked thunk is pending.
A background request can opt out of global progress while retaining normal
feature state:

```ts
{
  getPendingMeta: () => ({ globalLoading: false }) satisfies AppPendingMeta;
}
```

### Notifications

Rejected thunks automatically enqueue an error toast unless their serialized
error has `notify: false`. Features dispatch other notifications without
importing React Toastify:

```ts
dispatch(notificationEnqueued("Menu item created successfully", "success"));
```

`GlobalNotifications` is the only component coupled to React Toastify. Toast
IDs match Redux notification IDs, preventing duplicate display under React
Strict Mode. Notifications are removed from Redux after delivery, so the store
does not become a historical event log.

`AppFeedback` is mounted once inside the application providers and owns both
the progress bar and toast container.

## Step 6: authentication

### Session model

The access token exists only in Redux memory. It is not written to local
storage, session storage, or a readable cookie. This reduces exposure if
third-party script is compromised.

The backend owns the long-lived refresh token in an HTTP-only, secure cookie.
Its readable CSRF companion cookie is copied into `X-CSRF-TOKEN` by the shared
Axios client.

Authentication state has three route-level values:

- `checking`: startup restoration is still running;
- `authenticated`: access token and user identity are available;
- `unauthenticated`: no valid session exists.

Both protected and public-only route branches show the page loader during
`checking`. This prevents protected content from redirecting too early and
prevents the login page flashing for a user with a valid refresh session.

### Startup restoration

`AuthBootstrap` dispatches `restoreSession` once when the application starts.
React Strict Mode may execute the effect twice during development, so the thunk
uses `restoreStarted` and a `condition` callback to prevent duplicate refresh
token rotation.

Restoration performs two operations before publishing the session:

1. rotate the refresh token and receive a new access token;
2. call `/Auth/me` with that token to validate it and recover the user email,
   role, and ID.

Missing or expired cookies produce an unauthenticated state without a toast.
This is an expected startup outcome, not an application error.

### Login

`LoginPage` uses React Hook Form with the Zod `loginSchema`. Field validation is
client-side, while credential and server errors are stored in the auth slice
and displayed inline.

The login thunk:

- prevents duplicate submissions with `condition`;
- sends credentials through `publicApiClient`;
- validates the response at runtime;
- stores the access token and typed user in Redux;
- converts `401` into the user-safe message `Email or password is incorrect`.

The password is cleared after successful authentication. Protected-route
redirect state is preserved, so a user sent from `/orders` returns to
`/orders` after login. Redirect paths originate from React Router locations and
must begin with `/`, preventing external redirect injection.

### Logout

Logout sends the bearer token to `/Auth/logout`, allowing the backend to:

- blacklist the access token;
- revoke the refresh token;
- clear refresh and CSRF cookies.

Local authentication state is cleared on both fulfilled and rejected logout.
This ensures a network problem cannot leave the interface appearing signed in.
The backend may retain the remote session in that exceptional case until its
normal expiry, so users should retry logout after connectivity returns when
security is critical.

### Backend contract

Authentication responses return role names such as `"Admin"` rather than
numeric enum values. Stable string roles match JWT role claims, frontend route
policies, and API authorization attributes.

The current roles are:

- `Admin`
- `Chef`
- `Customer`

## Quality commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run build
```
