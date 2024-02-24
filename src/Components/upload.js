import React,{ useState} from 'react';
import { useLocation } from 'react-router-dom';
import axios from'axios';
import FileBase64 from 'react-file-base64';
const Upload = () => {
  const location = useLocation();
  const { data } = location.state || {}; 
    const userdata=data;
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImagelink, setProductImageLink] = useState('');
    const [rate,setrate]=useState('')
  const  handleupload= async ()=>{
    setProductImageLink(productImage.base64);
    try {
        const response =     await axios.post('http://localhost:8000/upload', {userdata,productId,productName,productImagelink,productDescription,rate});
        if(response.status==201){
        }
      } catch (error) {
        console.error(error);
      }
   

  }
  return (
    <div>
      <h2>Upload Product</h2>
     
        <label>
          Product ID:
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          />
        </label>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>
        <label>
          Product Image:
          <FileBase64
        onDone={(files) => setProductImage(files)}/>
        </label>
        <label>
          Product Description:
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />
        </label>
        <label>
          Product Description:
          <input type="number"
            value={rate}
            onChange={(e) => setrate(e.target.value)}
            required
          />
        </label>
        <button  onClick={handleupload} >Upload Product</button>
      
    </div>
  );
};

export default Upload;
