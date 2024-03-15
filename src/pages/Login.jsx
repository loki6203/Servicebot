import React, { useState } from "react";
import { LockOutlined, LoginOutlined, MailOutline, PasswordOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styles/login.scss'
function Login() {
  const [name, setname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const Spinner = () => (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000 }}>
      <div style={{ width: "30px", height: "30px", borderRadius: "50%", border: "4px solid #ccc", borderTop: "4px solid rgb(255 122 0)", animation: "spin 1s linear infinite" }}></div>
    </div>
  );

  const handleLogin = async () => {
    setFormSubmitted(true);
    if (name === "admin" && password === "password") {
      setLoading(true);
      // Simulating a delay to mimic API request
      setTimeout(() => {
        const randomToken = Math.random().toString(36).substr(2);
        localStorage.setItem("Token", randomToken);
        setLoading(false);
        navigate("/form");
      }, 1000); // Simulated delay of 1 second
    } else {
      toast.error("Invalid username or password.");
    }
  };

  return (
    <>
      <div className="app-page-login">
        <div className="app-page-login__wrapper">
          <div className="app-page-login__card">
            <h2>Login</h2>
            <div className="app-page-login__formgroup">
              <div className="app-page-login__field">
                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                  <MailOutline sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                  <TextField
                    type="name"
                    fullWidth
                    required
                    id="input-name"
                    label="Username"
                    placeholder="Enter your name"
                    variant="standard"
                    onChange={(e) => setname(e.target.value)}
                    error={formSubmitted && !name}
                  />
                </Box>
              </div>
              <div className="app-page-login__field">
                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                  <LockOutlined sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                  <TextField
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    required
                    id="input-password"
                    label="Password"
                    placeholder="Enter your password"
                    variant="standard"
                    onChange={(e) => setPassword(e.target.value)}
                    error={formSubmitted && !password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </div>
              
              <div className="app-page-login__button">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <Spinner /> : <LoginOutlined />}Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </>
  );
}

export default Login;
