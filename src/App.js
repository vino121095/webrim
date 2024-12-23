import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/Auth/Login'
import Signup from './Components/Auth/Signup';
import AdminSignup from './Components/Auth/AdminSignup';
import UserMainPage from './Components/User/UserMainPage';
import FeedViews from './Components/User/FeedViews';
import ProfileInfo from './Components/User/ProfileInfo';
import OrderHistory from './Components/User/OrderHistory';
import AdminDashboard from './Components/AdminPanel/AdminDashboard';
import DistributorProductView from './Components/User/DistributorProductView';
import Cart from './Components/User/Cart';
import StoreDetails from './Components/User/StoreDetails';
import PaymentSuccess from './Components/User/PaymentSuccess';
import LoginEmail from './Components/Auth/LoginEmail';
import OtpVerification from './Components/Auth/OtpVerification';

function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
        <Route path='/Auth/Login' element={<Login/>} />
        <Route path='/Auth/Signup' element={<Signup/>} />
        <Route path='/Auth/AdminSignup' element={<AdminSignup/>} />
         <Route path='/' element={<UserMainPage/>} />
         <Route path='User/FeedViews' element={<FeedViews/>} />
         <Route path='/User/Cart' element={<Cart/>} />
         <Route path='/User/StoreDetails' element={<StoreDetails/>} />
         <Route path='/User/ProfileInfo' element={<ProfileInfo/>} />
         <Route path='/User/PaymentSuccess' element={<PaymentSuccess/>} />
         <Route path='/User/OrderHistory' element={<OrderHistory/>} />
         <Route path='/AdminDashboard/*' element={<AdminDashboard/>} />
         <Route path='/User/DistributorProductView/:id' element={<DistributorProductView/>} />
         <Route path='/Auth/LoginEmail' element={<LoginEmail/>} />
          <Route path='/Auth/OtpVerification' element={<OtpVerification/>} />
       </Routes>
     </BrowserRouter>
    </>
  );
}

export default App;
