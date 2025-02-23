import { useContext, useEffect, useRef, useState } from "react";
import "./chatPage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useLoaderData, useNavigate } from "react-router-dom";

function ChatPage() {
  const chat = useLoaderData();
  const [messages, setMessages] = useState(chat?.messages || []);
  const [receiver, setReceiver] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const messageEndRef = useRef();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        // Fetch chat details including messages
        const res = await apiRequest.get(`/chats/${chat.id}`);
        setMessages(res.data.messages || []);
        
        // Determine the receiver (the other user in the chat)
        const otherUserId = res.data.userIDs.find(id => id !== currentUser.id);
        if (otherUserId) {
          const userRes = await apiRequest.get(`/users/${otherUserId}`);
          setReceiver(userRes.data);
        }
      } catch (err) {
        console.log(err);
        navigate("/profile"); // Redirect on error
      }
    };

    fetchChatDetails();
  }, [chat.id, currentUser.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;
    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setMessages(prev => [...prev, res.data]);
      e.target.reset();
      
      if (socket && receiver) {
        socket.emit("sendMessage", {
          receiverId: receiver.id,
          data: res.data,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await apiRequest.put(`/chats/read/${chat.id}`);
      } catch (err) {
        console.log(err);
      }
    };

    markAsRead();

    if (socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setMessages(prev => [...prev, data]);
          markAsRead();
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off("getMessage");
      }
    };
  }, [socket, chat.id]);

  if (!receiver) {
    return <div className="chatPage loading">Loading chat...</div>;
  }

  return (
    <div className="chatPage">
      <div className="chatContainer">
        <div className="chatHeader">
          <div className="user">
            <img src={receiver.avatar || "/noavatar.jpg"} alt="" />
            <span>{receiver.username}</span>
          </div>
          <button onClick={() => navigate("/profile")}>Back to Profile</button>
        </div>
        <div className="messagesContainer">
          {messages.map((message) => (
            <div
              className={`message ${message.userId === currentUser.id ? "own" : ""}`}
              key={message.id}
            >
              <p>{message.text}</p>
              <span>{format(message.createdAt)}</span>
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <form onSubmit={handleSubmit} className="chatInput">
          <textarea name="text" placeholder="Type your message..."></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage; 