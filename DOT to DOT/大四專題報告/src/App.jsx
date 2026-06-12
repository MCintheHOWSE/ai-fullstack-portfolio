import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNavBar from './components/BottomNavBar'
import Home from './pages/Home'
import Search from './pages/Search'
import PostRide from './pages/PostRide'
import Logistics from './pages/Logistics'
import Delivery from './pages/Delivery'
import PostErrand from './pages/PostErrand'
import Login from './pages/Login'
import Register from './pages/Register'
import EditRide from './pages/EditRide'
import EditMover from './pages/EditMover'
import EditErrand from './pages/EditErrand'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import PostRequest from './pages/PostRequest'
import FindPassengers from './pages/FindPassengers'
import FoodDelivery from './pages/FoodDelivery'
import CreateGroupBuy from './pages/CreateGroupBuy'
import GroupBuyDetail from './pages/GroupBuyDetail'
import MakeWish from './pages/MakeWish'
import MyFoodOrders from './pages/MyFoodOrders'
import ChatList from './pages/ChatList' // New Import

// Logistics System Pages
import CreateDelivery from './pages/CreateDelivery'
import LogisticsLobby from './pages/LogisticsLobby'
import DeliveryDetail from './pages/DeliveryDetail'
import MyDeliveries from './pages/MyDeliveries'
import NotificationListener from './components/NotificationListener'
import RideDetail from './pages/RideDetail'

import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin' && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <NotificationListener />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post" element={<PostRide />} />
          <Route path="/post-request" element={<PostRequest />} />
          <Route path="/find-passengers" element={<FindPassengers />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/logistics/create" element={<CreateDelivery />} />
          <Route path="/logistics/lobby" element={<LogisticsLobby />} />
          <Route path="/logistics/my-deliveries" element={<MyDeliveries />} />
          <Route path="/logistics/:id" element={<DeliveryDetail />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/food-delivery" element={<FoodDelivery />} />
          <Route path="/create-group-buy" element={<CreateGroupBuy />} />
          <Route path="/group-buy/:id" element={<GroupBuyDetail />} />
          <Route path="/make-wish" element={<MakeWish />} />
          <Route path="/my-food-orders" element={<MyFoodOrders />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/ride/:id" element={<RideDetail />} />
          <Route path="/post-errand" element={<PostErrand />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit-ride/:id" element={<EditRide />} />
          <Route path="/edit-mover/:id" element={<EditMover />} />
          <Route path="/edit-errand/:id" element={<EditErrand />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard currentUser={JSON.parse(localStorage.getItem('user'))} />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNavBar />
    </Router>
  )
}

export default App
