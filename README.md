# parago

## TODO Before Production
- [ ] Migrate Auth State from Client-side `localStorage` to **`httpOnly` Cookies** and Next.js Middleware to prevent XSS attacks and ensure maximum security for user location/contact data.
- [ ] Maps/Routing: Currently using OpenStreetMap (Nominatim) and public OSRM servers for dev. This is a temporary solution. **MUST** switch to Goong Maps API (or similar paid provider) before going to production, as public OSM servers have strict rate limits and no SLA. **Note**: To comply with Nominatim's strict rate limits (1 req/sec), a global queue has been implemented in the backend. If many users search simultaneously during testing, requests will queue up and cause noticeable latency (e.g. 10th user waits 10 seconds). This is a limitation of the free API, not a code bug.
