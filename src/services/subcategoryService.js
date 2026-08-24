import axios from "../api/axios";

const API="/department-sub-categories";

export const getSubCategories=(params)=>
axios.get(`${API}/all`,{params}).then(res=>res.data);

export const createSubCategory=(
data,
imageFile,
iconFile
)=>{

const formData=new FormData();

Object.keys(data).forEach(key=>{
formData.append(key,data[key]);
});

if(imageFile){
formData.append("image",imageFile);
}

if(iconFile){
formData.append("icon",iconFile);
}

return axios.post(`${API}/create`,formData,{
headers:{
"Content-Type":"multipart/form-data"
}
});
};

export const updateSubCategory=(
id,
data,
imageFile,
iconFile
)=>{

const formData=new FormData();

Object.keys(data).forEach(key=>{
formData.append(key,data[key]);
});

if(imageFile){
formData.append("image",imageFile);
}

if(iconFile){
formData.append("icon",iconFile);
}

return axios.put(`${API}/update/${id}`,formData,{
headers:{
"Content-Type":"multipart/form-data"
}
});
};

export const activateSubCategory=id=>
axios.patch(`${API}/activate/${id}`);

export const deactivateSubCategory=id=>
axios.patch(`${API}/deactivate/${id}`);

export const deleteSubCategory=id=>
axios.delete(`${API}/delete/${id}`);

export const resolveImageUrl=(image)=>{

if(!image) return "";

if(image.startsWith("http")) return image;

const base=import.meta.env.VITE_API_URL.replace("/api","");

return `${base}${image}`;
};