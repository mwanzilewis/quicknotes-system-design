
## Components
- **Client:** Interface where users create and view notes, sends API requests.
- **DNS:** Resolves domain name to load balancer IP so users find the service.
- **CDN:** Caches static files at edge so frontend loads fast worldwide.
- **Load Balancer:** Spreads traffic across app servers to avoid overload.
- **App Servers (2+):** Stateless servers handling API logic, scalable horizontally.
- **Cache (Redis):** Stores hot notes/feed in memory to serve reads fast without hitting DB.
- **Database Primary:** Handles all writes for notes/users to keep single source of truth.
- **Database Read Replica:** Serves read queries to offload primary and improve read speed.
- **Queue:** Decouples heavy background jobs from API response.
- **Worker:** Processes queue tasks like search indexing and notifications async.

## Request Flows

**GET /notes:**
1. Client sends GET /notes with JWT
2. Load Balancer forwards to App Server
3. App Server validates token
4. App Server checks Redis cache for user notes
5. If cache hit, return from cache
6. If miss, query Read Replica
7. Store result in Redis with 60s TTL
8. Return notes JSON to client

**POST /notes:**
1. Client sends POST /notes with title/body/tagIds
2. Load Balancer -> App Server
3. App Server validates input, checks auth
4. App Server writes note to DB Primary
5. App Server pushes job to Queue for indexing
6. Worker indexes note for search
7. App Server invalidates user's cache entry
8. Return 201 with created note

## Trade-offs
1. **Cache vs Freshness:** Cache speeds up reads but can serve stale data for 60s. We accept slight delay for huge read speedup. Invalidation on POST keeps it fresh enough.
2. **Primary vs Replica Reads:** Reading from replica scales reads but has slight replication lag. New notes may not appear instantly on replica. We read-your-writes from primary for the creating user.

## Avoiding Single Points of Failure
- 2+ App Servers behind LB: if one crashes, LB sends traffic to the other
- Read Replica: if primary fails, replica can be promoted
- Redis: use Redis Sentinel/cluster with failover
- Queue: use managed queue (SQS/RabbitMQ cluster) with persistence so jobs aren't lost
- CDN and DNS are globally distributed by provider, no single server
