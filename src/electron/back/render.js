window.electronAPI.scanFile((event,files) => {
    const fileList = document.getElementById('fileList');
    const li = document.createElement('li');
    li.textContent = files;
    fileList.appendChild(li);
})
// {
//     const fileList = document.getElementById('fileList');
//     files.forEach((file) => {
//         const li = document.createElement('li');
//         li.textContent = file;
//         fileList.appendChild(li);
//     });
// }

// ipcRenderer.send('scanFiles');
