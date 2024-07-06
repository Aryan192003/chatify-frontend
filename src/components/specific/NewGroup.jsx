import { useInputValidation } from '6pp'
import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import {sampleUsers} from '../../constants/sampleData'
import UserItem from '../shared/UserItem'
import { useDispatch, useSelector } from 'react-redux'
import { useAvailableFriendsQuery, useNewGroupMutation } from '../../redux/api/api'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { setIsNewGroup } from '../../redux/reducer/misc'
import toast from 'react-hot-toast'
const NewGroup = () => {
  const groupName = useInputValidation("");
  const {isNewGroup} = useSelector((state)=>state.misc)
  const dispatch = useDispatch();

  const {isError, isLoading, error, data} = useAvailableFriendsQuery();

  const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation)

  const [members, setMembers] = useState(sampleUsers);
  const [selectMembers, setSelectMembers] = useState([]);

  const errors = [{
    isError,
    error
  }]

  useErrors(errors)

  const selectMemberHandler = (id) => {
    setSelectMembers(prev => (prev.includes(id) ? prev.filter((currElement) => currElement !== id): [...prev,id]));
  };
  

  const submitHandler = ()=>{
    if(!groupName.value) return toast.error("Group name is required");

    if(selectMembers.length<2) return toast.error("Atleast 2 members required")
    
  newGroup("Creating New Group ",{name: groupName.value, members: selectMembers})

    closeHandler();
  }

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <Dialog open={isNewGroup} onClose={closeHandler}>
      <Stack p={{xs: "1rem", sm: "2rem" }} width={"25rem"} gap={"2rem"} >
          <DialogTitle textAlign={"center"} variant="h4">New Group</DialogTitle>
          
          <TextField label="Group Name" value={groupName.value} onChange={groupName.changeHandler}/>
          <Typography variant='body1'>Members</Typography>
        <Stack>
        { isLoading? <Skeleton/>: data?.friends.map((i)=>(
          <UserItem user={i} key={i._id} handler={selectMemberHandler} isAdded={selectMembers.includes(i._id)} />
        ))}
        </Stack>
        <Stack direction={"row"} justifyContent={"space-evenly"}>
            <Button variant='outlined' color='error' size="large" onClick={closeHandler}>Cancel </Button>
            <Button variant='contained' size="large" onClick={submitHandler} disabled={isLoadingNewGroup} >Create </Button>
        </Stack>
      </Stack>
      
    </Dialog>
  )
}

export default NewGroup
