import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { UseApi, setOnlineUsers } from "../global/slice";
import { Popup } from "../../utils/Popup";
import moment from "moment";
import { MdSend } from "react-icons/md";
import { FaSmile, FaPaperclip, FaArrowLeft, FaTrash } from "react-icons/fa";
import Picker from "emoji-picker-react";
import ChatSidebar from "./ChatSidebar";
import { useNavigate, useParams } from "react-router-dom";

const placeholder =
  "https://www.lightsong.net/wp-content/uploads/2020/12/blank-profile-circle.png";

const ChatBox = () => {
  const api = UseApi();
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.data.user);
  const currentUser = useSelector((state) => state.data.currentUser);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const messageRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = io('https://mern-chat-application-a8lw.onrender.com', {
      transports: ["websocket", "polling", "flashsocket"],
    });

    const socket = socketRef.current;

    if (user && currentUser) {
      socket.emit("get-messages", roomId);
    }

    socket.on("receive-messages", (msg) => {
      setMessages(msg);
      setLoading(false);
    });

    socket.on("receive-message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("message-sent", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [roomId, currentUser, user, dispatch]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const onEmojiClick = (event) => {
    setMessage((prevMessage) => prevMessage + event?.emoji);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      let fileType;
      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else if (file.type.startsWith("video/")) {
        fileType = "video";
      } else if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        fileType = "document";
      } else {
        fileType = "other";
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile({ name: file.name, data: reader.result });
        setFileType(fileType);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message && !file) {
      return;
    }
    const data = {
      roomId,
      senderId: user._id,
      receiverId: currentUser._id,
      messageType: file ? fileType : "text",
      content: file ? file.data : message,
      status: "sent",
      isRead: false,
    };

    try {
      socketRef.current.emit("send-message", data);
      setMessage("");
      setFile(null);
      setFileType("");
    } catch (err) {
      Popup("error", "Error sending message");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/chat/messages/${id}`);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== id)
      );
    } catch (err) {
      Popup("error", "Error deleting message");
    }
  };

  const getStatusClass = useCallback(
    (status) => {
      switch (status) {
        case "sent":
          return "✔";
        case "delivered":
          return "✔✔";
        case "seen":
          return "✔✔✔";
        default:
          return "";
      }
    },
    []
  );

  const renderMessageContent = (msg) => {
    switch (msg?.messageType) {
      case "image":
        return (
          <div>
            <span className="text-sm italic">[Image]</span>
            <img src={msg?.content} alt="Image" className="max-w-xs max-h-xs" />
          </div>
        );
      case "video":
        return (
          <div>
            <span className="text-sm italic">[Video]</span>
            <video src={msg?.content} controls className="max-w-xs max-h-xs" />
          </div>
        );
      case "document":
        return (
          <div>
            <span className="text-sm italic">[Document]</span>
            <a
              href={msg?.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#262626] underline"
            >
              view the document
            </a>
          </div>
        );
      case "text":
      default:
        return <span>{msg?.content}</span>;
    }
  };

  const renderFilePreview = () => {
    switch (fileType) {
      case "image":
        return (
          <figure>
            <img
              src={file?.data}
              alt="attachment"
              className="w-36 h-36 absolute bottom-16 object-contain"
            />
            <button
              onClick={() => setFile(null)}
              className="absolute bottom-16 left-1/4 border p-1 rounded-full px-3 bg-slate-900 hover:-translate-y-1 transition-all duration-500"
            >
              x
            </button>
          </figure>
        );
      case "video":
        return (
          <div>
            <video
              src={file?.data}
              controls
              className="w-28 h-28 absolute bottom-16 object-contain"
            ></video>
            <button
              onClick={() => setFile(null)}
              className="absolute bottom-16 left-1/4 border p-1 rounded-full px-3 bg-slate-900 hover:-translate-y-1 transition-all duration-500"
            >
              x
            </button>
          </div>
        );
      case "document":
        return (
          <div>
            <p>{file?.name}</p>
            <button
              onClick={() => setFile(null)}
              className="absolute bottom-16 left-1/4 border p-1 rounded-full px-3 bg-slate-900 hover:-translate-y-1 transition-all duration-500"
            >
              x
            </button>
          </div>
        );
      default:
        return null;
    }
  };
  if(loading){
    return <div className="absolute inset-0 bg-[rgba(255,255,255,0.1)] flex items-center justify-center h-full">
      <h1 className="text-white text-2xl">loading...</h1>
    </div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] h-screen">
      <div className="hidden sm:block relative h-full">
        <ChatSidebar />
      </div>
      <div className="grid grid-rows-[60px_auto_55px] h-full">
        <header className="bg-[#547292] sticky top-0 p-2 rounded flex items-center gap-2 z-10">
          <div className="group cursor-pointer bg-[#373737] rounded-full">
            <FaArrowLeft
              onClick={() => navigate("/chats")}
              className="group-hover:-translate-x-1 transition-transform duration-500 p-2 md:p-1.5 text-3xl md:text-3xl text-[#eee] rounded-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <figure>
              <img
                src={currentUser?.avatar || placeholder}
                alt={currentUser?.name}
                className="w-11 h-11 rounded-full object-cover"
              />
            </figure>
            <div className="flex flex-col gap-2">
              <h2 className="text-[#ededed] text-lg font-semibold leading-3">
                {currentUser?.email?.split('@')[0] || ""}
              </h2>
              <span className="text-xs italic text-[#ededed]">
                Active {moment(currentUser?.updatedAt).fromNow()}
              </span>
            </div>
          </div>
        </header>
        <div className="p-2 overflow-y-auto">
          <ul>
            {messages.map((msg) => (
              <li
                key={msg?._id}
                ref={messageRef}
                className={`flex ${
                  msg?.senderId === user?._id
                    ? "justify-end self-end"
                    : "justify-start self-start"
                }`}
              >
                <div
                  className={`bg-${
                    msg?.senderId === user?._id
                      ? "[#4f93a3]"
                      : "[#abb3ba]"
                  } px-2 py-1 rounded-md`}
                >
                  {renderMessageContent(msg)}
                  <p className="text-[10px] text-white text-right">
                    {moment(msg?.createdAt).fromNow()}
                    <span className="ml-1">{getStatusClass(msg?.status)}</span>
                  </p>
                  {msg?.senderId === user?._id && (
                    <FaTrash
                      onClick={() => handleDelete(msg?._id)}
                      className="text-xs text-white cursor-pointer"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <footer className="border-t bg-[#494949] border-gray-300 p-2 sticky bottom-0">
          {file && renderFilePreview()}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <FaSmile
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="cursor-pointer text-md md:text-xl text-yellow-400 hover:text-gray-700"
              />
              {showEmojiPicker && (
                <div className="absolute bottom-16">
                  <Picker
                    onEmojiClick={onEmojiClick}
                    disableAutoFocus
                  />
                </div>
              )}
              <label>
                <FaPaperclip className="cursor-pointer text-md md:text-lg text-gray-300 hover:text-gray-700" />
                <input
                  type="file"
                  accept="image/*,video/*,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <input
            ref={inputRef}
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 bg-[#78787800] rounded-full focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 md:p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <MdSend className="text-lg md:text-md pl-0.5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatBox;
