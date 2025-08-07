# Firestore Schema - Optimized for Minimal Reads

## Collection Structure

### 1. `tracks` Collection
```
tracks/{trackId}
{
  id: string,
  title: string,
  artist: string,
  album: string,
  duration: number,
  coverUrl: string,
  audioUrl: string,
  genre: string,
  paid: boolean,
  amount?: number,
  currency?: string,
  
  // Optimized counters (updated via transactions)
  likeCount: number,
  commentCount: number,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. `track-stats` Collection (for quick access)
```
track-stats/{trackId}
{
  trackId: string,
  likeCount: number,
  commentCount: number,
  lastUpdated: timestamp
}
```

### 3. `user-likes` Collection (for efficient user queries)
```
user-likes/{userId}
{
  userId: string,
  likedTracks: {
    [trackId]: {
      likedAt: timestamp,
      trackTitle: string // for quick display
    }
  },
  lastUpdated: timestamp
}
```

### 4. `track-likes` Collection (for quick like queries)
```
track-likes/{trackId}
{
  trackId: string,
  count: number,
  users: {
    [userId]: {
      likedAt: timestamp
    }
  },
  lastUpdated: timestamp
}
```

### 5. `comments` Collection
```
comments/{commentId}
{
  id: string,
  trackId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  createdAt: timestamp,
  likes: number,
  
  // For efficient queries
  trackId_createdAt: string // composite field for sorting
}
```

### 6. `comment-likes` Collection
```
comment-likes/{commentId}
{
  commentId: string,
  count: number,
  users: {
    [userId]: {
      likedAt: timestamp
    }
  }
}
```

## Read Optimization Strategy

### For Track List (1 read per page)
- Single query to `tracks` collection with pagination
- All like counts and comment counts included in track document
- User's like status from `user-likes/{userId}` (1 additional read)

### For Like Operations (1-2 reads + 1 write)
- Read `user-likes/{userId}` to check current status
- Update via transaction: `tracks/{trackId}`, `track-likes/{trackId}`, `user-likes/{userId}`

### For Comments (1 read per track)
- Query `comments` collection where `trackId == trackId` with pagination
- Comment counts already in track document

### Total Reads for Home Page
- Tracks: 1 read (50 tracks)
- User likes: 1 read (user's like data)
- Comments: 0 reads (only when drawer opens)
- **Total: 2 reads for entire home page**