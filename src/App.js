import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login";
import Form from "./pages/Form";
import InteractionList from "./pages/InteractionList";



function App() {
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<Login/>}/>
     <Route path="/form" element={<Form/>}/>
     <Route path='/intlist' element={<InteractionList/>}/>
    </Routes>
  
    </>
  );
}

export default App;
