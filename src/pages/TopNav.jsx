import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';

function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const role = localStorage.getItem("role");

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} className="user_text">
          Users
        </Typography>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ display: { xs: 'block', md: 'none' } }}
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="navigation tabs"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          <Tab
            label="User Interactions"
            value="/intlist"
            component={Link}
            to="/intlist"
            className={activeTab === "/intlist" ? "active-tab" : ""}
          />
          {role !== "user" && (
            <Tab
              label="Users"
              value="/userlist"
              component={Link}
              to="/userlist"
              className={activeTab === "/userlist" ? "active-tab" : ""}
            />
          )}
        </Tabs>
        <Button color="inherit" onClick={handleLogout} sx={{ display: { xs: 'none', md: 'block' } }} > 
          Logout
        </Button>
        <Menu 
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          className="menu_btn"
        >
          <MenuItem component={Link} to="/intlist">User Interactions</MenuItem>
          {role !== "user" && (
            <MenuItem component={Link} to="/userlist">Users</MenuItem>
          )}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default TopNavBar;








// import React, { useState } from "react";
// import { AppBar, Toolbar, Typography, Button, Tabs, Tab } from "@mui/material";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// function TopNavBar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [activeTab, setActiveTab] = useState(location.pathname);

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };
//   const role = localStorage.getItem("role");
//   return (
//     <AppBar position="static">
//       <Toolbar>
//         <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//           Users
//         </Typography>
//         <Tabs value={activeTab} onChange={handleTabChange} aria-label="navigation tabs">
        
//           <Tab
//             label="User Interactions"
//             value="/intlist"
//             component={Link}
//             to="/intlist"
//             className={activeTab === "/intlist" ? "active-tab" : ""}
//           />
//            {role !== "user" && (
//   <Tab
//     label="Users"
//     value="/userlist"
//     component={Link}
//     to="/userlist"
//     className={activeTab === "/userlist" ? "active-tab" : ""}
//   />
// )}
//         </Tabs>
//         <Button color="inherit" onClick={handleLogout}>
//           Logout
//         </Button>
//       </Toolbar>
//     </AppBar>
//   );
// }

// export default TopNavBar;