import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CircularProgress,
  IconButton,
  Button,
  Modal,
  TextField,
  Tooltip, // Import Tooltip component
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { Add as AddIcon } from "@mui/icons-material";
import TopNavBar from "./TopNav";
import { useNavigate } from "react-router";

const UsersList = () => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: "", password: "" });
  const [templates, setTemplates] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/user/list");
      if (response.ok) {
        const data = await response.json();
        setApiData(data.users);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/template");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        console.error("Failed to fetch template data");
      }
    } catch (error) {
      console.error("Error fetching template data:", error);
    }
  };

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal = (userId) => {
    setSelectedUserId(userId);
    setOpenModal(true);
   
    const user = apiData.find((user) => user._id === userId);
    const assignedTemplates = user.templates || [];
    setSelectedTemplateIds(assignedTemplates);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (templateId) => {
    setSelectedTemplateIds((prevIds) =>
      prevIds.includes(templateId)
        ? prevIds.filter((id) => id !== templateId)
        : [...prevIds, templateId]
    );
  };

  const handleAssignTemplates = async () => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/user/assign/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          templateIds: selectedTemplateIds,
        }),
      });
      if (response.ok) {
        handleCloseModal();
        // Optionally, you can refresh the user list here to reflect the changes
        fetchData();
      } else {
        console.error("Failed to assign templates");
      }
    } catch (error) {
      console.error("Error assigning templates:", error);
    }
  };

  const renderAssignedTemplates = (userTemplates) => {
    const MAX_DISPLAY_TEMPLATES = 3;
    const templateNames = userTemplates.map((templateId) => {
      const template = templates.find((temp) => temp._id === templateId);
      return template ? template.name : templateId;
    });

    if (templateNames.length <= MAX_DISPLAY_TEMPLATES) {
        return (
            <span>
                {templateNames.join(", ")}
            </span>
        );
    } else {
        const displayedTemplates = templateNames.slice(0, MAX_DISPLAY_TEMPLATES).join(", ");
        const remainingCount = templateNames.length - MAX_DISPLAY_TEMPLATES;
        const tooltipContent = templateNames.slice(MAX_DISPLAY_TEMPLATES).join(", ");
        return (
            <div>
                <span>{displayedTemplates}</span>
                <Tooltip title={tooltipContent}>
                <p className="more">+{remainingCount} more</p>

                </Tooltip>
            </div>
        );
    }
};

const handleAddUser = async () => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newUserData, role: "user" }),
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal1();
      } else {
        console.error("Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  
  const columns = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "templates",
      header: "Assigned Templates",
      Cell: ({ row }) => renderAssignedTemplates(row.original.templates || []),
    },
    {
      accessorKey: "_id",
      header: "Actions",
      Cell: ({ row }) => (
        <Button onClick={() => handleOpenModal(row.original._id)} variant="contained" color="primary">
                Assign Templates
        </Button>
      ),
    },
  ];

  return (
    <>
      <TopNavBar />
      <div className="add-user-cont">
        <Container className="butto">
          <h1 className="list_user">List of users</h1>
          <Button onClick={handleOpenModal1} startIcon={<AddIcon />}>
            Add User
          </Button>
        </Container>
      </div>
      <div className="app-table-container">
        <Container>
          {isLoading ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <MaterialReactTable columns={columns} data={apiData} />
          )}
        </Container>
      </div>
      <Modal open={openModal1} onClose={handleCloseModal1}>
        <Container className="modal-container">
          <Typography variant="h6" gutterBottom>
            Add User
          </Typography>
          <TextField
            label="Username"
            name="username"
            value={newUserData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            value={newUserData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddUser}>
            Create User
          </Button>
        </Container>
      </Modal>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Container
          className="modal-container"
          sx={{
            width: 400,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Assign Templates
          </Typography>
          {templates.map((template) => (
            <div key={template._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTemplateIds.includes(template._id)}
                  onChange={() => handleCheckboxChange(template._id)}
                />
                {template.name}
              </label>
            </div>
          ))}
          <Button  className='assign-but'variant="contained" color="primary" onClick={handleAssignTemplates}>
            Assign
          </Button>
        </Container>
      </Modal>
    </>
  );
};

export default UsersList;
