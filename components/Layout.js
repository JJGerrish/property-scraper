import React from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Layout = ({children}) => (
    <div>
        <Head></Head>
        <Navbar></Navbar>
        <div>
            {children}
        </div>
        <Footer></Footer>
    </div>
);

export default Layout;