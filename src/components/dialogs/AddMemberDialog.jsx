import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { sampleUsers } from '../../constants/sampleData'
import UserItem from '../shared/UserItem'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { useAddGroupMemberMutation, useAvailableFriendsQuery } from '../../redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '../../redux/reducer/misc'

const AddMemberDialog = ({ chatId}) => {

  const dispatch = useDispatch()

  const { isAddMember} = useSelector((state)=>state.misc)

  const {isLoading, data, isError, error} = useAvailableFriendsQuery(chatId)

  const [addMember, isLoadingAddMember] = useAsyncMutation(useAddGroupMemberMutation)
    
    const [selectMembers, setSelectMembers] = useState([]);

    const selectMemberHandler = (id) => {
    setSelectMembers(prev => (prev.includes(id) ? prev.filter((currElement) => currElement !== id): [...prev,id]));
  };

    
    const closeHandler = () => {
        setSelectMembers([]);
        
        dispatch(setIsAddMember(false))
    }
    const addMemberSubmitHandler = () => {
      addMember("Adding members...", {members: selectMembers, chatId})
        closeHandler();
    }

  useErrors([{isError, error}])

  return (
    <Dialog open={isAddMember} onClose={closeHandler}>
      <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
         <DialogTitle textAlign={"center"} >Add Member</DialogTitle>

         <Stack spacing={"1rem"}>
            {
                isLoading? <Skeleton/>:data?.friends?.length > 0 ?( data?.friends?.map(i=>(
                    <UserItem ker={i.id} user={i} handler={selectMemberHandler} isAdded={selectMembers.includes(i._id)}/>
                ))):(<Typography textAlign={"center"}>No friends</Typography>)
            }
         </Stack>
         <Stack direction={"row"} alignItems={"center"} justifyContent={"space-evenly"}>

         <Button color='error' onClick={closeHandler}>Cancel</Button>
         <Button onClick={addMemberSubmitHandler} variant='contained' disabled={isLoadingAddMember}>Submit Changes</Button>
         </Stack>
      </Stack>
    </Dialog>
  )
}

export default AddMemberDialog
