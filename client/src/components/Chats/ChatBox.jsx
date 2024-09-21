import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser, setOnlineUsers } from "../global/slice";
import { Popup } from "../../utils/Popup";
import moment from "moment";
import { MdClose, MdSend } from "react-icons/md";
import {
  FaSmile,
  FaPaperclip,
  FaArrowLeft,
  FaTrash,
  FaOptinMonster,
} from "react-icons/fa";
import Picker from "emoji-picker-react";
import ChatSidebar from "./ChatSidebar";
import { useNavigate, useParams } from "react-router-dom";
import useNetworkSpeed from "../../utils/useNetworkSpeed";
import { SlOptionsVertical } from "react-icons/sl";
import { MessageLoading } from "../../utils/MessageLoading";

const placeholder =
  "https://www.lightsong.net/wp-content/uploads/2020/12/blank-profile-circle.png";

const ChatBox = () => {
  const networkStatus = useNetworkSpeed();
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.data.user);
  const currentUser = useSelector((state) => state.data.currentUser);
  const onlineUser = useSelector((state) => state.data.onlineUser);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const messageRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (networkStatus) {
      const { downlink, effectiveType } = networkStatus;
      if (effectiveType === "2g") {
        Popup(
          "warning",
          "Your network speed is slow. You may experience delays."
        );
      }
    }
  }, [networkStatus]);

  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = io(import.meta.env.VITE_ENDPOINT, {
      transports: ["websocket", "polling", "flashsocket"],
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  useEffect(() => {
    const socket = socketRef.current;
    const data = {
      roomId,
      userId: user._id,
    };
    socket.emit("joinRoom", data);
    return () => {
      socket.emit("leaveRoom", data);
    };
  }, [roomId]);
  useEffect(() => {
    const socket = socketRef.current;

    if (user && currentUser) {
      socket.emit("get-messages", roomId);
    }

    return () => {
      socket.off("get-messages");
    };
  }, [roomId,messages]);

  useEffect(() => {
    const socket = socketRef.current;
    socket.on("receive-messages", (msg) => {
      setMessages(msg);
      setLoading(false);
    });

    socket.on("receive-message", (newMessage) => {
      console.log(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("message-sent", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    // Listen for the delete message event
    socket.on("message-deleted", (id) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== id)
      );
    });

    return () => {
      socket.off("receive-messages");
      socket.off("receive-message");
      socket.off("online-users");
      socket.off("message-sent");
      socket.off("message-deleted");
      socket.off("user-last-seen");
    };
  }, [roomId, user, currentUser, dispatch, messages, onlineUser]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  const handleLeaveRoom = () => {
    dispatch(setCurrentUser(null));
    const socket = socketRef.current;
    socket.emit("leaveRoom", { roomId, userId: user?._id });
    navigate("/chats");
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
    setUploadStatus("uploading");

    try {
      socketRef.current.emit("send-message", data, (acknowledgement) => {
        if (acknowledgement.UploadStatus) {
          setMessage("");
          setFile(null);
          setFileType("");
          setUploadStatus("sent");
        } else {
          setUploadStatus("failed");
        }
      });
    } catch (err) {
      setUploadStatus("failed");
      Popup("error", "Error sending message");
    }
  };

  const handleDelete = (id) => {
    try {
      socketRef.current.emit("delete-message", { id, roomId });
    } catch (err) {
      Popup("error", "Error deleting message");
    }
  };

  const getStatusClass = useCallback((status) => {
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
  }, []);

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
          </div>
        );
      case "document":
        return (
          <div>
            <p>{file?.name}</p>
          </div>
        );
      default:
        return null;
    }
  };
  const renderFileStatus = () => {
    switch (uploadStatus) {
      case "uploading":
        return <span className="text-md text-right">Uploading...</span>;
      case "sent":
        return;
      case "failed":
        return <span>❌ Failed to Send</span>;
      default:
        return null;
    }
  };
  const isUserOnline = (userId) => {
    return onlineUser && onlineUser[0]?.some((user) => user.userId === userId);
  };
  if (loading) {
    return <MessageLoading />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] h-[100vh]">
      <div className="hidden sm:block relative h-full mr-[0.05rem]">
        <ChatSidebar />
      </div>
      <div className="grid grid-rows-[60px_auto_50px] h-full">
        <header className="bg-[#4e4e4e] border-b border-[#262626] backdrop-blur-xl sticky top-0 p-2  flex items-center gap-2 z-10">
          <div
            onClick={handleLeaveRoom}
            className="group cursor-pointer bg-[#349070] w-10 h-10 flex justify-center items-center rounded-full"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-500 text-[0.85rem] md:text-[1rem] text-[#eee] rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <figure>
              <img
                src={`${import.meta.env.VITE_ENDPOINT}/profile/${
                  currentUser?.profile
                }`}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full object-cover"
              />
            </figure>
            <div className="flex flex-col gap-1">
              <h2 className="text-[#ededed] capitalize text-lg font-semibold leading-3">
                {currentUser?.email?.split("@")[0] || ""}
                {isUserOnline(currentUser?._id) ? (
                  <span className="text-sm">🟢</span>
                ) : (
                  <span className="text-sm">🔴</span>
                )}
              </h2>
            </div>
          </div>
        </header>
        <main className="p-2 min-h-[100vh] overflow-y-auto bg-[#4a4949]">
          <ul>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <li
                  key={msg?._id}
                  // ref={messageRef}
                  className={`flex items-center gap-1 ${
                    msg?.senderId === user?._id
                      ? "justify-end self-end"
                      : "justify-start self-start"
                  }`}
                >
                  {msg?.senderId !== user?._id ? (
                    <img
                      src={`${import.meta.env.VITE_ENDPOINT}/profile/${
                        currentUser?.profile
                      }`}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_ENDPOINT}/profile/${
                        user?.profile
                      }`}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`${
                      msg?.senderId === user?._id
                        ? "bg-[#349070]"
                        : "bg-[#707579]"
                    } px-6 py-1 mb-1 rounded-md relative`}
                  >
                    {renderMessageContent(msg)}
                    <p className="text-[10px] text-white text-right">
                      <span className="text-[0.6rem]">
                      {moment(msg?.createdAt).format('h:mm A')}
                      </span>
                      <span className="ml-1">
                        {getStatusClass(msg?.status)}
                      </span>
                    </p>
                    {msg?.senderId === user?._id && (
                      <details>
                        <summary className="list-none absolute top-2 right-1">
                          <SlOptionsVertical className="text-xs text-white cursor-pointer" />
                        </summary>
                        <ul className="absolute top-3.5 left-0 bg-[#4e4e4e] p-1 rounded cursor-pointer">
                          <li
                            onClick={() => handleDelete(msg?._id)}
                            className="flex items-center gap-1 text-[0.75rem] bg-[#f65b5b] p-1 rounded transition duration-500"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </li>
                        </ul>
                      </details>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <div className="h-[calc(100vh-10rem)] flex justify-center items-center flex-col gap-2">
                <h1>No messages yet...</h1>
                <h1 className="text-xl">Start messaging together...</h1>
              </div>
            )}
          </ul>
        </main>
        {renderFileStatus()}
        <footer className="border-t bg-[#4e4e4e] backdrop-blur-xl border-[#262626] p-1 sticky bottom-0">
          {file && renderFilePreview()}
          {file && (
            <button
              onClick={() => setFile(null)}
              className="absolute bottom-44 left-40 border p-1 py-3 rounded-full px-3 bg-slate-900 hover:-translate-y-1 transition-all duration-500"
            >
              <MdClose />
            </button>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <FaSmile
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="cursor-pointer hover:bg-[#585858] transition-bg duration-300 p-2 text-[2.3rem] rounded-full"
              />
              {showEmojiPicker && (
                <div className="absolute bottom-16 w-24">
                  <Picker onEmojiClick={onEmojiClick} disableAutoFocus />
                </div>
              )}
              <label>
                <FaPaperclip className="cursor-pointer hover:bg-[#585858] transition-bg duration-500 p-2 text-[2.3rem] rounded-full" />
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
              className="flex-1 py-2 px-4 text--[#fff] bg-transparent rounded-full focus:outline-none"
            />
            <button
              type="submit"
              className="p-[0.6rem] bg-[#349070] text-white rounded-full hover:bg-blue-600"
            >
              <MdSend className="text-2xl transition-transform duration-500 md:text-md pl-1" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(ChatBox);
