async function getAllFilesRequest(){
    return axios.get(`/api/projects/${id}/files`);
}

async function getFileRequest(fileId){
    return axios.get(`/api/projects/${id}/files/${fileId}`);
}

async function createFileRequest(name,extension){
    const body = new URLSearchParams();
    body.append('name',name);
    body.append('extension',extension);
    return axios.post(`/api/projects/${id}/files`,body.toString());
}

async function updateFileRequest(fileId,name,extension,data){
    const body = new URLSearchParams();
    body.append('name',name);
    body.append('extension',extension);
    body.append('data',data);
    return axios.put(`/api/projects/${id}/files/${fileId}`,body.toString());
}

async function deleteFileRequest(fileId){
    return axios.delete(`/api/projects/${id}/files/${fileId}`);
}