import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers, setToken, setUsers, UseApi } from "../global/slice";
import { Link, useNavigate } from "react-router-dom";
import { Popup } from "../../utils/Popup";
import bg from "../../assets/vecteezy_silhouette-of-nature-landscape-mountains-forest-in_14487928.svg";
import { Loader } from "../../utils/loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const api = UseApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const user = res.data.user;
      const token = res.data.token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", JSON.stringify(token));
      dispatch(setToken(token));
      dispatch(setUsers(user));
      navigate("/profile");
      Popup("success", "Logged in successfully");
    } catch (err) {
      if (err?.response?.status === 404) {
        Popup("error", err.response?.data?.message);
        return;
      }
      if (err?.response?.status === 403) {
        Popup("error", err.response.data.message);
        return;
      }
      if (err?.response?.status === 401) {
        Popup("error", `User not found...Please Signup`);
        return;
      }
      console.log(err);
      Popup("error", "Try again later...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: `url(${bg}) no-repeat center/cover` }}
      className="h-[100vh] flex justify-center items-center"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-[rgba(255,255,255,0.1)] shadow-[0_0_.5rem_#262626] p-4 px-8 rounded-lg hover:shadow-[0_0_.8rem_#262626] transition-shadow duration-200"
      >
        <h1 className="text-2xl font-bold mb-12 mt-4 text-center text-[#262626]">
          Login to your Account
        </h1>
        <div>
          <label htmlFor="email" className="font-medium text-[rgba(0,0,0,0.6)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="block outline-none text-black w-full my-2 p-2 rounded bg-[rgba(0,0,0,0.2)] border-none"
            value={form.email}
            name="email"
            onChange={handleChange}
          />
        </div>
        <div className="relative">
          <label
            className="font-medium text-[rgba(0,0,0,0.6)]"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"} 
            className="block outline-none text-black w-full my-2 p-2 rounded bg-[rgba(0,0,0,0.2)] border-none"
            value={form.password}
            name="password"
            onChange={handleChange}
          />
          {form.password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[55%] text-gray-800 hover:text-gray-600"
            >
              {showPassword ? (
                <FaEye className="text-[1.35rem]" />
              ) : (
                <FaEyeSlash className="text-[1.35rem]" />
              )}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`block mx-auto ${
            loading && "cursor-not-allowed"
          } bg-[#336d70] p-2 px-6 rounded`}
        >
          {loading ? (
            <Loader />
          ) : (
            <span className="font-bold tracking-wide hover:tracking-widest transition-all duration-500">
              Login
            </span>
          )}
        </button>
        <p className="text-center my-4 text-[#262626]">
          Not having an account?{" "}
          <Link
            className="underline text-[#3b2559] hover:no-underline"
            to="/signup"
          >
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
