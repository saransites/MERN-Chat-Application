import React, { useCallback, useEffect, useRef, useState } from "react";
import { Popup } from "../../utils/Popup";
import {
  logout,
  setCurrentUser,
  setOnlineUsers,
  UseApi,
} from "../global/slice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { FaPencilAlt, FaSignOutAlt } from "react-icons/fa";
import useNetworkSpeed from "../../utils/useNetworkSpeed";
import PreviewImage from "../../utils/PreviewImage";

const placeholder =
  "https://www.lightsong.net/wp-content/uploads/2020/12/blank-profile-circle.png";

const ChatSidebar = () => {
  const api = UseApi();
  const networkStatus = useNetworkSpeed();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const logUser = useSelector((state) => state.data.user);
  const onlineUser = useSelector((state) => state.data.onlineUser);
  const currentUser = useSelector((state) => state.data.currentUser);
  const [users, setUsers] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const socketRef = useRef(null);
  const [loading,setLoading]=useState(false)
  const [file,setFile]=useState(null)
  const {profile}=useSelector(state=>state.data.user)

  useEffect(() => {
    if (networkStatus) {
      const { effectiveType } = networkStatus;
      const isSlowNetwork = effectiveType === "2g";

      if (isSlowNetwork) {
        Popup(
          "warning",
          "Your network speed is slow. You may experience delays."
        );
      }
    }
  }, [networkStatus]);

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Popup("error", "User not authenticated");
        return;
      }
      const res = await api.get("/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Check if res.data is an array
      if (Array.isArray(res?.data)) {
        const filteredUsers = res?.data?.filter(
          (user) => logUser?._id !== user?._id
        );
        setUsers(filteredUsers);
      } else {
        console.log("Unexpected response format:", res.data);
        Popup("error", "Unexpected response format");
      }
    } catch (err) {
      console.error(err);
      Popup("error", "Error fetching data");
    }finally{
      setLoading(false)
    }
  };

  const handleLogout = () => {
    socketRef.current = io(import.meta.env.VITE_ENDPOINT, {
      transports: ["websocket", "polling", "flashsocket"],
    });
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      dispatch(logout());
      socketRef.current.emit("user-logout", logUser?._id);
      navigate("/");
      window.location.reload(false);
    } catch (err) {
      Popup("error", "Something went wrong...Try again later");
    }
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_ENDPOINT, {
      transports: ["websocket", "polling", "flashsocket"],
    });
    socketRef.current.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [dispatch, logUser._id, onlineUser]);
  const fetchRoomIds = useCallback(async () => {
    try {
      const res = await api.get("/chat/rooms");
      setRoomIds(res?.data);
    } catch (err) {
      console.log(err);
      Popup("error", "Error fetching room IDs");
    }
  }, [currentUser]);
  useEffect(() => {
    if (logUser) {
      fetchUsers();
      fetchRoomIds();
    }
  }, [logUser]);
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_ENDPOINT, {
      transports: ["websocket", "polling", "flashsocket"],
    });
    if (logUser) {
      const data = { userId: logUser?._id, roomIds: roomIds };
      socketRef.current.emit("user-login", data);
    }
  }, [logUser, roomIds]);

  const handleChatRoom = async (selectedUser) => {
    dispatch(setCurrentUser(selectedUser));
    const roomId =
      parseInt(logUser?.username?.slice(4)) +
      parseInt(selectedUser?.username?.slice(4));
    navigate(`/chatbox/${roomId}`);
  };

  const isUserOnline = (userId) => {
    return onlineUser && onlineUser[0]?.some((user) => user.userId === userId);
  };
  const handleFileChange=(e)=>{
    setFile(e.target.files[0])
  }
  if(file){
    return <PreviewImage file={file} setFile={setFile} />
  }
  return (
    <div
      className={`sticky bg-[#4e4e4e] shadow-[0_0_1px_1px_#262626] h-[100vh] top-0 grid grid-cols-1 ${
        location.pathname == "/chats" && "md:grid-cols-[250px_1fr]"
      }`}
    >
      <div>
        <div
          className={`bg-[#4e4e4e] flex justify-between items-center gap-1.5`}
        >
          <h1 className="p-4 flex-1 text-white text-xl font-semibold">Chats</h1>
          <details className="relative">
            <summary className="list-none mr-3 md:mr-2 cursor-pointer">
              <div className="rounded-full bg-[#89898967]"><img src={`${import.meta.env.VITE_ENDPOINT}/profile/${profile}`} alt="log-user" className="w-12 h-12 p-1 rounded-full object-cover" /></div>
              <label htmlFor="profile" className="cursor-pointer absolute hover:scale-110 transition-scale duration-500 top-0 right-0 bg-[#349070] hover:bg-[#262626] p-2 rounded-full text-[0.7rem]">
                <FaPencilAlt/>
                <input type='file' id="profile" onChange={handleFileChange} hidden/>
              </label>
            </summary>
            <ul className="absolute z-[9] -left-32 bg-[rgba(255,255,255,0.1)] backdrop-blur-xl text-[#ffffff] p-2 rounded-md mt-1">
              <li className="tracking-wider mb-1 font-semibold">
                {logUser.email.split("@")[0]}
              </li>
              <li
                onClick={handleLogout}
                className="cursor-pointer hover:tracking-wider text-center tracking-wide bg-[#d55151] p-1.5 rounded transition-all duration-500"
              >
                Signout
              </li>
            </ul>
          </details>
        </div>
        <ul className="list-none">
          {users.map((user) => (
            <li
              key={user._id}
              className={`group flex items-center justify-between mt-2 p-2 rounded cursor-pointer ${
                currentUser?._id == user._id &&
                "bg-[rgba(255,255,255,0.1)] backdrop-blur-2xl"
              } hover:bg-[#658372de] transition-bg duration-500`}
              onClick={() => handleChatRoom(user)}
            >
              <figure className="flex gap-2 items-center overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_ENDPOINT}/profile/${user.profile}`}
                  alt="profile"
                  className="w-9 h-9 rounded-full group-hover:translate-x-0.5 object-cover transition-transform duration-500"
                />
                <figcaption>
                  <p className="font-bold text-sm tracking-wider capitalize group-hover:-translate-x-0.5 transition-transform duration-500">
                    {user.email.split("@")[0]}
                  </p>
                </figcaption>
              </figure>
              <span className="text-sm text-gray-500">
                {isUserOnline(user._id) ? "🟢" : "🔴"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {location.pathname == "/chats" && (
        <div className="hidden md:flex items-center h-screen justify-center">
          <h1 className="text-xl">Select user from chats...</h1>
        </div>
      )}
    </div>
  )
};

export default React.memo(ChatSidebar);