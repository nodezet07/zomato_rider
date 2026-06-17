# QuickBite Rider App

Expo + React Native delivery partner app — same stack pattern as **MyApp** (customer), wired to `clone-backend` rider APIs.

## Stack

- **Expo SDK 56** + **Expo Router**
- **TanStack Query** — orders, earnings, profile
- **Zustand** — rider session context
- **expo-location** — live GPS while online
- **socket.io-client** — realtime order updates (ready for Phase 2)

## Setup

```bash
cd riderApp
cp .env.example .env
npm install
npm start
```

Scan QR with **Expo Go** or run dev client:

```bash
npm run android
```

## Environment

| Variable | Default (dev) |
|----------|----------------|
| `EXPO_PUBLIC_API_URL` | Auto from Metro host → `:5000/api/v1` |
| `EXPO_PUBLIC_SOCKET_URL` | Auto from Metro host → `:5000` |

Update `.env` with your PC LAN IP if testing on a physical phone:

```
EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api/v1
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.5:5000
```

## Backend

Start API first:

```bash
cd clone-backend
npm run dev
```

Rider endpoints: `/api/v1/riders/*` (see `clone-backend/PHASE_10.md`).

## Demo flow

1. **Register** in app → auto-login (dev: auto-approved)
2. **Go online** on Home tab
3. Customer places order → restaurant sets **READY_FOR_PICKUP**
4. **Orders** tab → Accept
5. Update status manually (no maps yet):
   - **Mark picked up from restaurant** → `PICKED_UP`
   - **Start delivery (on the way)** → `ON_THE_WAY`
   - **Complete delivery** → `DELIVERED` (+₹40)
6. **Earnings** tab shows rider fee + payout summary

## Status enum flow (until maps)

```
RIDER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
     ↓              ↓            ↓
  pickup API    start-delivery   complete API
```

Maps/navigation will replace manual steps later.

## Project structure

```
riderApp/
├── app.json
├── src/
│   ├── app/           # Expo Router screens
│   ├── components/
│   ├── config/env.ts  # Same pattern as MyApp
│   ├── lib/           # api, auth, socket, storage
│   ├── services/      # riders.ts API client
│   └── stores/        # rider Zustand store
└── assets/
```

## Next steps (not in v0.2)

- Google Maps / turn-by-turn navigation (replace manual enum steps)
- Push notifications for new orders
- KYC document upload + bank details form
- Background location while delivering
