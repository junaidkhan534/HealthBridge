import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicRoute from './components/PublicRoute'; 
import HomePage from './pages/HomePage';
import AllDoctorsPage from './pages/AllDoctorsPage';
import HBookingPage from './pages/HBookingPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import AboutPage from './pages/AboutPage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyProfilePage from './pages/patient/MyProfilePage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import HelpPage from './pages/patient/HelpPage';
import FindDoctor from './pages/patient/FindDoctor';
import BookingPage from './pages/patient/BookingPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import MyPatientsPage from './pages/doctor/MyPatientsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import AvailabilityPage from './pages/doctor/AvailabilityPage';
import DoctorLogin from './pages/DoctorLogin';
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddDoctorPage from './pages/admin/AddDoctorPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import DoctorManagementPage from './pages/admin/DoctorManagementPage';
import PatientManagementPage from './pages/admin/PatientManagementPage';
import PaymentPage from './pages/admin/PaymentPage';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute> } />
        <Route path="/allDoctors" element={<PublicRoute><AllDoctorsPage /></PublicRoute>} />
        <Route path="/doctor/book-appointment/:doctorId" element={<PublicRoute><HBookingPage/></PublicRoute>} />
        <Route path="/findDoctor" element={ <PublicRoute><SymptomCheckerPage /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute> } />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verifyOtp" element={<PublicRoute><VerifyOtp /></PublicRoute> } />
        <Route path="/patient"  element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} />
        <Route path="/find-doctor" element={<ProtectedRoute><FindDoctor /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
        <Route path="/book-appointment/:doctorId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/portal/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}/>
        <Route path="/doctor/patients" element={<ProtectedRoute><MyPatientsPage /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute><DoctorProfilePage /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />        
        <Route path="/doctor/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
        <Route path="/doctor/login" element={<PublicRoute><DoctorLogin /></PublicRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute> } />
        <Route path="/admin/add-doctor" element={<AdminRoute><AddDoctorPage /></AdminRoute> } />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute> } />
        <Route path="/admin/appointments" element={<AdminRoute><AppointmentsPage /></AdminRoute> } />
        <Route path="/admin/doctors" element={<AdminRoute><DoctorManagementPage /></AdminRoute> } />
        <Route path="/admin/patients" element={ <AdminRoute><PatientManagementPage /></AdminRoute> } />
        <Route path="/admin/payment" element={<AdminRoute> <PaymentPage /></AdminRoute> } />

      </Routes>
    </>
  );
}

export default App;