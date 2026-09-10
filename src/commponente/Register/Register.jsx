
import { useState } from "react";
import Background from "../../assets/all imges/background.jpg";
import { useNavigate, useLocation } from "react-router-dom";

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
      const response = await fetch(
        "http://localhost:5000/Register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        // Jis page se Register par aaye the
        const redirectTo = location.state?.from || "/";

        // Register ke baad Login page
        navigate("/login", {
          state: {
            from: redirectTo,
          },
        });
      }
    } catch (error) {
      console.log(error);
      alert("Backend server connect nahi ho raha");
    }
  };

  return (
    <section
      className="max-w-[1400px] mx-auto bg-no-repeat bg-contain h-170 my-1 bg-cover flex px-70 items-center"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <div className="bg-zinc-900 rounded-2xl w-100">

        <h2 className="text-zinc-100 flex justify-center pt-5 text-2xl">
          Register
        </h2>

        <form
          onSubmit={handleRegister}
          className="px-15 py-4 h-130"
        >
          <h1 className="text-zinc-100 py-2 text-2xl">
            New Customer
          </h1>

          {/* Full Name */}
          <label className="text-zinc-100">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Username */}
          <label className="text-zinc-100">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Email */}
          <label className="text-zinc-100">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Password */}
          <label className="text-zinc-100">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Mobile */}
          <label className="text-zinc-100">
            Mobile No
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
            className="h-[5vh] bg-zinc-100 my-2 px-2 rounded-xl w-70 outline-none"
          />

          <br />

          {/* Submit */}
          <button
            type="submit"
            className="text-zinc-100 my-2 bg-blue-500 w-70 h-[40px] cursor-pointer hover:scale-105 rounded-xl outline-none"
          >
            Submit
          </button>

        </form>
      </div>
    </section>
  );
};

export default Register;
