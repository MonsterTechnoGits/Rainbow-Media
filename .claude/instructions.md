# RainbowMedia Development Instructions

## 🎯 Project Context

**RainbowMedia** is a modern audio story streaming platform built with Next.js 15, Firebase, Material-UI, and Cloudflare R2. This is a production-ready application with comprehensive admin tools, payment integration via Razorpay, and optimized database architecture.

**Live Demo**: [https://rainbow-media.vercel.app/](https://rainbow-media.vercel.app/)

---

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.5 (App Router)
- **UI**: Material-UI v7.3.0 with custom theming
- **Database**: Firebase Firestore (optimized for minimal reads)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Firebase Auth with JWT tokens
- **Payments**: Razorpay integration
- **Language**: TypeScript 5.8.3 (strict mode)

### Key Design Principles
1. **Performance First**: Denormalized data, minimal Firestore reads
2. **Type Safety**: Full TypeScript coverage, no `any` types
3. **Security**: Admin-only endpoints, JWT verification, file validation
4. **UX Excellence**: Material-UI best practices, responsive design
5. **Scalability**: Batch operations, cursor-based pagination

---

## 📋 Development Guidelines

### Code Standards

#### TypeScript
- Use strict mode TypeScript with no `any` types
- Define interfaces for all data structures
- Use proper typing for API responses and form data
- Prefer `interface` over `type` for object shapes

#### React Components
- Functional components with hooks only
- Use React.FC with proper prop interfaces
- Implement proper error boundaries
- Follow Material-UI component patterns

#### API Routes (Next.js 15 App Router)
```typescript
// Always use Promise<{ id: string }> for params in App Router
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await params
  // ... rest of implementation
}
```

#### Database Operations
- Use transactions for multi-document updates
- Implement proper error handling with try/catch
- Use batch operations for multiple writes
- Always update denormalized counters (likeCount, commentCount)

### File Organization

#### Component Structure
```
src/components/
├── ComponentName.tsx        # Main component
├── ComponentName/           # Complex components get folders
│   ├── index.tsx
│   ├── ComponentName.tsx
│   └── subcomponents/
```

#### API Route Structure
```
src/app/api/
├── stories/                 # Public story APIs
├── admin/                   # Admin-only APIs
├── upload/                  # File upload endpoints
└── auth/                    # Authentication helpers
```

### State Management

#### Global State (Context)
- Use React Context for app-wide state
- Implement proper TypeScript interfaces for context values
- Provide loading and error states

#### Local State
- Use `useState` for component-specific state  
- Use `useEffect` with proper dependency arrays
- Implement cleanup functions for subscriptions

### Firebase Best Practices

#### Firestore Queries
```typescript
// Optimized query pattern
const getStoriesWithLikes = async (userId: string) => {
  // 1. Get stories (1 read)
  const stories = await getStories();
  
  // 2. Get user likes (1 read)  
  const userLikes = await getUserLikes(userId);
  
  // Total: 2 reads for entire story list with like status
  return stories.map(story => ({
    ...story,
    isLiked: userLikes.has(story.id)
  }));
};
```

#### Transaction Pattern
```typescript
// Atomic like operation
await runTransaction(db, async (transaction) => {
  // Read phase
  const [userDoc, storyDoc, likesDoc] = await Promise.all([
    transaction.get(userRef),
    transaction.get(storyRef), 
    transaction.get(likesRef)
  ]);
  
  // Write phase  
  transaction.update(storyRef, { likeCount: newCount });
  transaction.set(userRef, userData);
  transaction.set(likesRef, likesData);
});
```

---

## 🎨 UI/UX Guidelines

### Material-UI Integration

#### Theme Usage
- Use theme colors via `theme.palette.primary.main`
- Implement responsive breakpoints with `theme.breakpoints`
- Use `alpha()` for transparent colors
- Follow Material Design spacing (8px grid)

#### Component Patterns
```typescript
// Proper MUI component usage
<Paper
  sx={{
    borderRadius: 3,
    overflow: 'hidden',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  }}
>
```

#### Grid System (MUI v7)
```typescript
// New Grid API in MUI v7
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6 }}>
    {/* Content */}
  </Grid>
</Grid>
```

### Responsive Design
- Mobile-first approach
- Test on multiple screen sizes
- Use MUI breakpoints: `xs`, `sm`, `md`, `lg`, `xl`
- Implement touch-friendly interfaces

### Admin Interface Standards
- Use data tables for list views
- Implement search and pagination
- Use confirmation dialogs for destructive actions  
- Provide success/error feedback via Snackbar
- Show loading states during API calls

---

## 🔒 Security Requirements

### Authentication
- Verify JWT tokens on all protected endpoints
- Check admin claims: `decodedToken.isAdmin`
- Return proper HTTP status codes (401, 403, 404, 500)

### Data Validation
- Use Zod schemas for form validation
- Sanitize user inputs before database storage
- Validate file uploads (type, size, content)

### API Security
```typescript
// Admin endpoint pattern
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { decodedToken, error } = await verifyToken(request);
  
  if (error || !decodedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!decodedToken.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  // ... admin operation
}
```

---

## 📊 Database Schema Rules

### Story Documents (`stories` collection)
```typescript
interface FirestoreStory {
  id: string;
  title: string;
  creator: string;
  series: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  isPaid: boolean;
  price?: number;
  currency?: string;
  likeCount: number;      // Always keep updated
  commentCount: number;   // Always keep updated
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Denormalization Strategy
- Store like/comment counts directly in story documents
- Maintain separate `user-likes/{userId}` for user's liked stories
- Use `story-likes/{storyId}` for detailed like information

### Cascade Deletion Pattern
When deleting a story, remove:
1. Story document
2. All comments (`comments` collection where `storyId == storyId`)
3. Story-likes document (`story-likes/{storyId}`)
4. Story references from user-likes documents
5. Purchase history records (when implemented)

---

## 🚀 Development Workflow

### Before Starting Work
1. Read `CLAUDE.md` for current project state
2. Check `package.json` for available scripts
3. Review recent git commits for context
4. Test build: `npm run build`

### Making Changes
1. **Always run `npm run pre-check`** before committing
2. Use TypeScript strict mode - fix all type errors
3. Test on multiple screen sizes
4. Verify admin functionality requires proper authentication
5. Update CLAUDE.md when adding major features

### API Development
1. Implement proper error handling
2. Use consistent response formats
3. Add request/response type interfaces
4. Test with both success and error scenarios

### UI Development  
1. Follow Material-UI component patterns
2. Implement proper loading states
3. Add error boundaries for complex components
4. Test keyboard navigation and accessibility

---

## 🔧 Common Tasks

### Adding New Story Fields
1. Update `FirestoreStory` interface
2. Update `AudioStory` type  
3. Modify story conversion functions
4. Update admin edit form
5. Test API endpoints

### Creating Admin Features
1. Add API route in `/api/admin/`
2. Implement authentication checks
3. Create admin UI components
4. Add to admin dashboard tabs
5. Test with non-admin users

### File Upload Features
1. Use Cloudflare R2 client (`src/lib/cloudflareS3.ts`)
2. Generate signed URLs for secure access
3. Validate file types and sizes
4. Handle upload progress and errors
5. Clean up failed uploads

### Database Queries
1. Minimize read operations
2. Use composite indexes for complex queries
3. Implement cursor-based pagination
4. Cache frequently accessed data

---

## 🐛 Debugging Guidelines

### Common Issues

#### Build Errors
- TypeScript errors: Fix all type issues, avoid `any`
- Import errors: Check file paths and exports
- MUI Grid issues: Use `size={{ xs: 12 }}` not `item xs={12}`

#### Firebase Issues
- Auth: Check token expiration and custom claims
- Firestore: Verify indexes and security rules
- Admin SDK: Ensure service account key is configured

#### API Problems
- Params: Always `await params` in App Router
- CORS: Check origin headers for cross-origin requests
- Authentication: Verify JWT token structure

### Performance Monitoring
- Check Firestore read counts in development
- Monitor bundle size and loading times
- Test mobile performance and responsiveness
- Use React DevTools for component optimization

---

## 📝 Testing Approach

### Manual Testing Checklist
- [ ] Authentication flow (login/logout)
- [ ] Story upload and playback
- [ ] Like/unlike functionality
- [ ] Comment system
- [ ] Admin dashboard access
- [ ] Edit/delete stories (admin)
- [ ] Payment flow (if applicable)
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### API Testing
- Use browser DevTools Network tab
- Test with Postman for complex requests
- Verify authentication headers
- Check error response formats

---

## 🎯 Current Focus Areas

### Recently Completed
✅ Admin story management with edit/delete
✅ Cascade deletion system
✅ Full-page story editing interface
✅ Material-UI v7 Grid integration
✅ TypeScript strict mode compliance
✅ Build pipeline optimization

### Active Development
- Story analytics and reporting
- Enhanced search functionality  
- User profile management
- Content moderation tools
- Performance optimizations

### Future Enhancements
- Real-time notifications
- Social features (following, playlists)
- Advanced audio controls
- Content recommendations
- Mobile app (React Native)

---

## 💡 Best Practices Summary

1. **Always update CLAUDE.md** when implementing new features
2. **Use TypeScript strictly** - no `any` types allowed
3. **Minimize Firestore reads** - use denormalized data
4. **Implement proper error handling** - user-friendly messages
5. **Follow Material-UI patterns** - consistent UI components
6. **Secure admin operations** - verify authentication always
7. **Test responsively** - mobile-first development
8. **Document complex logic** - especially database operations
9. **Use batch operations** - for multiple Firestore writes
10. **Validate all inputs** - both client and server side

---

This project represents a production-ready application with modern architecture. Every change should maintain the high standards of performance, security, and user experience established in the current codebase.