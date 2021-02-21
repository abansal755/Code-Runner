const vPillsTab = document.querySelector('#v-pills-tab');
const vPillsTabContent = document.querySelector('#v-pills-tab-content');
const addFileForm = document.querySelector('#add-file-form');

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

function addFileToPage(file){
    const idx = file.name.lastIndexOf('.');
    const extension = file.name.substr(idx+1);
    const name = file.name.substr(0,idx);
    
    const btn = document.createElement('button');
    btn.classList.add('nav-link');
    btn.id = `v-pills-${file._id}-tab`;
    btn.setAttribute('data-bs-toggle','pill');
    btn.setAttribute('data-bs-target',`#v-pills-${file._id}`);
    btn.textContent = file.name;
    vPillsTab.append(btn);

    const tab = document.createElement('div');
    tab.classList.add('tab-pane','fade','show');
    tab.id = `v-pills-${file._id}`;
    tab.innerHTML = `
        <form class="save-form">
            <div class="d-flex mb-2">
                <input type="text" class="form-control" name="name" value="${name}">
                <span class="mx-2">.</span>
                <input type="text" class="form-control" name="extension" value="${extension}" list="types-datalist">
            </div>
            <textarea name="data" class="form-control mb-2">${file.data}</textarea>
            <button class="btn btn-primary">Save</button>
        </form>
        <form class="mt-2 delete-form">
            <button class="btn btn-danger">Delete</button>
        </form`;
    const nameInput = tab.querySelector('input[name="name"]');
    const extensionInput = tab.querySelector('input[name="extension"]');
    const dataInput = tab.querySelector('textarea');
    tab.querySelector('form.save-form').addEventListener('submit',async e => {
        e.preventDefault();
        await updateFileRequest(file._id,nameInput.value,extensionInput.value,dataInput.value);
        btn.textContent = `${nameInput.value}.${extensionInput.value}`;
    })
    tab.querySelector('form.delete-form').addEventListener('submit',async e => {
        e.preventDefault();
        await deleteFileRequest(file._id);
        btn.remove();
        tab.remove();
    })
    vPillsTabContent.append(tab);
}

addFileForm.addEventListener('submit',async e => {
    e.preventDefault();
    const file = (await createFileRequest('new','cpp')).data;
    await addFileToPage(file);
});

(async function(){
    const files = (await getAllFilesRequest()).data;
    for(const file of files){
        const body = (await getFileRequest(file)).data;
        addFileToPage(body);
    }
})();