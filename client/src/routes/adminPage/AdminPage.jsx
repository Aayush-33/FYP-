import { useContext, useEffect, useState } from "react";
import "./adminPage.scss";
import apiRequest from "../../lib/apiRequest";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingPost, setVerifyingPost] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users
      const usersResponse = await apiRequest.get("/users");
      setUsers(usersResponse.data);
      
      try {
        // Fetch unverified posts in a separate try-catch block to handle errors independently
        const postsResponse = await apiRequest.get("/posts", {
          params: { showUnverified: 'false' }
        });
        setPendingPosts(postsResponse.data);
      } catch (postErr) {
        console.error("Error fetching pending posts:", postErr);
        setPendingPosts([]);
        setError("Unable to load pending posts. You can still manage users.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if the user is authenticated
    if (currentUser) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  const handleVerifyPost = async (postId) => {
    try {
      setVerifyingPost(postId);
      await apiRequest.put(`/posts/verify/${postId}`);
      
      // Remove the post from the pending list after verification
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      setVerifyingPost(null);
    } catch (err) {
      console.error("Error verifying post:", err);
      setVerifyingPost(null);
      alert(`Failed to verify post: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="adminPage loading">Loading admin data...</div>;
  }

  return (
    <div className="adminPage">
      <div className="adminHeader">
        <Link to="/" className="backToSite">
          <img src="/arrow.png" alt="Back" />
          Back to Site
        </Link>
        <h1>Admin Dashboard</h1>
      </div>
      
      <div className="adminContainer">
        {/* Posts Pending Verification Section */}
        <div className="pendingPostsContainer">
          <div className="sectionHeader">
            <h2>Posts Pending Verification {pendingPosts.length > 0 && `(${pendingPosts.length})`}</h2>
            {error && (
              <div className="errorContainer">
                <p className="errorMessage">{error}</p>
                <button className="retryButton" onClick={fetchData}>Retry</button>
              </div>
            )}
          </div>
          
          {!error && pendingPosts.length === 0 ? (
            <div className="emptyState">No posts pending verification</div>
          ) : (
            <div className="pendingPostsList">
              {pendingPosts.map((post) => (
                <div key={post.id} className="pendingPostCard">
                  <div className="postImageContainer">
                    {post.images && post.images.length > 0 && (
                      <img src={post.images[0]} alt={post.title} className="postImage" />
                    )}
                  </div>
                  <div className="postInfo">
                    <h3>{post.title}</h3>
                    <p className="postAddress">{post.address}, {post.city}</p>
                    <p className="postPrice">Rs. {post.price}</p>
                    <div className="postMeta">
                      <span>{post.property}</span>
                      <span>{post.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                      <span>{post.bedroom} bed</span>
                      <span>{post.bathroom} bath</span>
                    </div>
                    {post.user && (
                      <p className="postOwner">
                        Posted by: {post.user.username}
                      </p>
                    )}
                  </div>
                  <div className="postActions">
                    <button 
                      className="viewButton"
                      onClick={() => navigate(`/${post.id}`)}
                    >
                      View Details
                    </button>
                    <button 
                      className="verifyButton"
                      onClick={() => handleVerifyPost(post.id)}
                      disabled={verifyingPost === post.id}
                    >
                      {verifyingPost === post.id ? 'Verifying...' : 'Verify Post'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* User Management Section */}
        <div className="userListContainer">
          <h2>User Management ({users.length})</h2>
          <div className="tableContainer">
            <table className="userTable">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="avatarCell">
                      <img 
                        src={user.avatar || "/noavatar.jpg"} 
                        alt={user.username} 
                        className="userAvatar"
                      />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="statsContainer">
          <div className="statCard">
            <h3>Total Users</h3>
            <p className="statValue">{users.length}</p>
          </div>
          <div className="statCard">
            <h3>Pending Posts</h3>
            <p className="statValue">{pendingPosts.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 