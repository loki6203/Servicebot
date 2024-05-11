import React, { useState, useEffect } from "react"
import { MaterialReactTable } from "material-react-table"
import { Link, useNavigate } from "react-router-dom"
import { Autocomplete, Box, Button, Container, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { Chart, registerables } from "chart.js"
import { Refresh as RefreshIcon } from "@mui/icons-material"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import { Bar } from "react-chartjs-2"
import TopNavBar from "./TopNav"
import dayjs from "dayjs"
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(...registerables, ChartDataLabels)

const InteractionList = () => {
  const [apiData, setApiData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isdataLoading, setIsdataLoading] = useState(false)
  const [istableLoading, setIstableLoading] = useState(false)

  const [templates, setTemplates] = useState([])
  const [mandals, setMandals] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [total, setTotal] = useState('')
  const [messageCounts, setMessageCounts] = useState({})
  const [messageStatusData, setMessageStatusData] = useState({ datasets: [] })
  const [buttonClicksData, setButtonClicksData] = useState({ datasets: [] })
  const [chartOptions, setChartOptions] = useState({})
  const [templateMessage, setTemplateMessage] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [isTemplateSelected, setIsTemplateSelected] = useState(false)
  const [triggerRefresh, setTriggerRefresh] = React.useState(0)
  const [boothFilter, setBoothFilter] = useState('')
  const [mandalFilter, setMandalFilter] = useState('')
  console.log(templateMessage)
  const scaleOptions = {
    y: {
      type: "linear",
      ticks: {
        beginAtZero: true,
      },
    },
  }
  const navigate = useNavigate()

  useEffect(() => {
    fetchTemplates()

  }, [])
  const handleChange = (event, newValue) => {
    if (newValue === 'All') {
        setMandalFilter(null);
    } else {
        setMandalFilter(newValue);
    }
};



  const fetchTemplates = async () => {
    try {
      let templatesAPI
      const role = localStorage.getItem('role')
      const Token = localStorage.getItem('Token')
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Token}`,
      }

      if (role === 'admin') {
        templatesAPI = 'https://whatsapp.presentience.in/api/template'
      } else if (role === 'user') {
        templatesAPI = 'https://whatsapp.presentience.in/api/user/templates'
      } else {
        console.error('Invalid role:', role)
        return
      }

      const response = await fetch(templatesAPI, { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates)
          setIsLoading(false)
        }
      } else {
        console.error('Failed to fetch templates data')
      }
    } catch (error) {
      console.error('Error fetching templates data:', error)
    }
  }
  useEffect(() => {
    const fetchMandals = async () => {
      try {
        if (!selectedTemplate || !templates) {
          return
        }

        const selectedTemplateObj = templates.find(template => template.name === selectedTemplate)
        if (!selectedTemplateObj) {
          console.error('Selected template not found')
          return
        }

        const templateId = selectedTemplateObj._id

        const Token = localStorage.getItem('Token')
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        }

        const response = await fetch(`https://whatsapp.presentience.in/api/mandal/${templateId}`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data) {
            console.log(data.mandal)
            setMandals(data?.mandal)
            setIsLoading(false)
          }
        } else {
          console.error('Failed to fetch templates data')
        }
      } catch (error) {
        console.error('Error fetching templates data:', error)
      }
    }

    if (selectedTemplate) {
      fetchMandals()
    }
  }, [selectedTemplate, templates])



  const handleTemplateChange = async (newValue) => {
    setSelectedTemplate(newValue);
    const selectedTemplate = templates.find(template => template.name === newValue);
    setTemplateMessage(selectedTemplate?.message || "");
    setIsLoading(true);
    
    await fetchData(newValue);
    await fetchMessageCounts(newValue);
  };
  const fetchData = async (selectedTemplateName) => {
    setIstableLoading(true);
    try {
      let templatesToFetch = [selectedTemplateName];
  
      if (selectedTemplateName === 'vijayawada_east_survey') {
        templatesToFetch.push('vijayawada_new_survey');
        templatesToFetch.push('vijayawada_gadde1');
        templatesToFetch.push('vijayawada_gadde2');
      } 
      const allResponses = await Promise.all(
        templatesToFetch.map(async (template) => {
          const formData = {
            passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
            template: template,
            fromDate: fromDate ? dayjs(fromDate).toISOString() : null,
            toDate: toDate ? dayjs(toDate).toISOString() : null,
            ...(boothFilter && { booth_no: boothFilter }), 
            ...(mandalFilter && { mandal_name: mandalFilter }), 
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
            return await response.json();
          } else {
            throw new Error("Failed to fetch interaction data");
          }
        })
      );
  
      let mergedMessages = [];
  
      allResponses.forEach((responseData) => {
        const messagesMap = new Map();
  
        responseData.messages.forEach((message) => {
          const phoneKey = message.phone;
  
          if (!messagesMap.has(phoneKey)) {
            messagesMap.set(phoneKey, []);
          }
          
          messagesMap.get(phoneKey).push(message);
        });
  
        const uniqueMessagesArray = Array.from(messagesMap.values()).flatMap(messages => {
          if (messages.some(message => message.username.isverified)) {
            return messages.filter(message => message.username.isverified);
          }
          return messages;
        });
  
        mergedMessages = [...mergedMessages, ...uniqueMessagesArray];
      });
  
      console.log("Merged Messages:", mergedMessages);
  
      if (fromDate && toDate) {
        const filteredMessages = mergedMessages.filter((message) => {
          const statusUpdateTime = new Date(message.createdAt).getTime();
          const fromTime = new Date(fromDate).getTime();
          const toTime = new Date(toDate).getTime();
          return statusUpdateTime >= fromTime && statusUpdateTime <= toTime;
        });
        console.log("Filtered Messages:", filteredMessages);
  
        setApiData(filteredMessages);
      } else {
        console.log("All Messages:", mergedMessages);
        setApiData(mergedMessages);
      }
  
    } catch (error) {
      console.error("Error fetching interaction data:", error);
    } finally {
      setIstableLoading(false);
    }
  }
  

  

  const fetchMessageCounts = async (selectedTemplateName) => {
    try {
      setIsdataLoading(true); 
  
      let templatesToFetch = [selectedTemplateName];
  
      if (selectedTemplateName === 'vijayawada_east_survey') {
        templatesToFetch.push('vijayawada_new_survey');
        templatesToFetch.push('vijayawada_gadde1');
        templatesToFetch.push('vijayawada_gadde2');
      } 
  
      const allResponses = await Promise.all(
        templatesToFetch.map(async (template) => {
          const formData = {
            passcode: "7ab97576-6077-47ac-b9e2-e00548fe226d",
            template: template,
            fromDate: fromDate ? dayjs(fromDate).toISOString() : null,
            toDate: toDate ? dayjs(toDate).toISOString() : null,
            ...(boothFilter && { booth_no: boothFilter }), 
            ...(mandalFilter && { mandal_name: mandalFilter }),
          }
  
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
            return await response.json();
          } else {
            throw new Error(`Failed to fetch message counts data for ${template}`);
          }
        })
      );
  
const combinedCounts = allResponses.reduce((acc, response) => {
  for (const key in response.messageCounts) {
    if (key === 'buttons') {
      acc.buttons = acc.buttons || {};

      for (const buttonName in response.messageCounts.buttons) {
        acc.buttons[buttonName] = (acc.buttons[buttonName] || 0) + response.messageCounts.buttons[buttonName];
      }
    } else {
      acc[key] = (acc[key] || 0) + response.messageCounts[key];
    }
  }
  return acc;
}, {});

  
      setMessageCounts(combinedCounts);
      prepareChartData(combinedCounts);
  
    } catch (error) {
      console.error("Error fetching message counts data:", error);
    } finally {
      setIsdataLoading(false);
    }
  }
  
  
  useEffect(() => {
    if (selectedTemplate) {
      fetchData(selectedTemplate)
      fetchMessageCounts(selectedTemplate)
    }
  }, [fromDate, toDate,boothFilter,mandalFilter])

  const prepareChartData = (messageCounts) => {
    const messageStatusDataColors = [
      "rgba(255,0,0,1)",
      "rgba(255, 206, 86, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 159, 64, 1)",
    ]

    const messageStatusData = {
      labels: ["Failed", "Sent", "Delivered","Read"],
      datasets: [
        {
          label: "Message Status",
          backgroundColor: messageStatusDataColors,
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: [
            messageCounts.failed || 0,
            messageCounts.sent || 0,
            messageCounts.delivered || 0,
            messageCounts.read || 0,
          ],
        },
      ],
    }

    setMessageStatusData(messageStatusData)


    const totalButtonResponses = Object.values(messageCounts.buttons || {}).reduce((acc, currentValue) => acc + currentValue, 0)
    console.log(totalButtonResponses)
    setTotal(totalButtonResponses)
    const labels = Object.keys(messageCounts.buttons || [])
    const data = Object.values(messageCounts.buttons || {})
    const backgroundColors = [
      "rgba(255,99,132,0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75,192,192,0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
      "rgba(255, 99, 132, 0.6)",
    ].slice(0, labels.length)
    const percentages = data.map(count => {
      if (totalButtonResponses > 0) {
        return ((count / totalButtonResponses) * 100).toFixed(2)
      }
      return 0
    })


    const buttonClicksData = {
      labels,
      datasets: [
        {
          backgroundColor: backgroundColors,
          data,

          datalabels: {
            anchor: 'center',
            align: 'center',
            formatter: (value, ctx) => {
              return `${percentages[ctx.dataIndex]}%`
            },
            color: '#444',
          },
        },
      ],
    }

    const chartOptions = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#444',
          anchor: 'end',
          align: 'top',
          formatter: (value, ctx) => {
            if (!isNaN(percentages[ctx.dataIndex]) && percentages[ctx.dataIndex] !== undefined) {
              const labelPercentage = percentages[ctx.dataIndex]
              return `${labelPercentage}%`
            }
            return '' 
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const labelPercentage = percentages[context.dataIndex]
              const count = context.dataset.data[context.dataIndex];
              return `${context.label}: ${count} votes`
            },
          },
        },
      },
    }

    setButtonClicksData(buttonClicksData)
    setChartOptions(chartOptions)
  }
  const handleLogout = () => {

    localStorage.clear()
    navigate("/")
  }

  const Spinner = () => (
    <div className="spinner">
      <div className="spinner-inner"></div>
    </div>
  )
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  })

  const exportCsv = async (rows, exportAll) => {
    const rowData = exportAll ? apiData.results : rows.map(row => {
      const newRow = { ...row.original }
      for (const key in newRow) {
        if (typeof newRow[key] === 'object' && newRow[key] !== null) {
          Object.entries(newRow[key]).forEach(([subKey, value]) => {
            newRow[`${key}_${subKey}`] = value
          })
          delete newRow[key]
        }
      }
      return newRow
    })

    if (rowData.length === 0) {
      console.error('No data to export.')
      return
    }

    const csvConfig = mkConfig({
      fieldSeparator: ',',
      decimalSeparator: '.',
      useKeysAsHeaders: true,
    })

    const csv = generateCsv(csvConfig)(rowData)
    await download(csvConfig)(csv)
  }

  const columns = [
    {
      accessorKey: "username.value",
      header: "Username",
      Cell: ({ row }) => (
        <span className="custom-table-cell-text">
          {row.original.username.value}
        </span>
      ),
    },

    {
      accessorKey: "phone",
      header: "Phone",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">{renderedCellValue}</span>
      ),
    },
    {
      accessorKey: "message",
      header: "Reply",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">
          {renderedCellValue ? renderedCellValue : "--"}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">{renderedCellValue}</span>
      ),
    },
    {
      accessorKey: "booth_no",
      header: "Booth",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">
          {renderedCellValue ? renderedCellValue : "--"}
        </span>
      ),
    },
    {
      accessorKey: "mandal_name",
      header: "Mandal",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">
          {renderedCellValue ? renderedCellValue : "--"}
        </span>
      ),
    },
    {
      accessorKey: "template",
      header: "Template",
      Cell: ({ renderedCellValue }) => (
        <span className="custom-table-cell-text">{renderedCellValue}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
      Cell: ({ renderedCellValue }) => {

        const date = new Date(renderedCellValue)

        const formattedDate = date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

        return <span className="custom-table-cell-text">{formattedDate}</span>
      },
    },
    {
      accessorKey: "statusupdate",
      header: "Status Update",
      Cell: ({ renderedCellValue }) => {
        // Parse the date string
        const date = new Date(renderedCellValue)
        // Use toLocaleString to format the date
        const formattedDate = date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        // Render the formatted date
        return <span className="custom-table-cell-text">{formattedDate}</span>
      },
    }

  ]
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(selectedTemplate)
    await fetchMessageCounts(selectedTemplate)
    setRefreshing(false)
  }
  const mandalsWithAllOption = [{ name: 'All' }, ...mandals];
  console.log(apiData)
  return (
    <>
      <TopNavBar />
      <div className="jumbotron text-center">
        <Container>
          <h1 className="list_user">
            List of user interactions
          </h1>
          <div className="actions">
            <div className="">
              <Link to="/form">New Survey</Link>
            </div>
            <div className="">
              <a className="danger" onClick={handleLogout}>
                Logout
              </a>
            </div>
          </div>
        </Container>
      </div>
      <div className="charts-flex">
  <Container>
    <div className="agents-list">
      <Typography className="survey_type" variant="h6" component="h4" gutterBottom>
        <div className="refresh-flex">
          <Autocomplete
            value={selectedTemplate || ''}
            onChange={(event, newValue) => {
              handleTemplateChange(newValue);
            }}
            options={templates.map((template) => template.name)}
            renderInput={(params) => (
              <TextField
              style={{width:'250px'}}
                {...params}
                label="Select Survey Type"
                variant="outlined"
                required
                fullWidth
              />
            )}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={!selectedTemplate || refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Typography>
      {templateMessage && (
        <div className="form-group1">
          <p>{templateMessage}</p>
        </div>
      )}
    </div>
  </Container>
</div>
      <Container>
        {selectedTemplate && (
          <div className="dates-style">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bolder' }}>From Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileDateTimePicker
                  className="custom-input"
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(newDate) => setFromDate(newDate ? newDate.toISOString() : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconButton onClick={params.onClickToggle} size="large" edge="start">
                              <CalendarTodayIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  inputFormat="YYYY-MM-DDTHH:mm:ss.SSS"
                />
              </LocalizationProvider>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bolder' }}>To Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileDateTimePicker
                  className="custom-input"
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(newDate) => setToDate(newDate ? newDate.toISOString() : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconButton onClick={params.onClickToggle} size="large" edge="start">
                              <CalendarTodayIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  inputFormat="YYYY-MM-DDTHH:mm:ss.SSS"
                />
              </LocalizationProvider>
            </div>


          </div>
        )}
      </Container>
        <Container>
        {selectedTemplate && !isdataLoading && (
            <div className="box" >
              <div className="charts-container">
                {messageStatusData.datasets &&
                  messageStatusData.datasets.length > 0 && (
                    <div className="chart">
                      <h2>Survey Report Messages</h2>
                      <Bar
                        data={messageStatusData}
                        options={{ scales: scaleOptions }}
                      />
                    </div>
                  )}
                {buttonClicksData.datasets &&
                  buttonClicksData.datasets.length > 0 && (
                    <div className="chart">
                      <h2>Total Survey Replies: {total}</h2>
                      <Bar data={buttonClicksData} options={chartOptions} />

                    </div>
                  )}
              </div>

            </div>
          )}
        </Container>
        <div className="app-table-container">
          <Container>
            <div className="app-table-component">
              {(isLoading || istableLoading || !selectedTemplate) && (
        <>
          <Spinner />
          {!selectedTemplate && <h3>Please select survey type</h3>}                </>
            )}

{!isLoading && !istableLoading && selectedTemplate && (
                <MaterialReactTable columns={columns} data={apiData || []}
                  renderTopToolbarCustomActions={({ table }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '16px',
                        padding: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        disabled={table.getPrePaginationRowModel().rows.length === 0}
                        onClick={() => exportCsv(table.getPrePaginationRowModel().rows, false)}
                        startIcon={<FileDownloadIcon />}
                        variant="outlined"
                      >
                        Download (Excel)
                      </Button>
                      <TextField
                        label="Filter by Booth"
                        variant="outlined"
                        value={boothFilter}
                        onChange={(e) => setBoothFilter(e.target.value)}
                      />
              <Autocomplete
      value={mandalFilter}
      onChange={(event, newValue) => handleChange(event, newValue)}
      options={mandalsWithAllOption.map((option) => option.name)}
      renderInput={(params) => (
          <TextField
              {...params}
              label="Filter by Mandal"
              variant="outlined"
              sx={{ width: '200px' }}
          />
      )}
      renderOption={(props, option) => (
        <MenuItem {...props}>
            {option === 'All' ? 'All' : option}
        </MenuItem>
    )}
    
  />


                    </Box>
                  )} />
              )}
            </div>
          </Container>
        </div>

    </>
  )
}

export default InteractionList
