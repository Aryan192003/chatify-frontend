import { Calculate } from '@mui/icons-material'
import { Drawer, Grid, Skeleton } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sampleChats } from '../../constants/sampleData'
import Title from '../shared/Title'
import ChatList from '../specific/ChatList'
import Profile from '../specific/Profile'
import Header from './Header'
import { useMyChatsQuery } from '../../redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsDeleteMenu, setIsMobileMenuFriend, setSelectedDeleteChat } from '../../redux/reducer/misc'
import { useErrors, useSocketEvents } from '../../hooks/hook'
import { incrementNotifications, setNewMessagesAlert } from '../../redux/reducer/chat'
import { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../../constants/events'
import { getSocket } from '../../socket'
import { getOrSaveFromStorage } from '../../lib/features'
import DeleteChatMenu from '../dialogs/DeleteChatMenu'

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const dispatch = useDispatch();
    const chatId = params.chatId;
    const socket = getSocket();
    const navigate = useNavigate();
    const deleteMenuAnchor = useRef(null)
    const {isMobileMenuFriend} = useSelector((state) => state.misc)
    const {user} = useSelector((state) => state.auth)
    const {newMessagesAlert} = useSelector((state)=>state.chat)

    const [onlineUsers, setOnlineUsers] = useState([]);
   
    
    const {isLoading, data, isError, error, refetch} = useMyChatsQuery()



    useErrors([{ isError, error }]);

    useEffect(()=>{
      getOrSaveFromStorage({key: NEW_MESSAGE_ALERT, value:newMessagesAlert})
    },[newMessagesAlert])

    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget
      
    }
    
    const handleMobileClose = () => dispatch(setIsMobileMenuFriend(false))
    
    const newMessageAlertHandler = useCallback((data)=>{
      if (data.chatId === chatId) return;
      dispatch(setNewMessagesAlert(data));
    }, [chatId]);

    const newRequestHandler = useCallback(()=>{
      dispatch(incrementNotifications())
    },[dispatch])

    const refetchHandler = useCallback(()=>{
      refetch()
      navigate("/")
    },[dispatch,navigate])

    const onlineUsersListners = useCallback((data)=>{
      
      setOnlineUsers(data);
    },[])

    const eventHandlers = {[NEW_MESSAGE_ALERT]: newMessageAlertHandler, [NEW_REQUEST]: newRequestHandler, [REFETCH_CHATS]: refetchHandler, [ONLINE_USERS]:onlineUsersListners}

    useSocketEvents(socket, eventHandlers);
    
    return (
        <>
            <Title />
            < Header/>
            <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor}/>
            {isLoading ? (<Skeleton/>): (
              <Drawer open={isMobileMenuFriend} onClose={handleMobileClose} >
                <ChatList w="70vw" chats={data?.chats} chatId={chatId} handleDeleteChat={handleDeleteChat} newMessagesAlert={newMessagesAlert} onlineUsers={onlineUsers} />
              </Drawer>
            )}
            <Grid container height={ "calc(100vh - 4rem)"}>
               <Grid item sm={4} md={3} sx={{ display: { xs: "none", sm: "block"}}} height={"100%"}> 
                {
                  isLoading ?(<Skeleton/>):(
                    <ChatList chats={data?.chats} chatId={chatId}  handleDeleteChat={handleDeleteChat} newMessagesAlert={newMessagesAlert} onlineUsers={onlineUsers} />
                  )
                }
               </Grid>
               <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}> <WrappedComponent {...props} chatId={chatId} user={user}/></Grid>
               <Grid item md={4} lg={3} height={"100%"} sx={{ display: { xs: "none", md: "block" }, padding: "2rem", bgcolor: "rgba(0,0,0,0.85)"}} > <Profile user={user}/> </Grid>
            </Grid>
            
            
        </>
    )
  }
    
  
}

export default AppLayout
