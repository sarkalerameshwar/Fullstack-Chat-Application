# Friend Request System - Implementation Guide

## Overview
A complete friend request/invite system for your chat application allowing users to search for others and send/receive friend requests.

---

## 📋 Files Created

### Frontend

#### 1. **Store** - `frontend/src/store/useFriendRequestStore.js`
Zustand store managing all friend request logic:
- **Search**: `searchUsers(query)` - Search by username or email
- **Send**: `sendFriendRequest(receiverId)` - Send friend request
- **Fetch**: `fetchFriendRequests()` - Get pending requests received
- **Fetch**: `fetchSentRequests()` - Get sent pending requests
- **Accept**: `acceptFriendRequest(senderId)` - Accept request
- **Reject**: `rejectFriendRequest(senderId)` - Reject request
- **Cancel**: `cancelFriendRequest(receiverId)` - Cancel sent request

#### 2. **Components**

**SearchResults.jsx** - Display search results
- Shows users matching search query
- "Send Request" button (disabled if already sent)
- User profile pictures and details
- Loading states

**FriendRequestsList.jsx** - Display pending requests
- Shows all received friend requests
- Accept/Reject buttons
- Sender details
- Auto-fetches on component mount

**FriendRequestBadge.jsx** - Navbar badge (optional)
- Shows count of pending requests
- Links to invite page
- Auto-refreshes every 30 seconds

**InvitePage.jsx** - Main invite page
- Search bar with debounce (300ms)
- Search results below
- Pending friend requests section
- Responsive design
- Dark mode support

---

## 📡 Backend API Endpoints

### Already Available
- `POST /api/users/friend-request` - Send friend request
- `POST /api/users/:id/accept-friend-request` - Accept request
- `POST /api/users/:id/reject-friend-request` - Reject request
- `DELETE /api/users/:id/delete-friend-request` - Cancel sent request
- `GET /api/search/users?query=...` - Search users

### Updated/Added
- `GET /api/users/friend-requests` - Get pending received requests
- `GET /api/users/sent-friend-requests` - Get pending sent requests
- `GET /api/users/friends-list` - Get accepted friends list

---

## 🔄 User Flow

### 1. **Search for Friends**
```
User enters name/email → Frontend debounces 300ms → 
Backend searches → Display results with "Send Request" button
```

### 2. **Send Friend Request**
```
User clicks "Send Request" → 
Backend creates FriendRequest (status: "pending") →
Button changes to "Request Sent" (disabled)
```

### 3. **Receive Requests**
```
Other user searches and sends request →
Receiver sees it in "Your Friend Requests" section →
Shows sender name, email, profile picture
```

### 4. **Accept/Reject Request**
```
Receiver clicks "Accept" or "Reject" →
FriendRequest status updates to "accepted" or "rejected" →
List refreshes automatically
```

---

## 🔐 Schema Reference

### FriendRequest Model
```javascript
{
  senderId: ObjectId (ref: "User"),
  receiverId: ObjectId (ref: "User"),
  status: "pending" | "accepted" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```
- **Unique Index**: `{ senderId, receiverId }` prevents duplicate requests

---

## 📱 Integration Steps

### 1. **Add to Navbar** (optional)
```jsx
import FriendRequestBadge from "./components/FriendRequestBadge";

// In your navbar component:
<FriendRequestBadge />
```

### 2. **Ensure Route Exists**
Make sure your router includes:
```jsx
import InvitePage from "./pages/InvitePage";

<Route path="/invite" element={<InvitePage />} />
```

### 3. **Verify Backend Routes**
Check that `backend/index.js` imports the request routes:
```javascript
import requestRoutes from "./routes/request.route.js";
app.use("/api", requestRoutes);
app.use("/api", searchRoutes);
```

---

## ✨ Features

✅ Search by username or email  
✅ Send friend requests  
✅ Receive and manage friend requests  
✅ Accept/Reject requests  
✅ Cancel sent requests  
✅ Prevents duplicate requests  
✅ Prevents self-requests  
✅ Prevents requesting already-friends  
✅ Loading states and error handling  
✅ Toast notifications  
✅ Dark mode support  
✅ Responsive design  
✅ Debounced search (300ms)  

---

## 🚀 Usage

### For Users
1. Navigate to `/invite` page
2. Type friend's name or email in search bar
3. Click "Send Request"
4. View your pending requests below
5. Accept or reject incoming requests

### For Developers
```javascript
// Import the store
import { useFriendRequestStore } from "./store/useFriendRequestStore";

// Use in component
const { searchUsers, sendFriendRequest, friendRequests } = useFriendRequestStore();

// Search
await searchUsers("john");

// Send request
await sendFriendRequest(userId);

// Get pending requests
await fetchFriendRequests();
```

---

## 🐛 Troubleshooting

### Search not working?
- Check `/api/search/users` endpoint is available
- Ensure query parameter is being sent
- Check browser console for errors

### Friend requests not loading?
- Verify user is authenticated
- Check `/api/users/friend-requests` endpoint
- Clear browser cache and refresh

### "Request Sent" showing incorrectly?
- The store fetches sent requests automatically
- If not updating, manually call `fetchSentRequests()`

---

## 📝 Notes

- All API calls include authentication (protectRoute middleware)
- Timestamps (createdAt, updatedAt) are auto-managed by MongoDB
- Search is case-insensitive
- Toast notifications provide user feedback
- Images use Cloudinary URLs from profile_Pic field

---

## 🔄 Real-time Updates (Optional Enhancement)

To add real-time updates with Socket.io:
```javascript
// In socket.js
socket.on("friendRequestSent", (data) => {
  // Refresh friend requests for the receiver
});
```

---

## 📦 Dependencies

Already included in your project:
- ✅ `zustand` - State management
- ✅ `axios` - HTTP requests
- ✅ `react-hot-toast` - Notifications
- ✅ `lucide-react` - Icons

No additional dependencies needed!
