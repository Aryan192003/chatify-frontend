import { AppBar, Backdrop, Badge, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { lazy, Suspense } from 'react'
import { orange } from '../../constants/color'
import {Menu as MenuIcon, Search as SearchIcon, Add as AddIcon, Group as GroupIcon, Logout as LogoutIcon, Notifications as NotificationsIcon} from "@mui/icons-material"
import {  useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutLoader } from './LayoutLoader'
import Notifications from '../specific/Notifications'
import { server } from '../../constants/config'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { userNotExists } from '../../redux/reducer/auth'
import axios from 'axios'
import { setIsMobileMenuFriend, setIsNewGroup, setIsNotification, setIsSearch } from '../../redux/reducer/misc'
import { resetNotification } from '../../redux/reducer/chat'


const SearchDialogs = lazy(()=> import("../specific/Search")) 
const NotificationDialogs = lazy(()=> import("../specific/Notifications")) 
const NewGroupDialogs = lazy(()=> import("../specific/NewGroup")) 

const Header = () => {

    const navigate = useNavigate();
    const {isSearch, isNotification, isNewGroup} = useSelector(state=>state.misc)
    const {notificationCount} = useSelector((state)=>state.chat)

    
    
    const dispatch = useDispatch();
    const handleMobile = () =>{
        dispatch(setIsMobileMenuFriend(true));
       
    }
    const openSearch = () => {
        dispatch(setIsSearch(true));
    }
    const openNewGroup = () => {
        dispatch(setIsNewGroup(true))
    }
    const openNotification = () =>{
        dispatch(setIsNotification(true))
        dispatch(resetNotification());
    }

    const logoutHandler = async() => {
        try {
          
          const {data} = await axios.get(`${server}/api/v1/user/logout`,{
            withCredentials: true,
          });
          
          dispatch(userNotExists());
          toast.success(data.message)
          
        } catch (error) {
          toast.error(error?.response?.data?.message || "Somthing went wrong")
        }
    }
    const navigateToGroup = () => navigate("/groups")
  return (
    <>
      <Box sx={{ flexGrow: 1 }} height={"4rem"}>
        <AppBar position="static" sx={{
            bgcolor:orange
        }}>

            <Toolbar>
                <Typography variant='h6' sx={{ display: {xs: "none", sm:"block"}}}>Chatify</Typography>
            
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
                <IconButton color="inherit" onClick={handleMobile}><MenuIcon/></IconButton>
            </Box>
            <Box sx={{flexGrow: 1}}></Box>
            <Box>
              <IconBtn
                title={"Search"}
                icon={<SearchIcon />}
                onClick={openSearch}
              />

              <IconBtn
                title={"New Group"}
                icon={<AddIcon />}
                onClick={openNewGroup}
              />

              <IconBtn
                title={"Manage Groups"}
                icon={<GroupIcon />}
                onClick={navigateToGroup}
              />

              <IconBtn
                title={"Notifications"}
                icon={<NotificationsIcon />}
                onClick={openNotification}
                value={notificationCount}
              />

              <IconBtn
                title={"Logout"}
                icon={<LogoutIcon />}
                onClick={logoutHandler}
              />
            </Box>
            </Toolbar>
        </AppBar>
      </Box>

      {
        isSearch && (
            <Suspense fallback={<Backdrop open />} >
              <SearchDialogs/>
            </Suspense>
            
        )
      }
      {
        isNotification && (
            <Suspense fallback={<Backdrop open />} >
              <NotificationDialogs/>
            </Suspense>
            
        )
      }
      {
        isNewGroup && (
            <Suspense fallback={<Backdrop open />} >
              <NewGroupDialogs/>
            </Suspense>
            
        )
      }

    </>
  )
}

const IconBtn = ({ title, icon, onClick, value }) => {
  return (
    <Tooltip title={title}>
      <IconButton color="inherit" size="large" onClick={onClick}>
        {value ? (
          <Badge badgeContent={value} color="error">
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </IconButton>
    </Tooltip>
  );
};

export default Header
