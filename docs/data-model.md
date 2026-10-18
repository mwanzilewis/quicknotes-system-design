
Commit: `git add docs/data-model.md && git commit -m "Add data model doc"`

### 6. docs/architecture.md

```markdown
# QuickNotes Architecture

## Functional Requirements
- Users can register, login, create, read, update, delete notes
- Users can tag notes and filter by tag
- API client loads 10 notes, creates, deletes

## Non-Functional Requirements
- Availability 99.9%, fast feed loading < 500ms
- Secure: passwords hashed, JWT auth
- Scalable to 1M users

## Load Estimate for 1M Users
- Assume 10% DAU = 100,000 daily active
- Reads: 100k users * 20 feed views = 2M reads/day = ~23 reads/sec avg, ~115 reads/sec peak (5x)
- Writes: 100k users * 2 notes/day = 200k writes/day = ~2.3 writes/sec avg, ~12 writes/sec peak
- Storage: 200k notes/day * 365 = 73M notes/year. Avg note 2KB => ~146 GB/year + DB overhead

## Architecture Diagram
