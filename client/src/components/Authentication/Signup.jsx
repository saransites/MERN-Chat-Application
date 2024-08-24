import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UseApi } from "../global/slice";
import { Link, useNavigate } from "react-router-dom";
import { Popup } from "../../utils/Popup";
import bg from '../../assets/vecteezy_landscape-of-the-mountain-view-behind-the-lake-with-many_13860737.svg'
import { Loader } from "../../utils/loader";
const Signup = () => {
  const api = UseApi();
  const navigate = useNavigate();
  const [loading,setLoading]=useState(false)
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
    setLoading(true)
    if (form.confirmPassword !== form.password) {
      Popup("error", "confirm password and password does not match");
      return;
    }
    try {
      const res=await api.post("/auth/signup", form)
      if(res.status === 201){
        navigate('/')
        Popup("success", "Account Created Successfully...");
      }
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
    }finally{
        setLoading(false)
    }
  };
  return (
    <div style={{background:`url(${bg}) no-repeat center/cover`}} className="h-[100dvh] flex justify-center items-center">
      <form onSubmit={handleSubmit} className="shadow-[0_0_.5rem_#262626] hover:shadow-[0_0_.8rem_#262626] transition-shadow duration-300 bg-[rgba(255,255,255,0.2)] p-4 px-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-8 text-[#262626] text-center">
          Create Your Account
        </h1>
        <div>
          <label htmlFor="email" className="font-medium text-[rgba(0,0,0,0.6)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="outline-none block w-full my-2 p-2 rounded bg-[rgba(255,255,255,0.3)] border-none text-[#262626]"
            value={form.email}
            name="email"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="font-medium text-[rgba(0,0,0,0.6)]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="outline-none block w-full my-2 p-2 rounded bg-[rgba(255,255,255,0.3)] border-none text-[#262626]"
            value={form.password}
            name="password"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="font-medium text-[rgba(0,0,0,0.6)]" htmlFor="cpassword">
            Confirm Password
          </label>
          <input
            id="cpassword"
            type="password"
            className="outline-none block w-full my-2 p-2 rounded bg-[rgba(255,255,255,0.3)] border-none text-[#262626]"
            value={form.confirmPassword}
            name="confirmPassword"
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`block mx-auto ${loading && "cursor-not-allowed"} bg-[#336d70] p-2 px-6 rounded`}
        >
          {
            loading ? <Loader/> : <span className="font-bold tracking-wide hover:tracking-widest transition-all duration-500">Signup</span>
          }
        </button>
        <p className="text-center text-[rgba(0,0,0,0.7)] my-4">
          Already have an account?{" "}
          <Link className="underline text-[#382100] hover:tracking-wide hover:no-underline transition-all duration-500" to="/">
            Login
          </Link>{" "}
        </p>
      </form>
    </div>
  );
};

export default Signup;
