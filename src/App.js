import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login";
import Form from "./pages/Form";
import InteractionList from "./pages/InteractionList";
import Success from "./pages/Success";
import UsersList from "./pages/UsersList";
import NewForm from "./pages/NewForm"



function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/form" element={<Form />} />
        <Route path="/newform" element={<NewForm />} />

        <Route path='/intlist' element={<InteractionList />} />
        <Route path='/userlist' element={<UsersList />} />
        <Route path="/success" element={<Success />} />
      </Routes>

    </>
  );
}

export default App;
