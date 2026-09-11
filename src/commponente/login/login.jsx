
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
      className="min-h-screen max-w-350 mx-auto bg-no-repeat bg-cover bg-center flex items-center justify-center px-3 py-4 sm:px-5"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >

      <div className="w-full max-w-sm rounded-2xl bg-zinc-900">

        <div>
          <h2 className="text-zinc-100 flex justify-center pt-3 text-xl">
            Your Logo
          </h2>
        </div>

        <form
          onSubmit={handleLogin}
          className="px-4 py-3 sm:px-6 sm:py-4"
        >

          <h1 className="text-zinc-100 py-1 text-xl">
            Login
          </h1>

          {/* Email */}

          <label className="block text-sm text-zinc-100">
            Email
          </label>

          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Email"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          {/* Password */}

          <label className="block text-sm text-zinc-100">
            Password
          </label>

          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Password"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          <Link to="">
            <p className="my-2 text-zinc-100">
              Forget Password
            </p>
          </Link>

          <button
            type="submit"
            className="h-10 w-full text-sm text-zinc-100 my-1 bg-blue-500 cursor-pointer hover:scale-105 rounded-xl outline-none"
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

