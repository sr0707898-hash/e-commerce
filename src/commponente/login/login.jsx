
import { useState } from "react";
import Background from "../../assets/all imges/background.jpg";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:5000/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {

        console.log("User Login:", data.user);

        // Login user ko browser me save karo
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Login ke baad home page
        navigate("/");
      }

    } catch (error) {

      console.log(error);

      alert("Backend server connect nahi ho raha");

    }
  };

  return (
    <section
      className="max-w-[1400px] mx-auto bg-no-repeat   h-170 my-1 bg-cover flex px-70 items-center"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >

      <div className="bg-zinc-900 rounded-2xl w-100">

        <div>
          <h2 className="text-zinc-100 flex justify-center pt-5 text-2xl">
            Your Logo
          </h2>
        </div>

        <form
          onSubmit={handleLogin}
          className="px-15 py-4 h-100"
        >

          <h1 className="text-zinc-100 py-2 text-2xl">
            Login
          </h1>

          {/* Email */}

          <label className="text-zinc-100">
            Email
          </label>

          <br />

          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Email"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Password */}

          <label className="text-zinc-100">
            Password
          </label>

          <br />

          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Password"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <Link to="">
            <p className="my-2 text-zinc-100">
              Forget Password
            </p>
          </Link>

          <button
            type="submit"
            className="text-zinc-100 my-2 bg-blue-500 w-70 h-[40px] cursor-pointer hover:scale-105 rounded-xl outline-none"
          >
            Sign In
          </button>

          <Link to="/Register">
            <p className="my-2 text-zinc-100">
              Register For Now
            </p>
          </Link>

        </form>

      </div>

    </section>
  );
};

export default Login;

