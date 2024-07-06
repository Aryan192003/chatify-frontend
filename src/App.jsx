import React, {lazy, Suspense, useEffect} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import ProtectRoute from './components/auth/ProtectRoute';
import { LayoutLoader } from './components/layout/LayoutLoader';
import axios from "axios"
import { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux';
import { userExists, userNotExists } from './redux/reducer/auth';
import { server } from './constants/config';
import { SocketProvider } from './socket';
const Home = lazy(()=> import("./pages/Home"));
const Login = lazy(()=> import("./pages/Login"));
const Chat = lazy(()=> import("./pages/Chat"));
const Groups = lazy(()=> import("./pages/Groups"));
const NotFound = lazy(()=> import("./pages/NotFound"));

let user = true;

const App = () => {

  const {user, loader} = useSelector(state => state.auth)

  const dispatch = useDispatch()

  useEffect(()=>{
    axios.get(`${server}/api/v1/user/profile`, { withCredentials:true})
    .then(({data})=> dispatch(userExists(data.user)))
    .catch((err)=> dispatch(userNotExists()))
  }, [dispatch])
  return loader? <LayoutLoader/>: (
    <BrowserRouter>
    <Suspense fallback={<LayoutLoader/>}>
    <Routes>
      
      <Route path='/' element={ <SocketProvider> <ProtectRoute user={user}> <Home/> </ProtectRoute> </SocketProvider>}/>
      <Route path='/chat/:chatId' element={<SocketProvider> <ProtectRoute user={user}> <Chat/> </ProtectRoute> </SocketProvider>}/>
      <Route path='/groups' element={ <SocketProvider> <ProtectRoute user={user}> <Groups/> </ProtectRoute> </SocketProvider>}/>
      
      <Route path='/login' element={ <ProtectRoute user={!user} redirect="/" > <Login/> </ProtectRoute>}/>

      <Route path='*' element={<NotFound/>} />
    </Routes>
    </Suspense>

    <Toaster position='bottom-center' />
    </BrowserRouter>
  )
}

export default App
