import React, { useState } from "react";
import { LockOutlined, LoginOutlined, MailOutline, PasswordOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styles/login.scss'
import TopNavBar from "./TopNav";

function Login() {
  const [username, setUsername] = useState("");
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
    setLoading(true);
  
    try {
      const response = await fetch('https://wasurveyb.presentience.in/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.token) {
        throw new Error(data.message || 'Login failed');
      }
  
      const token = data.token;
      const role=data.user.role
      localStorage.setItem("Token", token);
      localStorage.setItem("role", role);
      setLoading(false);
      navigate("/intlist");
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Invalid username or password.');
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
                    onChange={(e) => setUsername(e.target.value)}
                    error={formSubmitted && !username}
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
