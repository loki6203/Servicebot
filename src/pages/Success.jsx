import React from 'react'
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const Success = () => {
    const navigate=useNavigate()
    const handleLogout = () => {
   
        localStorage.clear();
        navigate("/");
      };
  return (
    <div class="login-container">
          
     
       
    <div class="page-card">
  <h4>Record created successfully</h4>
  <div class="actions">
      <div class="">
      <Link to="/form">Add New User</Link>
      </div>
      <div class="">
      <a className="danger" onClick={handleLogout}>
                Logout
              </a>
      </div>    
  </div>
  
</div>
</div>
  )
}

export default Success