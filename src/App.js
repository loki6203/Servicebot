import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login";
import Form from "./pages/Form";
import InteractionList from "./pages/InteractionList";
import Success from "./pages/Success";



function App() {
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<Login/>}/>
     <Route path="/form" element={<Form/>}/>
     <Route path='/intlist' element={<InteractionList/>}/>
     <Route path="/success" element={<Success/>}/>
    </Routes>
  
    </>
  );
}

export default App;
