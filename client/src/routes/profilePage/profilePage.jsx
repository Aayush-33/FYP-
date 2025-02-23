import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();
  const [userPosts, setUserPosts] = useState(null);
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteProperty = (postId) => {
    if (userPosts) {
      setUserPosts(userPosts.filter(post => post.id !== postId));
    }
  };
  
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser.avatar || "noavatar.jpg"} alt="" />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My Properties</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => {
                // Store posts in state if not already set
                if (!userPosts && postResponse.data.userPosts) {
                  setUserPosts(postResponse.data.userPosts);
                }
                return (
                  <List 
                    posts={userPosts || postResponse.data.userPosts} 
                    onDeleteProperty={handleDeleteProperty}
                    isOwnerView={true}
                  />
                );
              }}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Pending Verification</h1>
            <div className="pendingNote">
              These properties are awaiting admin verification and are not yet visible to the public.
            </div>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => 
                postResponse.data.pendingPosts && postResponse.data.pendingPosts.length > 0 ? (
                  <div className="pendingPosts">
                    {postResponse.data.pendingPosts.map(post => (
                      <div key={post.id} className="pendingPost">
                        <div className="pendingPostInfo">
                          <h3>{post.title}</h3>
                          <p className="pendingAddress">{post.address}, {post.city}</p>
                          <p className="pendingPrice">Rs. {post.price}</p>
                          <div className="pendingStatus">
                            <span className="pendingBadge">Pending Verification</span>
                          </div>
                        </div>
                        <div className="pendingPostImage">
                          {post.images && post.images.length > 0 && (
                            <img src={post.images[0]} alt={post.title} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No pending posts</p>
                )
              }
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.savedPosts} />}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>Error loading chats!</p>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data}/>}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
