import { FileOpen } from '@mui/icons-material';
import React from 'react'
import { transformImage } from '../../lib/features';

const RenderAttachment = (file,url) => {
  switch(file) {
    case "video":
        return <video src={url} preload="none" width={"200px"} controls />
        
    case "audio":
        return <audio src={url} preload="none"  controls />
        
    case "image":
        return <img src={transformImage(url, 200)} alt="Attachmant" width={"200px"}  height={"150px"} style={{objectFit: "contain"}} />;
        
    default:
        return <FileOpen/>
        
  }
}

export default RenderAttachment
