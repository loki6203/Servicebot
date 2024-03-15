import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Form() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isFormMounted, setIsFormMounted] = useState(false); // New state variable
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsFormMounted(true); // Set form mounted when component mounts
    fetchTemplates();

    return () => {
      setIsFormMounted(false); // Set form unmounted when component unmounts
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/template");
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
    const selectedTemplate = templates.find((template) => template.name === selectedTemplateName);
    setSelectedTemplate(selectedTemplateName);
    setTemplateMessage(selectedTemplate?.message || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = fileInputRef.current.files[0];
    const fileInputValue = fileInputRef.current.value;

    const formData = {
      passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
      template: selectedTemplate,
      username: name,
      phone: number,
    };

    try {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(sheet);

          excelData.forEach((row) => {
            const rowFormData = {
              ...formData,
              username: row.username,
              phone: row.phone,
            };
            sendFormData(rowFormData);
          });

          setName("");
          setNumber("");
          setSelectedTemplate("");
          setTemplateMessage("");
          if (isFormMounted) {
            document.getElementById("form").reset(); // Reset form if mounted
          }
          toast.success("Messages sent successfully!");
        };
        reader.readAsArrayBuffer(file);
      } else {
        await sendFormData(formData);
        setName("");
        setNumber("");
        setSelectedTemplate("");
        setTemplateMessage("");
        if (isFormMounted) {
          document.getElementById("form").reset(); // Reset form if mounted
        }
        toast.success("Message sent successfully!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error occurred while sending message");
    }
  };

  const sendFormData = async (formData) => {
    try {
      const response = await fetch("https://whatsapp.presentience.in/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  };

  return (
    <div className="login-container">
      <div className="page-card">
        <div className="page-card-head">
          <h2>User Details</h2>
          <Link to='/intlist'>View Interactions</Link>
        </div>
        <form id="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="template">Survey Type</label>
            <select
              className="form-group"
              name="template"
              id="template"
              required
              value={selectedTemplate}
              onChange={handleTemplateChange}
            >
              <option value="">Select</option>
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
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="number">Number</label>
            <input
              type="number"
              name="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div className="orwith">
            <span>OR Upload</span>
          </div>
          <div className="form-group">
            <label htmlFor="fileToUpload">Excel file with Name and Number</label>
            <input
              type="file"
              name="fileToUpload"
              id="fileToUpload"
              ref={fileInputRef}
              key={fileInputKey}
            />
          </div>
          <input className="login-btn" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default Form;
