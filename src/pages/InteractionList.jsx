import React, { useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
Chart.register(...registerables); 

const InteractionList = () => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageCounts, setMessageCounts] = useState({});
  const [messageStatusData, setMessageStatusData] = useState({ datasets: [] });
const [buttonClicksData, setButtonClicksData] = useState({ datasets: [] });
const [templateMessage, setTemplateMessage] = useState("");
console.log(templateMessage)
const scaleOptions = {
    y: {
      type: 'linear',
      ticks: {
        beginAtZero: true,
      },
    },
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        "https://whatsapp.presentience.in/api/template"
      );
      if (response.ok) {
        const data = await response.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setIsLoading(false); // Stop the loading spinner after fetching templates
        }
      } else {
        console.error("Failed to fetch templates data");
      }
    } catch (error) {
      console.error("Error fetching templates data:", error);
    }
  };

  const handleTemplateChange = async (e) => {
    const selectedTemplateName = e.target.value;
    setSelectedTemplate(selectedTemplateName);
    const selectedTemplate = templates.find((template) => template.name === selectedTemplateName);
    setTemplateMessage(selectedTemplate?.message || "");
    setIsLoading(true); // Start the loading spinner when survey type is selected
    await fetchData(selectedTemplateName);
    await fetchMessageCounts(selectedTemplateName);
  };

  const fetchData = async (selectedTemplateName) => {
    try {
      const formData = {
        passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
        template: selectedTemplateName,
      };
  
      const response = await fetch(
        "https://whatsapp.presentience.in/api/view-messages",
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.ok) {
        const responseData = await response.json();
        setApiData(responseData.messages);
      } else {
        console.error("Failed to fetch interaction data");
      }
    } catch (error) {
      console.error('Error fetching interaction data:', error);
    } finally {
      setIsLoading(false); // Stop the loading spinner after fetching data
    }
  };

  const fetchMessageCounts = async (selectedTemplateName) => {
    try {
      const formData = {
        passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
        template: selectedTemplateName,
      };

      const response = await fetch(
        "https://whatsapp.presentience.in/api/messages/counts",
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setMessageCounts(responseData.messageCounts);
        prepareChartData(responseData.messageCounts);
      } else {
        console.error("Failed to fetch message counts data");
      }
    } catch (error) {
      console.error('Error fetching message counts data:', error);
    }
  };

  const prepareChartData = (messageCounts) => {
    const messageStatusDataColors = ['rgba(75,192,192,1)', 'rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'];

    const messageStatusData = { 
        labels: ['Accepted', 'Sent', 'Delivered', 'Read'],
        datasets: [
          {
            label: 'Message Status',
            backgroundColor: messageStatusDataColors,
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: [
              messageCounts.accepted || 0,
              messageCounts.sent || 0,
              messageCounts.delivered || 0,
              messageCounts.read || 0,
            ],
          },
        ],
      }
      
    setMessageStatusData(messageStatusData);

    const buttonClicksDataColors = ['rgba(255,99,132,0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75,192,192,0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)'];

    const buttonClicksData = {
        labels: Object.keys(messageCounts.buttons || []),
        datasets: [
          {
            label: 'Survey Replies',
            backgroundColor: buttonClicksDataColors,
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.8)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: Object.values(messageCounts.buttons || []),
          },
        ],
      }
      
    setButtonClicksData(buttonClicksData);
};

  const handleLogout = () => {
    // Perform logout actions here, such as clearing user session
    // For now, let's just redirect to the logout page
    localStorage.clear();
    navigate('/');
  };
  
  const Spinner = () => (
    <div className="spinner">
      <div className="spinner-inner"></div>
    </div>
  );

  const columns = [
    {
      accessorKey: 'username',
      header: 'Username',
      Cell: ({ row }) => (
        <span className="custom-table-cell-text">
          {row.original.username.value} 
        </span>
      ),
    },
    
    {
      accessorKey: 'phone',
      header: 'Phone',
      Cell: ({ renderedCellValue }) => <span className="custom-table-cell-text">{renderedCellValue}</span>,
    },
    {
        accessorKey: 'message',
        header: 'Reply',
        Cell: ({ renderedCellValue }) => (
          <span className="custom-table-cell-text">
            {renderedCellValue ? renderedCellValue : '--'}
          </span>
        ),
        },      
   
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ renderedCellValue }) => <span className="custom-table-cell-text">{renderedCellValue}</span>,
    },
    {
      accessorKey: 'template',
      header: 'Template',
      Cell: ({ renderedCellValue }) => <span className="custom-table-cell-text">{renderedCellValue}</span>,
    },
    {
      accessorKey: 'statusupdate',
      header: 'Status Update',
      Cell: ({ renderedCellValue }) => {
        // Parse the date string
        const date = new Date(renderedCellValue);
        // Format the date as desired (e.g., YYYY-MM-DD HH:MM:SS)
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        // Render the formatted date
        return <span className="custom-table-cell-text">{formattedDate}</span>;
      },
    },
  ];

  return (
    <>
      <div className="jumbotron text-center">
        <h1 style={{ fontSize: '40px', fontWeight: 600, margin: '0 0 20px 0' }}>List of user interactions</h1>
        <div className="actions">
          <div className="">
            <Link to='/form'>New User</Link>
          </div>
          <div className="">
            <a className="danger" onClick={handleLogout}>Logout</a>
          </div>    
        </div>
      </div>
      <div className="charts-flex">
      <div className="agents-list">
        <Typography variant="h6" component="h4" gutterBottom>
          Survey type:
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
        </Typography>
        {templateMessage && (
            <div className="form-group1">
              <p>{templateMessage}</p>
            </div>
          )}
      </div>
      <div className="charts-container">
        {messageStatusData.datasets && messageStatusData.datasets.length > 0 && (
          <div className="chart">
            <h2>Survey Report Messages</h2>
            <Bar data={messageStatusData} options={{ scales: scaleOptions }} />
          </div>
        )}
        {buttonClicksData.datasets && buttonClicksData.datasets.length > 0 && (
          <div className="chart">
            <h2>Survey Report Replies</h2>
            <Bar data={buttonClicksData} options={{ scales: scaleOptions }} />
          </div>
        )}
      </div>
      </div>
      
      <div className="app-table-container">
        <div className="app-table-component">
          {/* Conditionally render the loading spinner or the table */}
          {(isLoading || !selectedTemplate) ? (
    <>
        <Spinner/>
        <h3>Please select survey type</h3>
    </>
) : null}

          {!isLoading && selectedTemplate && <MaterialReactTable columns={columns} data={apiData || []} />}
        </div>
      </div>
     


    </>
  );
};

export default InteractionList;
