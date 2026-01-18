import React from 'react';
import Register from '../components/register';
import Footer from '../components/Footer';

const RegisterPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Register />
            <Footer />
        </div>
    );
};

export default RegisterPage;