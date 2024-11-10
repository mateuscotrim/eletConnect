import React from 'react';
import Header from '../../../components/header';

export default function Ajuda() {

    return (
        <>
            <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <main id='main-section'>
                <section id="section">
                    <div className="box">
                        <div className="title d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-2 text-black">
                                <i className="bi bi-info-square fs-3"></i>
                                <h3 className="m-0 fs-4">Central de ajuda</h3>
                            </span>
                        </div>
                        <div className="p-4">

                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
