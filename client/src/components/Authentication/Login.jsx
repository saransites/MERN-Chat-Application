import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers, setToken, setUsers, UseApi } from "../global/slice";
import { Link, useNavigate } from "react-router-dom";
import { Popup } from "../../utils/Popup";
const bg =
  "https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80";
const Login = () => {
  const api = UseApi();
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      const user=res.data.user
      const token=res.data.token
      localStorage.setItem('user',JSON.stringify(user))
      localStorage.setItem('token',JSON.stringify(token))
      dispatch(setToken(token))
      dispatch(setUsers(user))
      navigate('/chats')
      Popup('success','Loggedin successfully')
    } catch (err) {
      if (err?.response?.status == 404) {
        Popup("error", err.response?.data?.message);
        return;
      }
      if (err?.response?.status == 403) {
        Popup("error", err.response.data.message);
        return;
      }
      if (err?.response?.status == 401) {
        Popup("error", 'user not found');
        return;
      }
      console.log(err)
      Popup("error", "Try again later...");
    }
  };
  return (
    <div className="m-2 border grid grid-cols-1 md:grid-cols-2 md:justify-center h-[100dvh]">
      <form onSubmit={handleSubmit} className="self-center p-4">
        <h1 className="text-2xl font-semibold mb-8 text-center">
          Login your Account
        </h1>
        <div>
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="block w-full my-2 p-2 rounded bg-slate-200 border-none text-[#262626]"
            value={form.email}
            name="email"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="block w-full my-2 p-2 rounded bg-slate-200 border-none text-[#262626]"
            value={form.password}
            name="password"
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="block mx-auto bg-blue-600 p-2 px-6 rounded hover:px-8 transition-all duration-500"
        >
          Login
        </button>
        <p className="text-center my-4">
          Create a new account?{" "}
          <Link className="underline text-sky-400 hover:no-underline" to="/signup">
            Signup
          </Link>{" "}
        </p>
      </form>
      <picture className="hidden md:block">
        <img src={bg} alt="image" className="w-full h-full object-cover" />
      </picture>
    </div>
  );
};

export default Login;
