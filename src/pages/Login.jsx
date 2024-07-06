
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material'
import React, { useState } from 'react'
import { VisuallyHiddenInput } from '../components/styles/StyledComponents';
import { useFileHandler, useInputValidation, useStrongPassword} from "6pp"
import { usernameValidator } from '../utils/validators';
import { useDispatch } from 'react-redux';
import { userExists } from '../redux/reducer/auth';
import toast from 'react-hot-toast';
import axios from 'axios';
import { server } from '../constants/config';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isloading, setIsloading] = useState(false);

    const toggleLogin = ()=>{
         setIsLogin(!isLogin);
    };

    const name = useInputValidation("");
    const bio = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    //const password = useStrongPassword();
    const password = useInputValidation("")
    const avatar = useFileHandler("single")
    const dispatch = useDispatch();

    const handleLogin = async(e) => {
      e.preventDefault();
      setIsloading(true);

      const config ={
        
      };

      try {
        const { data } = await axios.post(
          `${server}/api/v1/user/login`,
          {
            username: username.value,
            password: password.value
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
    
        dispatch(userExists(data.user));
        toast.success(data.message);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong")
      }finally{setIsloading(false)}
      
    }
    const handleSignUp = async(e) => {
      e.preventDefault();
      setIsloading(true);
      const formData = new FormData();
      formData.append("avatar", avatar.file);
      formData.append("name", name.value);
      formData.append("bio", bio.value);
      formData.append("username", username.value);
      formData.append("password", password.value);
      
      try {
        const {data} = await axios.post(`${server}/api/v1/user/new`, 
          formData, {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        dispatch(userExists(data.user));
        toast.success(data.message) 
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong")
      }finally{setIsloading(false)}
    }
  return (
    <div 
    style={{
      backgroundImage: "linear-gradient(rgb(225,225,209), rgb(249 159 159))"
    }}
    >
    <Container component={"main"} maxWidth="md"
    sx={{
      height:"100vh",
      display: "flex",
      justifyContent: "center",
      alignItems:"center"
    }}
    >
      <Paper elevation={3} sx={{
        padding:4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        { isLogin? 
        <>
           <Typography variant='h5'>Login</Typography>
           <form onSubmit={handleLogin}>
            <TextField
             required fullWidth label="Username" margin='normal' variant='outlined' value={username.value} onChange={username.changeHandler}
            />
            <TextField
             required fullWidth label="Password" type='password' margin='normal' variant='outlined' value={password.value} onChange={password.changeHandler}
            />
            <Button  variant="contained" color='primary' type='submit' fullWidth disabled={isloading} >Login</Button>
            <Typography textAlign={'center'} m={"1rem"} >Or</Typography>
            <Button fullWidth variant='text' onClick={toggleLogin} disabled={isloading} >Sign Up</Button>
           </form>
        
        </> : 
        <>
        <Typography variant='h5'>Sign Up</Typography>
        <form style={{width: "100%", marginTop: "1rem"}} onSubmit={handleSignUp} >
          <Stack position={"relative"} width={"10rem"} margin={"auto"}>
            <Avatar sx={{width:"10rem", height: "10rem", objectFit:"contain"}} src={avatar.preview}/>
            {avatar.error && (
          <Typography color="error" variant="caption"> {avatar.error}</Typography>          

         )}
            <IconButton sx={{position:"absolute", bottom:"0", right:"0", color:"white", bgcolor:"rgba(0,0,0,0.5)", ":hover":{bgcolor: "rgb(0,0,0,0.7",},}} component="label" >
              <>
                <CameraAltIcon/>
                <VisuallyHiddenInput type="file" onChange={avatar.changeHandler} />
              </>
            </IconButton>
          </Stack>
         <TextField
          required fullWidth label="Name" margin='normal' variant='outlined' value={name.value} onChange={name.changeHandler}
         />
         <TextField
          required fullWidth label="Username" margin='normal' variant='outlined' value={username.value} onChange={username.changeHandler}
         />
         {username.error && (
          <Typography color="error" variant="caption"> {username.error}</Typography>          

         )}
         <TextField
          required fullWidth label="Bio" margin='normal' variant='outlined' value={bio.value} onChange={bio.changeHandler}
         />
         <TextField
          required fullWidth label="Password" type='password' margin='normal' variant='outlined' value={password.value} onChange={password.changeHandler} 
         />
         {/* {password.error && (
          <Typography color="error" variant="caption"> {password.error}</Typography>          

         )} */}
         <Button  variant="contained" color='primary' type='submit' fullWidth disabled={isloading} >Sign Up</Button>
         <Typography textAlign={'center'} m={"1rem"} >Or</Typography>
         <Button fullWidth variant='text' onClick={toggleLogin} disabled={isloading} >Login</Button>
        </form>
     
        </>
        }
      </Paper>
    </Container>
    </div>
  )
}

export default Login
