import React from 'react';
import Login from '../components/login';
import Footer from '../components/Footer';

const LoginPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Login />
            <Footer />
        </div>
    );
};

export default LoginPage;