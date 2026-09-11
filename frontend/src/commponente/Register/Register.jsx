
import { useState } from "react";
import Background from "../../assets/all imges/background.jpg";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/Register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: String(formData.phone),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert(data.message || "Registration successful");

      const redirectTo = location.state?.from || "/";
      navigate("/login", {
        state: {
          from: redirectTo,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Backend server connect nahi ho raha");
    }
  };

  return (
    <section
      className="min-h-screen max-w-350 mx-auto bg-no-repeat bg-cover bg-center flex items-center justify-center px-3 py-4 sm:px-5"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900">

        <h2 className="text-zinc-100 flex justify-center pt-3 text-xl">
          Register
        </h2>

        <form
          onSubmit={handleRegister}
          className="px-4 py-2.5 sm:px-6 sm:py-3"
        >
          <h1 className="text-zinc-100 py-1 text-xl">
            New Customer
          </h1>

          {/* Full Name */}
          <label className="block text-sm text-zinc-100">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          {/* Username */}
          <label className="block text-sm text-zinc-100">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          {/* Email */}
          <label className="block text-sm text-zinc-100">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          {/* Mobile */}
          <label className="block text-sm text-zinc-100">
            Mobile No
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
            className="h-10 w-full bg-zinc-100 my-1 px-3 rounded-xl outline-none"
          />

          {/* Submit */}
          <button
            type="submit"
            className="h-10 w-full text-sm text-zinc-100 my-1 bg-blue-500 cursor-pointer hover:scale-105 rounded-xl outline-none"
          >
            Submit
          </button>

        </form>
      </div>
    </section>
  );
};

export default Register;
