const vPillsTab = document.querySelector('#v-pills-tab');
const vPillsTabContent = document.querySelector('#v-pills-tab-content');
const addFileForm = document.querySelector('#add-file-form');
const consoleTextarea = document.querySelector('#console-textarea');
const runProjectForm = document.querySelector('#run-project-form');
const runProjectBtn = runProjectForm.querySelector('button');
const addFileName = document.querySelector('#add-file-name');
const addFileExtension = document.querySelector('#add-file-extension');
const newFileModalClose = document.querySelector('#new-file-modal-close');

async function getAllFilesRequest(){
    return axios.get(`/api/projects/${project._id}/files`);
}

async function getFileRequest(fileId){
    return axios.get(`/api/projects/${project._id}/files/${fileId}`);
}

async function createFileRequest(name,extension){
    const body = new URLSearchParams();
    body.append('name',name);
    body.append('extension',extension);
    return axios.post(`/api/projects/${project._id}/files`,body.toString());
}

async function updateFileRequest(fileId,name,extension,data){
    const body = new URLSearchParams();
    body.append('name',name);
    body.append('extension',extension);
    body.append('data',data);
    return axios.put(`/api/projects/${project._id}/files/${fileId}`,body.toString());
}

async function deleteFileRequest(fileId){
    return axios.delete(`/api/projects/${project._id}/files/${fileId}`);
}

async function runProject(){
    return axios.get(`/api/projects/${project._id}/run`);
}

function addFileToPage(file){
    const idx = file.name.lastIndexOf('.');
    const extension = file.name.substr(idx+1);
    const name = file.name.substr(0,idx);
    
    const btn = document.createElement('button');
    btn.classList.add('nav-link','mb-2');
    btn.id = `v-pills-${file._id}-tab`;
    btn.setAttribute('data-bs-toggle','pill');
    btn.setAttribute('data-bs-target',`#v-pills-${file._id}`);
    btn.textContent = file.name;
    const unsaveDot = document.createElement('sup');
    unsaveDot.innerHTML = ' <i class="bi bi-circle-fill text-warning"></i>';
    btn.style.boxShadow = '0px 0px 21px -2px #0000001f';
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
            <div class="mb-2" id="editor-${file._id}" style="height: 500px; border: 1px solid #ced4da; border-radius: .25rem; font-size: 1rem;"></div>
            <button class="btn btn-primary btn-save">Save</button>
            <button class="btn btn-danger btn-delete">Delete</button>
        </form>`;
    const nameInput = tab.querySelector('input[name="name"]');
    const extensionInput = tab.querySelector('input[name="extension"]');
    const saveBtn = tab.querySelector('.btn-save');
    const editorDiv = tab.querySelector(`#editor-${file._id}`);
    const editor = ace.edit(editorDiv);
    editor.session.setValue(file.data);
    if(project.type === 'c++') editor.session.setMode('ace/mode/c_cpp');
    else if(project.type === 'nodejs') editor.session.setMode('ace/mode/javascript');
    editor.session.on('change',() => {
        btn.append(unsaveDot);
    })
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    tab.querySelector('form.save-form').addEventListener('submit',async e => {
        e.preventDefault();
        await updateFileRequest(file._id,nameInput.value,extensionInput.value,editor.getValue());
        btn.textContent = `${nameInput.value}.${extensionInput.value}`;
        unsaveDot.remove();
    });
    tab.querySelector('.btn-delete').addEventListener('click',async () => {
        await deleteFileRequest(file._id);
        btn.remove();
        tab.remove();
    });
    nameInput.addEventListener('input',() => {
        btn.append(unsaveDot);
    });
    extensionInput.addEventListener('input',() => {
        btn.append(unsaveDot);
    });
    vPillsTabContent.append(tab);
    function keyboardShortcuts(e){
        if(e.code === 'KeyS' && e.ctrlKey){
            saveBtn.click();
            e.preventDefault();
        }else if(e.code === 'KeyR' && e.ctrlKey){
            runProjectBtn.click();
            e.preventDefault();
        }
    }
    editorDiv.addEventListener('keydown',keyboardShortcuts);
    nameInput.addEventListener('keydown',keyboardShortcuts);
    extensionInput.addEventListener('keydown',keyboardShortcuts);
}

addFileForm.addEventListener('submit',async e => {
    e.preventDefault();
    const file = (await createFileRequest(addFileName.value,addFileExtension.value)).data;
    addFileForm.reset();
    newFileModalClose.click();
    await addFileToPage(file);
});

runProjectForm.addEventListener('submit',async e => {
    e.preventDefault();
    const data = (await runProject()).data;
    consoleTextarea.textContent = data;
});

newFileModalClose.addEventListener('click',() => {
    addFileForm.reset();
});

(async function(){
    const files = (await getAllFilesRequest()).data;
    for(const file of files){
        const body = (await getFileRequest(file)).data;
        addFileToPage(body);
    }
})();