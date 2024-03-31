import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextField from "@mui/material/TextField";
import TopNavBar from "./TopNav";
import Spinner from "./Spinner";
function Form() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFormMounted(true);

    fetchTemplates();

    return () => {
      setIsFormMounted(false);
    };
  }, []);
  const role = localStorage.getItem("role");
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

  const handleTemplateChange = (e) => {
    const selectedTemplateName = e.target.value;
    const selectedTemplate = templates.find(
      (template) => template.name === selectedTemplateName
    );
    setSelectedTemplate(selectedTemplateName);
    setTemplateMessage(selectedTemplate?.message || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start spinner
  
    const file = fileInputRef.current?.files[0];
    const isSurveyTypeSelected = !!selectedTemplate;
    const isNameNotEmpty = !!name.trim();
    const isNumberNotEmpty = !!number.trim();
    const isFormValid = isSurveyTypeSelected && ((isNameNotEmpty && isNumberNotEmpty) || file);
  
    if (!isFormValid) {
      toast.error("Please enter mobile number & Name or upload file");
      setIsLoading(false); // Immediately stop spinner if form is not valid
      return;
    }
  
    const formData = {
      passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
      template: selectedTemplate,
      username: name,
      phone: number,
    };
  
    try {
      if (file) {
        // If there's a file, process it
        await processFile(file, formData); // Adjusted to await file processing
      } else {
        // Directly send form data if no file is uploaded
        await sendFormData(formData);
        toast.success("Form submitted successfully.");
      }
      // Navigate or reset form on success
      navigate("/success");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop spinner when everything is done
    }
  };
  
  const processFile = (file, formData) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(sheet);
  
          for (const row of excelData) {
            const rowFormData = {
              ...formData,
              username: row.username || row[Object.keys(row)[0]],
              phone: row.phone || row[Object.keys(row)[1]],
            };
            await sendFormData(rowFormData); // Assuming sendFormData can handle individual row data
          }
          resolve(); // Resolve the promise after processing all rows
        } catch (err) {
          reject(err); // Reject the promise on processing error
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };
      reader.readAsArrayBuffer(file);
    });
  };
  
  

  const sendFormData = async (formData) => {
 

    try {
      const response = await fetch(
        "https://whatsapp.presentience.in/api/send-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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

  const resetForm = () => {
    setName("");
    setNumber("");
    setSelectedTemplate("");
    setTemplateMessage("");
    if (isFormMounted) {
      document.getElementById("form").reset();
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
            id="form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="form-group servey_type">
              <select
                className="form-group"
                name="template"
                id="template"
                required
                value={selectedTemplate}
                onChange={handleTemplateChange}
              >
                <option value="">Survey Type</option>
                {templates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            {templateMessage && (
              <div className="form-group">
                <p>{templateMessage}</p>
              </div>
            )}
            <div className="form-group">
              <TextField
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="outlined-basic"
                label="Name"
                variant="outlined"
              />
            </div>
            <div className="form-group">
              <TextField
                type="number"
                name="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                id="outlined-basic"
                label="Number"
                variant="outlined"
              />
            </div>
            <div className="orwith">
              <span>OR Upload</span>
            </div>
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

export default Form;
