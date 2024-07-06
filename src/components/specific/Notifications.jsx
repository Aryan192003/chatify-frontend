import { Avatar, Button, Dialog, DialogTitle, ListItem, Skeleton, Stack, Typography } from '@mui/material'
import React from 'react'
import { memo } from 'react';
import { sampleNotification } from '../../constants/sampleData'
import { useAcceptFriendRequestMutation, useGetNotificationQuery } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setIsNotification } from '../../redux/reducer/misc';
import toast from 'react-hot-toast';

const Notifications = () => {
  const {isNotification} = useSelector((state)=> state.misc)

  const [acceptRequest] = useAcceptFriendRequestMutation()

  const {isLoading, data, error, isError} = useGetNotificationQuery();
  const dispatch = useDispatch();
  

  const friendRequestHandler = async({_id, accept}) => {

    dispatch(setIsNotification(false))
      try {
        const res = await acceptRequest({requestId: _id, accept});
        if(res.data?.success){
          toast(res.data.message);
        }
        else toast.success(res.data?.error || "Something went wrong")
      } catch (error) {
        toast.error("Something went wrong")
        console.log(error)
      }
  };

  const closeHandle = () => {
    dispatch(setIsNotification(false))
  }

  return (
    <Dialog open={isNotification} onClose={closeHandle} >
      <Stack p={{xs: "1rem", sm: "2rem" }} maxWidth={"25rem"} >
          <DialogTitle>Notifications</DialogTitle>
          {isLoading? (<Skeleton/>):<>
            {data?.requests.length > 0 ? (
            
              data?.requests.map(({sender, _id}) => <NotificationItem sender={sender} _id={_id} handler={friendRequestHandler} key={_id}/>)
            ):(
              <Typography textAlign={"center"}>0 Notification</Typography>
            )}
          </>}
      </Stack>
      
    </Dialog>
  )
}

const NotificationItem = memo(({sender, _id, handler }) => {
  const {name, avatar} = sender;
  return (
    <ListItem  >
        <Stack direction={"row"} alignItems={"center"} spacing={"1rem"} width={"100%"}>
            <Avatar src={avatar} /> 
            <Typography
              variant='body1'
              sx={{
                flexGrow: 1,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%"
              }}
            >
              {`${name} sent you a friend request`}
            </Typography>
            <Stack direction={{
              xs: "column",
              sm: "row",
            }}>
            <Button onClick={() => handler({_id, accept: true})} >Accept</Button>
            <Button color="error" onClick={() => handler({_id, accept: false})} >Reject</Button>
            </Stack>
        </Stack>
    </ListItem>
  )
})

export default Notifications
