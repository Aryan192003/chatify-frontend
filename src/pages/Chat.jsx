import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material';
import { IconButton, Skeleton } from '@mui/material';

import { Stack } from '@mui/system';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import FileMenu from '../components/dialogs/FileMenu';
import AppLayout from '../components/layout/AppLayout'
import MessageComponent from '../components/shared/MessageComponent';
import { InputBox } from '../components/styles/StyledComponents';
import { grayColor, orange } from '../constants/color';
import { sampleMessage } from '../constants/sampleData';
import { getSocket } from '../socket';
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE } from '../constants/events';
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api';
import { useErrors, useSocketEvents } from '../hooks/hook';
import { useInfiniteScrollTop } from '6pp'
import { useDispatch } from 'react-redux';
import { setIsFileMenu } from '../redux/reducer/misc';
import { removeNewMessagesAlert } from '../redux/reducer/chat';



const Chat = ({chatId, user}) => {
  const containerRef = useRef(null);

  const socket = getSocket();

  const dispatch = useDispatch();

  const chatDetails = useChatDetailsQuery({chatId, skip:!chatId});

  const members = chatDetails?.data?.chat?.members;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const oldMessagesChunk = useGetMessagesQuery({chatId, page})

  const {data: oldMessages, setData: setOldMessages} = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.message
  )

  const errors = [{isError: chatDetails.isError, error:chatDetails.error},
                  {isError: oldMessagesChunk.isError, error:oldMessagesChunk.error}
  ]

  
  const allMessages = [...oldMessages, ...messages];
  

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget)

    
  }

  const submitHandler = (e) => {
    e.preventDefault();

    if(!message.trim()) return;

    socket.emit(NEW_MESSAGE, {chatId, members, message});
    setMessage("");
  };

  useEffect(()=>{

    socket.emit(CHAT_JOINED, {userId: user._id, members})
    dispatch(removeNewMessagesAlert(chatId));
    return ()=>{
      setMessage(""),
      setMessages([]),
      setOldMessages([]),
      setPage(1)
      socket.emit(CHAT_LEAVED, {userId: user._id, members})
    }
    

  },[chatId])

  const newMessagesHandler = useCallback((data) => {
    if(data.chatId!== chatId) return;
    setMessages((prev)=>[...prev, data.message]);
  },[chatId])

  

  const eventHandler = {[NEW_MESSAGE]: newMessagesHandler};



  useSocketEvents(socket, eventHandler);
  useErrors(errors)


  return chatDetails.isLoading ? <Skeleton/> :(
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"bordered-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
       
      {
        allMessages.map((i)=>(
          <MessageComponent key={i._id} message={i} user={user}/>
        ))
      }

      </Stack>
      <form style={{height: "10%"}} onSubmit={submitHandler}>
          <Stack direction={"row"} height={"100%"} padding={"1rem"} alignItems={"center"} position={"relative"}>
            <IconButton sx={{position: "absolute", left: "1.5rem", rotate: "30deg"}} onClick={handleFileOpen} >
              <AttachFileIcon/>
            </IconButton>
            <InputBox placeholder='Type Message Here' value={message} onChange={(e) => setMessage(e.target.value)} />
            <IconButton type="submit"
              sx={{
                bgcolor: orange,
                color: "white",
                marginLeft: "1rem",
                padding: "0.5rem",
                "&:hover": {
                  bgcolor:"error.dark",
                  rotate: "-30deg"
                }
              }}
            >
              <SendIcon/>
            </IconButton>
          </Stack>
      </form>

      <FileMenu anchorE1 ={fileMenuAnchor} chatId={chatId}/>
    </Fragment>
  )
}

export default AppLayout()(Chat)
