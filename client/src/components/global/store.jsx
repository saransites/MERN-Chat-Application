import { configureStore } from '@reduxjs/toolkit'
import  Slicedata  from './slice'

const store=configureStore({
    reducer:{
        data:Slicedata
    }
})

export default store