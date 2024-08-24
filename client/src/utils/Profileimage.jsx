import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Popup } from "./Popup";
import { UseApi, setUsers } from "../components/global/slice";

const Profileimage = () => {
  const api = UseApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.data);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    if (user?.profile) {
      navigate("/chats");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      Popup("error", "Please select an image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("email", user?.email);
    try {
      const res = await api.post("/profileImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        const updatedUser = { ...res.data?.user };
        dispatch(setUsers(updatedUser));
        navigate("/chats");
        Popup("success", "Profile uploaded successfully");
      }
    } catch (err) {
        console.log(err)
      Popup("error", "Error uploading profile");
    }
  };

  return (
    <section>
      <div className="flex justify-center items-center h-[100dvh] flex-col gap-2">
        {file && (
          <figure className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt="profile"
              className="w-40 h-40 object-cover rounded-full"
            />
            <div onClick={()=>setFile(null)} className="absolute top-0 right-0 bg-red-500 p-2 px-4 rounded-full cursor-pointer">x</div>
          </figure>
        )}
        <label
          htmlFor="profile-image"
          className="border border-pink-600 p-2 px-6 rounded cursor-pointer"
        >
          Choose from file
          <input
            type="file"
            onChange={handleChange}
            id="profile-image"
            hidden
          />
        </label>
        <button
          onClick={handleSubmit}
          className="p-2 px-6 rounded bg-blue-500 active:scale-90 transition duration-500"
        >
          Upload
        </button>
      </div>
    </section>
  );
};

export default Profileimage;
