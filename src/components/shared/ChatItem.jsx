import { Box, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import React, { memo } from 'react'
import { Link } from '../styles/StyledComponents'
import AvatarCard from './AvatarCard'
import {motion} from "framer-motion"

const ChatItem = ({
    avatar = [],
    name,
    _id,
    groupChat = false,
    sameSender,
    isOnline,
    newMessageAlert,
    index=0,
    handleDeleteChat
}) => {
  return (
    <Link 
    sx={{
        padding: "0",
        "&:hover": {
            backgroundColor: "rgba(0,0,0,0.1)"
        }
    }}
    to={`/chat/${_id}`} onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)} >
        <motion.div
        initial={{opacity: 0, y:"-100%"}}
        whileInView={{opacity: 1, y:0}}
        style={{
            padding: "1rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            backgroundColor: sameSender ? "black" : "unset",
            color: sameSender ? "white" : "unset",
            position: "relative",
        }}
        >
            <AvatarCard avatar={avatar}/>
            <Stack>
                <Typography>{name}</Typography>
                {newMessageAlert && (
                    <Typography>{newMessageAlert.count} New Message</Typography>
                )}
            </Stack>
            {
                isOnline && <Box sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "green",
                    position: "absolute",
                    top: "50%",
                    right: "1rem",
                    transform: "translateT(-50%)",
                }} />
            }

        </motion.div>
    </Link>
  )

}

export default memo(ChatItem)
