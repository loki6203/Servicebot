import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextField from "@mui/material/TextField";
import TopNavBar from "./TopNav";
import Spinner from "./Spinner";
import { Autocomplete } from "@mui/material";
import * as XLSX from "xlsx";

function NewForm() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      let templatesAPI;
      const role = localStorage.getItem("role");
      const Token = localStorage.getItem("Token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      };

      if (role === "admin") {
        templatesAPI = "https://whatsapp.presentience.in/api/template";
      } else if (role === "user") {
        templatesAPI = "https://whatsapp.presentience.in/api/user/templates";
      } else {
        console.error("Invalid role:", role);
        return;
      }

      const response = await fetch(templatesAPI, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      } else {
        console.error("Failed to fetch templates data");
      }
    } catch (error) {
      console.error("Error fetching templates data:", error);
    }
  };

  const handleTemplateChange = (newValue) => {
    const selectedTemplate = templates.find(template => template.name === newValue);
    setSelectedTemplate(newValue);
    setTemplateMessage(selectedTemplate?.message || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const file = fileInputRef.current?.files[0];

    if (!selectedTemplate || !file) {
      toast.error("Please select a template and upload a file");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("template", selectedTemplate);
    formData.append("file", file);

    try {
      await sendFormData(formData);
      toast.success("Form submitted successfully.");
      navigate("/success");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFormData = async (formData) => {
    try {
      const response = await fetch(
        "https://whatsapp.presentience.in/api/bulk-send-messages",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="login-container">
        <div className="page-card">
          <div className="page-card-head">
            <h2>User Details</h2>
            <Link to="/intlist">View Interactions</Link>
          </div>
          <form
            className="login_main_form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="form-group servey_type">
              <Autocomplete
                value={selectedTemplate}
                onChange={(event, newValue) => handleTemplateChange(newValue)}
                options={templates.map((template) => template.name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Survey Type"
                    variant="outlined"
                    required
                  />
                )}
              />
            </div>
            {templateMessage && (
              <div className="form-group">
                <p>{templateMessage}</p>
              </div>
            )}
            <div className="form-group excel_file">
              <label htmlFor="fileToUpload">
                Excel file with Name and Number
              </label>
              <input
                type="file"
                name="fileToUpload"
                id="fileToUpload"
                ref={fileInputRef}
                key={fileInputKey}
              />
            </div>
            <input
              className="login-btn"
              type="submit"
              value={isLoading ? "Submitting..." : "Submit"}
              disabled={isLoading}
            />
            {isLoading && <Spinner />}
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default NewForm;
