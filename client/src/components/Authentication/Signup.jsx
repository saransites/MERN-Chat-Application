import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UseApi } from "../global/slice";
import { Link, useNavigate } from "react-router-dom";
import { Popup } from "../../utils/Popup";
const bg =
  "https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80";
const Signup = () => {
  const api = UseApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.confirmPassword !== form.password) {
      Popup("error", "confirm password and password does not match");
      return;
    }
    try {
      await api.post("/auth/signup", form);
      navigate('/')
      Popup("success", "Account Created Successfully...");
    } catch (err) {
      if (err.response.status == 401) {
        Popup("error", "User already exists");
        return;
      }
      if (err.response.status == 403) {
        Popup("error", err.response.data.message);
        return;
      }
      Popup("error", "something went wrong");
    }
  };
  return (
    <div className="m-2 border grid md:grid-cols-2 md:justify-center h-[100dvh]">
      <picture className="hidden md:block">
        <img src={bg} alt="image" className="w-full h-full object-cover" />
      </picture>
      <form onSubmit={handleSubmit} className="self-center p-4">
        <h1 className="text-2xl font-semibold mb-8 text-center">
          Create Your Account
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
        <div>
          <label className="font-medium" htmlFor="cpassword">
            Confirm Password
          </label>
          <input
            id="cpassword"
            type="password"
            className="block w-full my-2 p-2 rounded bg-slate-200 border-none text-[#262626]"
            value={form.confirmPassword}
            name="confirmPassword"
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="block mx-auto bg-blue-600 p-2 px-6 rounded"
        >
          Create Account
        </button>
        <p className="text-center my-4">
          Already have an account?{" "}
          <Link className="underline text-sky-400" to="/">
            Login
          </Link>{" "}
        </p>
      </form>
    </div>
  );
};

export default Signup;
