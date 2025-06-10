# Google OAuth Token Refresh Solution

## Problem Statement

Users were experiencing issues where Google Drive integration on deal detail page documents tab would stop working after some time, requiring them to disconnect and reconnect their Google integration to restore functionality.

## Root Cause Analysis

The issue was caused by **expired Google OAuth access tokens** without automatic refresh:

1. **Google Access Tokens Expire**: Google OAuth access tokens typically expire after 1 hour
2. **No Automatic Refresh**: The system stored refresh tokens but never used them to get new access tokens
3. **Simple Error Handling**: When tokens expired, the system only told users to "reconnect" instead of attempting automatic refresh
4. **Manual Intervention Required**: Users had to manually disconnect and reconnect to get fresh tokens

## Solution Implementation

### 1. Automatic Token Refresh Service

**File**: `lib/googleIntegrationService.ts`

Added comprehensive token refresh functionality:

- **`refreshAccessToken()`**: Calls Google's token refresh endpoint using stored refresh token
- **`getValidTokens()`**: Automatically checks token expiry and refreshes if needed (5-minute buffer)
- **Database Updates**: Automatically updates stored tokens with new access token and expiry time
- **Error Handling**: Graceful fallback to manual reconnection if refresh fails

### 2. Enhanced Google Client Setup

**Files**: `lib/emailService.ts`, `lib/googleDriveService.ts`

Updated Google API client initialization:

- **Token Event Listeners**: Added `oauth2Client.on('tokens')` handlers for automatic token updates
- **Proactive Refresh**: Google client library automatically refreshes tokens during API calls
- **Database Synchronization**: New tokens are automatically saved to database
- **Service Integration**: All services now use the enhanced token management

### 3. Updated GraphQL Resolvers

**Files**: `netlify/functions/graphql/resolvers/queries/driveQueries.ts`, `sharedDriveQueries.ts`

Modified all Google API calls to:

- Use the new `getValidTokens()` method instead of raw token retrieval
- Pass `userId` parameter for proper token management
- Benefit from automatic refresh without code changes

## Technical Details

### Token Refresh Flow

```mermaid
graph TD
    A[API Call] --> B[getValidTokens()]
    B --> C{Token Expired?}
    C -->|No| D[Return Valid Token]
    C -->|Yes| E[refreshAccessToken()]
    E --> F{Refresh Success?}
    F -->|Yes| G[Update Database]
    F -->|No| H[Return null - User must reconnect]
    G --> I[Return New Token]
    D --> J[Continue API Call]
    I --> J
    H --> K[Show Reconnection Message]
```

### Key Features

1. **Proactive Refresh**: Tokens are refreshed 5 minutes before expiry
2. **Dual-Layer Protection**: Both service-level and client-level refresh mechanisms
3. **Graceful Degradation**: Falls back to manual reconnection if refresh fails
4. **Scope Preservation**: Maintains granted scopes during token refresh
5. **Usage Tracking**: Updates `last_used_at` timestamp for monitoring

### Environment Variables Required

```bash
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
```

## Testing

### Manual Testing Function

Added `testTokenRefresh()` function for verification:

```typescript
const result = await googleIntegrationService.testTokenRefresh(userId, accessToken);
console.log(result.message); // Shows token status and refresh results
```

### Integration Testing

1. **Normal Usage**: Google Drive/Gmail features work seamlessly without interruption
2. **Token Expiry**: System automatically refreshes tokens without user intervention
3. **Refresh Failure**: Users see clear message to reconnect if refresh fails
4. **Scope Changes**: System handles scope modifications during refresh

## Benefits

### For Users
- **Seamless Experience**: No more manual disconnection/reconnection required
- **Continuous Access**: Google Drive documents remain accessible indefinitely
- **Transparent Operation**: Token refresh happens automatically in background

### For System
- **Improved Reliability**: Eliminates token expiry as a failure point
- **Better UX**: Reduces user friction and support requests
- **Monitoring**: Enhanced logging for token refresh operations
- **Scalability**: Handles multiple concurrent users with token refresh

## Monitoring & Logging

The solution includes comprehensive logging:

- Token refresh attempts and results
- Database update operations
- Error conditions and fallback scenarios
- Usage patterns and timing

## Security Considerations

- **Refresh Token Protection**: Refresh tokens are securely stored and never exposed
- **Scope Validation**: Granted scopes are preserved and validated during refresh
- **Error Boundaries**: Failed refresh attempts don't expose sensitive information
- **Database Security**: Token updates use proper authentication and RLS policies

## Future Enhancements

1. **Proactive Monitoring**: Alert system for refresh failures
2. **Token Analytics**: Dashboard for token usage and refresh patterns
3. **Batch Refresh**: Optimize refresh operations for multiple users
4. **Scope Management**: UI for users to modify granted scopes

## Conclusion

This solution eliminates the need for users to manually disconnect and reconnect their Google integration by implementing automatic OAuth token refresh. The system now handles token expiry transparently, providing a seamless experience for Google Drive and Gmail integration features.

The implementation follows OAuth 2.0 best practices and provides robust error handling while maintaining security and user experience standards. 