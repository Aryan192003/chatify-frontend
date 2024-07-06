import { Add as AddIcon, Delete as DeleteIcon, Done as DoneIcon, Edit as EditIcon, KeyboardBackspace, Menu } from '@mui/icons-material'
import { Backdrop, Box, Button, CircularProgress, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import React, { memo, Suspense } from 'react'
import { useEffect } from 'react'
import { lazy } from 'react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AvatarCard from '../components/shared/AvatarCard'
import UserItem from '../components/shared/UserItem'
import { Link } from '../components/styles/StyledComponents'
import { bgGradient, matBlack, orange } from '../constants/color'
import { sampleChats, sampleUsers } from '../constants/sampleData'
import { useAddGroupMemberMutation, useChatDetailsQuery, useDeleteChatMutation, useMyGroupsQuery, useRemoveGroupMemberMutation, useRenameGroupMutation } from '../redux/api/api'
import { useAsyncMutation, useErrors } from '../hooks/hook'
import { LayoutLoader } from '../components/layout/LayoutLoader'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '../redux/reducer/misc'

const ConfirmDeleteDialog = lazy(()=> import("../components/dialogs/ConfirmDeleteDialog"))
const AddMemberDialog = lazy(()=> import("../components/dialogs/AddMemberDialog"))

const Groups = () => {
  const chatId= useSearchParams()[0].get("group")

  const dispatch = useDispatch();

  const myGroups = useMyGroupsQuery("");
  
  const groupDetails = useChatDetailsQuery({chatId, populate: true},{skip: !chatId});

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(useRenameGroupMutation)

  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(useRemoveGroupMemberMutation)


  const [deleteGroup, isLoadingleteGroup] = useAsyncMutation(useDeleteChatMutation)
  

  const { isAddMember} = useSelector((state)=>state.misc)
  
  const [groupName, setGroupName] = useState("")
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEdit,setIsEdit] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [members, setMembers] = useState([])

  const errors = [{
    isError: myGroups.isError,
    error: myGroups.error,
},{
  isError: groupDetails.isError,
  error: groupDetails.error,
}]


  useErrors(errors)

  useEffect(()=>{
    if(groupDetails.data){
      setGroupName(groupDetails.data.chat.name);
      setGroupNameUpdatedValue(groupDetails.data.chat.name);
      setMembers(groupDetails?.data?.chat?.members)
    }

    return () => {
      setGroupName("");
      setGroupNameUpdatedValue("");
      setMembers([])
      setIsEdit(false)
    }
  }, [groupDetails.data])
  const handleMobile = () => {
      setIsMobileMenuOpen((prev)=> !prev);
  }
  const updateGroupName = () => {
    updateGroup("Updating group name", {
      chatId,
      name: groupNameUpdatedValue
    })
    
  }
  const openConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(true);
  };

  const deleteHandler = ()=>{
    deleteGroup("Deleting group..", chatId)
  
    closeConfirmDeleteHandler();
    navigate("/groups")
  }

  const closeConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(false);
  };

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true));
  };

  const removeMemberHandler = (userId)=>{
    removeMember("Removing members", {chatId, userId})
  }

  
  useEffect(()=>{
    if(chatId){
    setGroupName(`Group name ${chatId}`)
    setGroupNameUpdatedValue(`Group name ${chatId}`)
    }
    return ()=>{
      setGroupName("");
      setGroupNameUpdatedValue("");
      setIsEdit(false);
    }
  },[chatId])
  const handleMobileClose = () => setIsMobileMenuOpen(false);
  const navigate = useNavigate();
  const navigateBack = ()=>{
        navigate("/");
  }
  const IconBtns = (<>
  <Box sx={{
    display: {
      sx: "block",
      sm: "none",
      position: "fixed",
      right: "1rem",
      top: "1rem"
    }
  }}>
  <IconButton onClick={handleMobile}>
  <Menu/>
</IconButton>
  </Box>
          


          <Tooltip title="back" >
            <IconButton sx={{position:"absolute", top:"2rem", left:"2rem", bgcolor:matBlack, color: "white" }} onClick={navigateBack}>
              <KeyboardBackspace/>
            </IconButton>
          </Tooltip>
  </>)

  const ButtonGroup = <Stack
  direction={{
    xs: "column-reverse",
    sm: "row",
  }}
  spacing={"1rem"}
  p={{
    xs: "0",
    sm: "1rem",
    md: "1rem 4rem",
  }}>
        <Button size='large' color='error' startIcon={<DeleteIcon/>} onClick={openConfirmDeleteHandler}>
          Delete Group
        </Button>
        <Button size='large' variant='contained' startIcon={<AddIcon/>} onClick={openAddMemberHandler}>
          Add Member
        </Button>
  </Stack>

  const GroupName = <Stack direction={"row"} alignItems={"center"} justifyContent={"center"} spacing={"1rem"} padding={"3rem"}>
    {isEdit? <>
      <TextField value={groupNameUpdatedValue} onChange={(e)=>{ setGroupNameUpdatedValue(e.target.value)}}/>
      <IconButton onClick={updateGroupName} disabled={isLoadingGroupName}>
        <DoneIcon/>
      </IconButton>
    </>:<>
      <Typography variant="h4" >{groupName}</Typography>
      <IconButton onClick={()=> setIsEdit(true)}><EditIcon/></IconButton>
    </>}
  </Stack>
  return myGroups.isLoading? <LayoutLoader/> :(
    <Grid container height={"100vh"}>
      <Grid
        item
        sx={{
          display: {
            xs: "none",
            sm: "block",
          },
          
        }}
        sm={4}
        
      > <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId} /> </Grid>
      <Grid item xs={12} sm={8} sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        padding: "1rem 3rem"
      }}>
        {IconBtns}
        { groupName && (
          <>
             {GroupName}
             <Typography margin={"2rem"} alignSelf={"flex-start"} variant="body1" >
             Members
             </Typography>
             <Stack
              maxWidth={"45rem"}
              width={"100%"}
              boxSizing={"border-box"}
              padding={{
                sm: "1rem",
                xs: "0",
                md: "1rem 4rem",
              }}
              spacing={"2rem"}
              height={"50vh"}
              overflow={"auto"}
            >
              {/* Members */}

              { isLoadingRemoveMember? <CircularProgress/>:
                members.map((i) => (
                  <UserItem
                    user={i}
                    key={i._id}
                    isAdded
                    styling={{
                      boxShadow: "0 0 0.5rem  rgba(0,0,0,0.2)",
                      padding: "1rem 2rem",
                      borderRadius: "1rem",
                    }}
                    handler={removeMemberHandler}
                  />
                ))
              }
            </Stack>

            {ButtonGroup}
          </>
        )}
      </Grid>

      {
        isAddMember &&  <Suspense fallback={<Backdrop open />}>
            <AddMemberDialog chatId={chatId} />
        </Suspense> 
      }

      {confirmDeleteDialog && <Suspense fallback={<Backdrop open />}>
        <ConfirmDeleteDialog open={confirmDeleteDialog} handleClose={closeConfirmDeleteHandler} deleteHandler={deleteHandler} />
      </Suspense>
      
      }

      <Drawer sx={{display: {xs:"block", sm: "none"}}} open={isMobileMenuOpen} onClose={handleMobileClose}><GroupsList w={"50vw"} myGroups={myGroups?.data?.groups} chatId={chatId} /></Drawer>
    </Grid>
  )
}

const GroupsList = ({ w = "100%", myGroups = [], chatId} ) => (
  <Stack width={w} sx={{backgroundImage:bgGradient, height:"100vh"}} >
    {myGroups.length > 0 ? (
      myGroups.map((group) => (
        <GroupListItem group={group} chatId={chatId} key={group._id} />
      ))
    ):(
      <Typography >
        No groups
      </Typography>
    )}
  </Stack>
)

const GroupListItem = memo(({ group, chatId }) => {
  const { name, avatar, _id } = group;

  return (
    <Link
      to={`?group=${_id}`}
      onClick={(e) => {
        if (chatId === _id) e.preventDefault();
      }}
    >
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <AvatarCard avatar={avatar} />
        <Typography>{name}</Typography>
      </Stack>
    </Link>
  );
    });

export default Groups
