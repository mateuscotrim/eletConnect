import React from 'react';
import { Link } from 'react-router-dom';
import img404 from '../../assets/images/web/error 404-cuate.png';

export default function NotFoundPage() {
    return (
        <>
            <img className='position-absolute top-50 start-50 translate-middle' width={500} src={img404} alt='Error 404' />
            <Link to={'/'} className='position-absolute bottom-0 end-0  btn btn-outline-secondary m-5 fs-5'>Retornar</Link>
        </>
    );
};