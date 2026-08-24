import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {

    if (username === "admin" && password === "1234") {
      alert("Login Successful");
      navigate("/");
    }
    else {
      alert("Invalid Username or Password");
    }

  };

  return (

    <div className="container mt-5">

      <div className="card p-4 shadow mx-auto" style={{width:"400px"}}>

        <h2 className="text-center mb-4">Login</h2>

        <label>Username</label>

        <input
          type="text"
          className="form-control mb-3"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          className="form-control mb-3"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>

  );
}

export default Login;