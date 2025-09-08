import React from 'react';
import { Layout as AntLayout, Menu, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/features/userSlice';
import '../styles/Layout.css';

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // --- Menus Definition ---
    const patientMenu = [
        { name: 'Home', path: '/' },
        { name: 'My Appointments', path: '/appointments' },
    ];

    const doctorMenu = [
        { name: 'Dashboard', path: '/doctor/appointments' },
        { name: 'Profile', path: '/doctor/profile' }, // We can build this page later
    ];

    const adminMenu = [
        { name: 'Doctors', path: '/admin/doctors' },
        { name: 'Patients', path: '/admin/users' },
    ];

    // Determine which menu to render based on user role
    const baseMenu = user?.isAdmin
        ? adminMenu
        : user?.role === 'doctor'
        ? doctorMenu
        : patientMenu;

    // --- Transform menus for the `items` prop ---
    const menuItems = baseMenu.map(item => ({
        key: item.path,
        label: <Link to={item.path}>{item.name}</Link>
    }));

    // Add conditional items (Login/Logout)
    const finalMenuItems = user
        ? [
              ...menuItems,
              {
                  key: 'logout',
                  label: 'Logout',
                  onClick: handleLogout,
              },
          ]
        : [
              { key: '/login', label: <Link to="/login">Patient Login</Link> },
              { key: '/doctor/login', label: <Link to="/doctor/login">Doctor Login</Link> },
              { key: '/admin/login', label: <Link to="/admin/login">Admin Login</Link> },
          ];

    return (
        <AntLayout>
            <Header className="header">
                <div className="logo">
                    <Link to="/">Appointy</Link>
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={finalMenuItems} // Use the new `items` prop here
                    style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end' }}
                />
            </Header>
            <Content className="content">
                <div className="site-layout-content">{children}</div>
            </Content>
            <Footer className="footer">
                Appointy ©{new Date().getFullYear()}
            </Footer>
        </AntLayout>
    );
};

export default Layout;