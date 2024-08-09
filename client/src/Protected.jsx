import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Protected = ({ Component }) => {
    const navigate = useNavigate()

    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    useEffect(() => {
        if(!token || !user){
            navigate('/')
        }
    }, [navigate])
    return (
        <>
        {
            user && <Component/>
        }
        </>
    )
}

export default Protected
