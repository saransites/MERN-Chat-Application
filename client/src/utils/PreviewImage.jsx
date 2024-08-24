import React, { useState } from "react";
import { Popup } from "./Popup";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../components/global/slice";
import { UseApi } from "../components/global/slice";

const PreviewImage = ({ file, setFile }) => {
  let { email } = useSelector((state) => state.data.user);
  const dispatch = useDispatch();
  const api = UseApi();
  const handleSubmit = async () => {
    // Create FormData object
    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("email", email);

    try {
      // Post the FormData to the API
      const res = await api.post("/profileImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200) {
        const updatedUser = { ...res.data?.user };
        dispatch(setUsers(updatedUser));
        Popup("success", res?.data?.message);
      }
    } catch (err) {
      console.log(err);
      Popup("error", "Error uploading image");
    }
  };
  return (
    <div className="absolute inset-0 bg-[#262626] w-full h-full flex justify-center items-center">
      <div>
        <img
          src={URL?.createObjectURL(file)}
          alt="profile-image"
          width="400"
          height="400"
        />
        <button onClick={handleSubmit} className="bg-blue-500 p-2 px-6 rounded">
          Upload
        </button>
      </div>
      <div
        onClick={() => setFile(null)}
        className="bg-red-500 p-2 rounded-full px-4 text-black cursor-pointer self-start mt-6 ml-6"
      >
        x
      </div>
    </div>
  );
};

export default PreviewImage;
