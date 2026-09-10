# Software Architecture (Prototype Version)

## Routing (Next.js App Router)
- `/` - Redirects to login
- `/login` - Authentication screen
- `/student/*` - Layout containing the Student bottom navigation
- `/manager/*` - Layout containing the Manager bottom navigation

## Mock Data Structures (`lib/mockData.ts`)
The entire app runs on a central mock data file to simulate backend APIs.
- `users`: Array of mock students and managers.
- `societies`: Array with `type: 'TECH' | 'NON_TECH'`.
- `events`: Array of objects with `date`, `time`, `venue`, `description`.
- `applications`: Tracks status (Pending, Assessed, Shortlisted, Interview_Booked).

## State Management
Use simple React `useState` and `useEffect` or React Context to share the mock login state and booked slots across the prototype.